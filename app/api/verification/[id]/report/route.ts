import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { buildVerificationDraft } from "@/lib/verification/report-docx";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const { id } = await params;
  if (!token || !url || !key || !/^\d+$/.test(id)) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const supabase = createClient(url, key, { db: { schema: "donelvit" }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token); if (!user) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const { data: item } = await supabase.from("verification_cases").select("title,discipline,status,project_code,projects(title)").eq("id", Number(id)).single();
  if (!item) return NextResponse.json({ error: "Досье не найдено." }, { status: 404 });
  const [findings, calculations, files] = await Promise.all([supabase.from("verification_findings").select("code,section,normative_reference,assessment,severity,correction").eq("verification_case_id", Number(id)).order("sort_order"), supabase.from("verification_calculations").select("title,conclusion,review_status").eq("verification_case_id", Number(id)), supabase.from("verification_files").select("file_name,document_role").eq("verification_case_id", Number(id))]);
  const projects = item.projects as unknown as { title: string } | { title: string }[] | null;
  const project = Array.isArray(projects) ? projects[0]?.title : projects?.title;
  const report = await buildVerificationDraft({ title: item.title, project: project ?? "—", code: item.project_code, discipline: item.discipline, status: item.status, findings: findings.data ?? [], calculations: calculations.data ?? [], files: files.data ?? [] });
  return new NextResponse(new Uint8Array(report), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`Отчёт_верификации_${id}.docx`)}`, "Cache-Control": "private, no-store" } });
}
