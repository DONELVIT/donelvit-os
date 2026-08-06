import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verificationProfiles } from "@/lib/verification/catalog";

export const runtime = "nodejs";
export const maxDuration = 60;
const maxBytes = 4 * 1024 * 1024;
const schema = { type: "object", additionalProperties: false, required: ["summary", "coverage", "findings", "limitations"], properties: { summary: { type: "string" }, coverage: { type: "string" }, findings: { type: "array", items: { type: "object", additionalProperties: false, required: ["title", "category", "severity", "normative_reference", "evidence", "recommendation"], properties: { title: { type: "string" }, category: { type: "string", enum: ["fire_safety", "documentation"] }, severity: { type: "string", enum: ["critical", "major", "normal", "minor"] }, normative_reference: { type: "string" }, evidence: { type: "string" }, recommendation: { type: "string" } } } }, limitations: { type: "array", items: { type: "string" } } } };

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY; if (!key) return NextResponse.json({ error: "Анализ не настроен: добавьте OPENAI_API_KEY в Vercel." }, { status: 503 });
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anon) return NextResponse.json({ error: "Требуется авторизованная сессия сотрудника." }, { status: 401 });
  const auth = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: { user } } = await auth.auth.getUser(token); if (!user) return NextResponse.json({ error: "Сессия сотрудника недействительна." }, { status: 401 });
  const form = await request.formData(); const file = form.get("file"), profileId = String(form.get("profile") ?? "");
  if (!(file instanceof File) || !["pdf", "docx"].includes(file.name.split(".").pop()?.toLowerCase() ?? "")) return NextResponse.json({ error: "Поддерживаются только PDF и DOCX файлы." }, { status: 400 });
  if (!file.size || file.size > maxBytes) return NextResponse.json({ error: "Размер файла должен быть не более 4 МБ." }, { status: 413 });
  const profile = verificationProfiles.find((item) => item.id === profileId); if (!profile) return NextResponse.json({ error: "Неизвестный профиль объекта." }, { status: 400 });
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64"); const mime = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  const instruction = `Ты проводишь внутреннюю верификацию проектной документации по пожарной безопасности Республики Молдова для категории «${profile.name}». Проверь только то, что подтверждается или отсутствует в представленном файле. Выявляй пожарно-технические несоответствия и неполноту документации. Для каждого вывода укажи точную нормативную ссылку только если уверен; иначе напиши «требует уточнения по действующей редакции». Не выдумывай сведения, не выдавай результат за официальную экспертизу. Дай практическую рекомендацию по устранению. Профиль пожарной безопасности: ${profile.fireSafetyChecks.join(" ")} Профиль документации: ${profile.documentationChecks.join(" ")}`;
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-5.6-terra", max_output_tokens: 4000, input: [{ role: "user", content: [{ type: "input_file", filename: file.name, file_data: `data:${mime};base64,${base64}`, ...(file.name.toLowerCase().endsWith(".pdf") ? { detail: "high" } : {}) }, { type: "input_text", text: instruction }] }], text: { format: { type: "json_schema", name: "verification_report", strict: true, schema } } }) });
  const payload: any = await response.json(); if (!response.ok) return NextResponse.json({ error: payload?.error?.message ?? "OpenAI не смог обработать документ." }, { status: 502 });
  const output = payload.output_text ?? payload.output?.flatMap((item: any) => item.content ?? []).find((item: any) => item.type === "output_text")?.text;
  try { return NextResponse.json({ report: JSON.parse(output) }); } catch { return NextResponse.json({ error: "Модель вернула ответ в неожиданном формате. Повторите анализ." }, { status: 502 }); }
}
