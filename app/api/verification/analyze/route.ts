import { del, issueSignedToken, presignUrl } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verificationProfiles } from "@/lib/verification/catalog";

export const runtime = "nodejs";
export const maxDuration = 300;

const schema = { type: "object", additionalProperties: false, required: ["summary", "coverage", "findings", "limitations"], properties: { summary: { type: "string" }, coverage: { type: "string" }, findings: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "category", "severity", "normative_reference", "evidence", "recommendation"], properties: { title: { type: "string" }, category: { type: "string", enum: ["fire_safety", "documentation"] }, severity: { type: "string", enum: ["critical", "major", "normal", "minor"] }, normative_reference: { type: "string" }, evidence: { type: "string" }, recommendation: { type: "string" } } } }, limitations: { type: "array", items: { type: "string" } } } };

type AnalyzeInput = { pathname?: unknown; filename?: unknown; profile?: unknown };

async function getUser(accessToken: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !url || !anon) return null;
  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await auth.auth.getUser(accessToken);
  return user;
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Анализ не настроен: добавьте OPENAI_API_KEY в Vercel." }, { status: 503 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  const user = await getUser(token);
  if (!user) return NextResponse.json({ error: "Требуется авторизованная сессия сотрудника." }, { status: 401 });

  const input = (await request.json()) as AnalyzeInput;
  const pathname = typeof input.pathname === "string" ? input.pathname : "";
  const filename = typeof input.filename === "string" ? input.filename : "";
  const profileId = typeof input.profile === "string" ? input.profile : "";
  const extension = filename.split(".").pop()?.toLowerCase();
  const profile = verificationProfiles.find((item) => item.id === profileId);

  if (!pathname.startsWith(`verification/${user.id}/`) || !["pdf", "docx"].includes(extension ?? "") || !profile) {
    return NextResponse.json({ error: "Некорректные параметры проверки." }, { status: 400 });
  }

  try {
    const validUntil = Date.now() + 10 * 60 * 1000;
    const signedToken = await issueSignedToken({ pathname, operations: ["get"], validUntil });
    const { presignedUrl } = await presignUrl(signedToken, { operation: "get", pathname, access: "private", validUntil, useCache: false });
    const instruction = `Ты — инженерный AI-агент DONELVIT для внутренней верификации проектной документации по пожарной безопасности Республики Молдова. Проверь документ для категории «${profile.name}». Выявляй только то, что подтверждается или отсутствует в файле. Проверь пожарно-технические требования и полноту документации. Для каждого вывода укажи точную нормативную ссылку, только если уверен; иначе напиши «требует уточнения по действующей редакции». Не выдумывай сведения и не выдавай результат за официальную экспертизу. Дай практическую рекомендацию по устранению. Профиль пожарной безопасности: ${profile.fireSafetyChecks.join(" ")} Профиль документации: ${profile.documentationChecks.join(" ")}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.6-terra",
        max_output_tokens: 4000,
        input: [{ role: "user", content: [{ type: "input_file", file_url: presignedUrl, ...(extension === "pdf" ? { detail: "high" } : {}) }, { type: "input_text", text: instruction }] }],
        text: { format: { type: "json_schema", name: "verification_report", strict: true, schema } },
      }),
    });
    const payload: any = await response.json();
    if (!response.ok) return NextResponse.json({ error: payload?.error?.message ?? "OpenAI не смог обработать документ." }, { status: 502 });
    const output = payload.output_text ?? payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
    try {
      return NextResponse.json({ report: JSON.parse(output) });
    } catch {
      return NextResponse.json({ error: "Модель вернула ответ в неожиданном формате. Повторите анализ." }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось выполнить анализ.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    await del(pathname).catch(() => undefined);
  }
}
