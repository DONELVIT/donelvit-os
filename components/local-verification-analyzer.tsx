"use client";

import PizZip from "pizzip";
import { FormEvent, useState } from "react";
import { FileSearch, FileUp, LoaderCircle, ShieldCheck } from "lucide-react";
import { verificationProfiles } from "@/lib/verification/catalog";

type Category = "fire_safety" | "documentation";
type Finding = { title: string; category: Category; normativeReference: string; evidence: string; recommendation: string };
type LocalReport = { summary: string; coverage: string; findings: Finding[]; limitations: string[] };

const maxBytes = 25 * 1024 * 1024;
const labels: Record<Category, string> = { fire_safety: "Пожарная безопасность", documentation: "Документация" };

async function extractPdfText(file: File) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
  const document = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const text = await (await document.getPage(pageNumber)).getTextContent();
    pages.push(text.items.map((item) => ("str" in item ? item.str : "")).join(" "));
  }
  return pages.join("\n");
}

async function extractDocxText(file: File) {
  const zip = new PizZip(await file.arrayBuffer());
  const document = zip.file("word/document.xml")?.asText() ?? "";
  return document.replace(/<w:tab\/?\s*>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
}

async function extractBinaryText(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return [new TextDecoder("windows-1251").decode(bytes), new TextDecoder("utf-16le").decode(bytes)]
    .map((text) => text.replace(/[^\p{L}\p{N}\s.,:;()/_-]/gu, " ").replace(/\s+/g, " "))
    .join(" ");
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}

function buildReport(text: string, profileId: string, extension: string): LocalReport {
  const normalized = text.toLocaleLowerCase("ru-RU");
  const residential = profileId === "residential";
  const rules: Array<{ title: string; category: Category; reference: string; terms: string[]; recommendation: string }> = [
    { title: "Пути эвакуации и выходы", category: "fire_safety", reference: "NCM E.03.03-2018 / требует проверки применимости", terms: ["эвакуац", "эвакуацион", "выход"], recommendation: "Добавьте или уточните планы, расчёт и обозначения путей эвакуации и выходов." },
    { title: "Система пожарной сигнализации", category: "fire_safety", reference: "NCM E.03.03-2018", terms: ["пожарн", "сигнализац", "извещател"], recommendation: "Добавьте технические решения, планы размещения извещателей и описание алгоритмов пожарной сигнализации." },
    { title: "Оповещение о пожаре", category: "fire_safety", reference: "NCM E.03.03-2018", terms: ["оповещ", "соуэ", "warning"], recommendation: "Укажите тип, зоны, оборудование и сценарии системы оповещения о пожаре." },
    { title: "Адресные линии и автоматика", category: "fire_safety", reference: "NCM G.02.01:2017; NCM E.03.03-2018", terms: ["адресн", "шлейф", "линия связи", "автоматик"], recommendation: "Представьте адресную таблицу, схему линий и логику взаимодействия автоматики." },
    { title: "Кабельные трассы и слаботочные системы", category: "fire_safety", reference: "NCM G.02.01:2017", terms: ["кабель", "слаботоч", "коммуникац"], recommendation: "Добавьте трассировку, марки кабеля, способ прокладки и увязку коммуникационных систем." },
    { title: "Спецификации и ведомости", category: "documentation", reference: "Полнота проектной документации", terms: ["спецификац", "ведомост", "экспликац"], recommendation: "Добавьте спецификации оборудования, кабелей и ведомости, необходимые для проверки решений." },
  ];
  if (residential) rules.push({ title: "Требования к жилому зданию", category: "fire_safety", reference: "NCM C.01.08:2025", terms: ["квартир", "жил", "блок"], recommendation: "Укажите решения, подтверждающие применимость требований NCM C.01.08:2025 к жилому объекту." });

  const findings = rules.filter((rule) => !hasAny(normalized, rule.terms)).map((rule) => ({
    title: `Не найдено подтверждение: ${rule.title}`,
    category: rule.category,
    normativeReference: rule.reference,
    evidence: "В извлечённом локально тексте не обнаружены характерные термины или разделы.",
    recommendation: rule.recommendation,
  }));
  const limitations = ["Локальная проверка выполняется правилами поиска по извлечённому тексту и не заменяет инженерный расчёт или экспертизу."];
  if (!text.trim()) limitations.push("Текст не извлечён: вероятно, документ является сканом. Для него потребуется OCR или ручная проверка.");
  if (extension === "doc" || extension === "dwg") limitations.push("Для DOC и DWG локально извлекаются только доступные текстовые подписи, таблицы и служебные строки; геометрия чертежа, растровые листы и расчёты требуют ручной проверки.");
  if (!residential) limitations.push("NCM C.01.08:2025 показан как обязательная база, но для выбранного не-жилого профиля отмечается как не применимый.");

  return {
    summary: findings.length ? `Локальная проверка выявила ${findings.length} пункт(а), которые требуют ручного подтверждения в проекте.` : "Локальный поиск нашёл подтверждающие термины по базовым правилам. Это не является подтверждением полного соответствия.",
    coverage: `Извлечено ${text.trim().length.toLocaleString("ru-RU")} символов; проверены ${rules.length} базовых правил.`,
    findings,
    limitations,
  };
}

export function LocalVerificationAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState(verificationProfiles[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<LocalReport | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReport(null);
    if (!file) return setError("Выберите PDF, DOCX, DOC или DWG файл проекта.");
    if (file.size > maxBytes) return setError("Для локальной проверки размер файла не должен превышать 25 МБ.");
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["pdf", "docx", "doc", "dwg"].includes(extension)) return setError("Поддерживаются PDF, DOCX, DOC и DWG.");
    setBusy(true);
    try {
      const text = extension === "pdf" ? await extractPdfText(file) : extension === "docx" ? await extractDocxText(file) : await extractBinaryText(file);
      setReport(buildReport(text, profile, extension));
    } catch {
      setError("Не удалось извлечь текст документа локально. Проверьте файл или используйте PDF/DOCX с текстовым слоем.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-6 shadow-panel">
    <div className="flex items-start gap-3"><ShieldCheck className="mt-1 text-emerald-700"/><div><p className="text-sm font-semibold text-emerald-800">Без внешнего AI</p><h2 className="text-xl font-bold">Локальная проверка проекта</h2><p className="mt-1 text-sm text-slate-600">Файл обрабатывается в браузере: не загружается на сервер, в Vercel Blob или OpenAI и не сохраняется. PDF, DOCX, DOC и DWG до 25 МБ.</p></div></div>
    <form className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={submit}>
      <label className="input flex cursor-pointer items-center gap-3 bg-white"><FileUp size={18} className="text-slate-500"/><span className="truncate">{file?.name || "Выбрать PDF, DOCX, DOC или DWG"}</span><input className="sr-only" type="file" accept=".pdf,.docx,.doc,.dwg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/vnd.dwg" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/></label>
      <select className="input bg-white" value={profile} onChange={(event) => setProfile(event.target.value)}>{verificationProfiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
      <button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? <><LoaderCircle className="animate-spin" size={18}/>Проверка…</> : <><FileSearch size={18}/>Проверить локально</>}</button>
    </form>
    {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    {report && <div className="mt-6 space-y-4 border-t border-emerald-200 pt-5"><div><h3 className="font-bold">Результат локальной проверки</h3><p className="mt-1 text-sm text-slate-700">{report.summary}</p><p className="mt-1 text-xs text-slate-500">{report.coverage}</p></div>{report.findings.map((finding) => <article key={finding.title} className="rounded-xl border bg-white p-4 text-sm"><div className="font-semibold">{finding.title}</div><p className="mt-2 text-slate-600">{labels[finding.category]} · {finding.normativeReference}</p><p className="mt-2"><span className="text-slate-500">Основание: </span>{finding.evidence}</p><p className="mt-2"><span className="text-slate-500">Рекомендация: </span>{finding.recommendation}</p></article>)}<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><ul className="list-disc space-y-1 pl-5">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div></div>}
  </section>;
}
