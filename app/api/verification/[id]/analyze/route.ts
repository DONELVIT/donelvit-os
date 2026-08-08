import { get } from "@vercel/blob";
import PizZip from "pizzip";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const rules = [
  { code: "AUTO-PS-01", section: "Пожарная сигнализация", terms: ["пожарн", "извещател", "апс"], requirement: "В файлах должны быть подтверждения состава и размещения пожарной сигнализации." },
  { code: "AUTO-PS-02", section: "Оповещение", terms: ["оповещ", "соуэ", "сирен"], requirement: "В файлах должны быть подтверждения системы оповещения и её зон." },
  { code: "AUTO-PS-03", section: "Пожаротушение", terms: ["пожаротуш", "тушени", "спринклер", "газов"], requirement: "В файлах должны быть подтверждения установки и алгоритма пожаротушения." },
  { code: "AUTO-PS-04", section: "Схемы и адресация", terms: ["адресн", "шлейф", "схем", "линия"], requirement: "В файлах должны быть схемы или данные об адресации/линиях систем." },
  { code: "AUTO-PS-05", section: "Электропитание", terms: ["аккумулятор", "резервн", "питан", "а·ч"], requirement: "В файлах должны быть данные о рабочем и резервном питании системы." },
];

function extractDocxText(buffer: Buffer) {
  const xml = new PizZip(buffer).file("word/document.xml")?.asText() ?? "";
  return xml.replace(/<w:tab\/>/g, " ").replace(/<w:br\/>/g, " ").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").toLowerCase();
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, ""); const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; const { id } = await params;
  if (!token || !url || !key || !/^\d+$/.test(id)) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const supabase = createClient(url, key, { db: { schema: "donelvit" }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token); if (!user) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single();
  if (roleRow?.role !== "admin" && roleRow?.role !== "engineer") return NextResponse.json({ error: "Требуется роль инженера или администратора." }, { status: 403 });
  const { data: files } = await supabase.from("verification_files").select("file_name,content_type,size_bytes,blob_url").eq("verification_case_id", Number(id));
  const docxFiles = (files ?? []).filter((file) => file.content_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" && file.size_bytes <= 10 * 1024 * 1024);
  if (!docxFiles.length) return NextResponse.json({ error: "Для автоматического анализа загрузите хотя бы один DOCX-файл до 10 МБ." }, { status: 400 });
  let text = "";
  for (const file of docxFiles) { const result = await get(file.blob_url, { access: "private" }); if (result?.statusCode === 200 && result.stream) text += ` ${extractDocxText(Buffer.from(await new Response(result.stream).arrayBuffer()))}`; }
  const rows = rules.map((rule, index) => { const matched = rule.terms.some((term) => text.includes(term)); return { verification_case_id: Number(id), code: rule.code, section: rule.section, normative_reference: "Автоматическая предварительная проверка — подтвердить применимый пункт нормы вручную", requirement: rule.requirement, project_data: matched ? "Ключевые слова найдены в загруженном DOCX; проверьте контекст, планы и схемы." : "Ключевые слова в доступном тексте DOCX не найдены; проверьте файлы вручную.", assessment: matched ? "risk" : "incomplete", severity: matched ? "minor" : "normal", risk: "Автоматический поиск текста не подтверждает проектное решение и не анализирует чертежи.", correction: matched ? "Проверить полноту и соответствие решения на планах/схемах." : "Добавить или указать подтверждающие документы, схемы либо пояснения.", priority: "recommended", status: "open", sort_order: 500 + index }; });
  const { error } = await supabase.from("verification_findings").upsert(rows, { onConflict: "verification_case_id,code" });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ analyzedFiles: docxFiles.length, findings: rows.length, message: "Предварительный анализ завершён. Все результаты требуют ручной инженерной проверки." });
}
