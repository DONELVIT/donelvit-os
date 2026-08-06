"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, FileUp, LoaderCircle, Sparkles } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { createClient } from "@/lib/supabase/client";
import { verificationProfiles } from "@/lib/verification/catalog";

type Finding = { title: string; category: "fire_safety" | "documentation"; severity: "critical" | "major" | "normal" | "minor"; normative_reference: string; evidence: string; recommendation: string };
type Analysis = { summary: string; coverage: string; findings: Finding[]; limitations: string[] };
const maxBytes = 50 * 1024 * 1024;
const labels = { fire_safety: "Пожарная безопасность", documentation: "Документация", critical: "Критическое", major: "Существенное", normal: "Обычное", minor: "Незначительное" };

export function VerificationAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState(verificationProfiles[0].id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<Analysis | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setReport(null);
    if (!file) return setError("Выберите PDF или DOCX файл проекта.");
    if (file.size > maxBytes) return setError("Размер одного файла для анализа не должен превышать 50 МБ.");
    const supabase = createClient(); if (!supabase) return setError("Сервис авторизации не настроен.");
    const { data } = await supabase.auth.getSession(); if (!data.session) return setError("Войдите в систему, чтобы анализировать проектную документацию.");
    setBusy(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const blob = await upload(`verification/${data.session.user.id}/${safeName}`, file, {
        access: "private",
        handleUploadUrl: "/api/verification/upload",
        clientPayload: data.session.access_token,
        multipart: true,
      });
      const response = await fetch("/api/verification/analyze", { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" }, body: JSON.stringify({ pathname: blob.pathname, filename: file.name, profile }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload.error || "Не удалось выполнить анализ.");
      setReport(payload.report as Analysis);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось выполнить анализ."); }
    finally { setBusy(false); }
  }

  return <section className="rounded-2xl border bg-white p-6 shadow-panel"><div className="flex items-start gap-3"><Sparkles className="mt-1 text-red-700"/><div><h2 className="text-xl font-bold">Проверить файл проекта</h2><p className="mt-1 text-sm text-slate-500">PDF или DOCX до 50 МБ. Файл загружается в приватное временное хранилище, доступ к нему выдаётся AI только на время анализа, затем файл автоматически удаляется.</p></div></div><form className="mt-5 grid gap-4 md:grid-cols-[1fr_220px_auto]" onSubmit={submit}><label className="input flex cursor-pointer items-center gap-3"><FileUp size={18} className="text-slate-500"/><span className="truncate">{file?.name || "Выбрать PDF или DOCX"}</span><input className="sr-only" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => setFile(event.target.files?.[0] ?? null)}/></label><select className="input" value={profile} onChange={(event) => setProfile(event.target.value)}>{verificationProfiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white disabled:opacity-60">{busy ? <><LoaderCircle className="animate-spin" size={18}/>Анализ…</> : "Провести верификацию"}</button></form>{error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}{report && <Report report={report}/>}</section>;
}

function Report({ report }: { report: Analysis }) { return <div className="mt-6 space-y-5 border-t pt-6"><div><h3 className="text-lg font-bold">Результат проверки</h3><p className="mt-2 text-slate-700">{report.summary}</p><p className="mt-2 text-sm text-slate-500">Охват: {report.coverage}</p></div>{report.findings.length ? <div className="space-y-3">{report.findings.map((finding, index) => <article key={`${finding.title}-${index}`} className="rounded-xl border p-4"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">{finding.title}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{labels[finding.category]}</span><span className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-800">{labels[finding.severity]}</span></div><dl className="mt-3 grid gap-3 text-sm md:grid-cols-2"><div><dt className="text-slate-500">Нормативная ссылка</dt><dd>{finding.normative_reference}</dd></div><div><dt className="text-slate-500">Основание в файле</dt><dd>{finding.evidence}</dd></div><div className="md:col-span-2"><dt className="text-slate-500">Рекомендация</dt><dd>{finding.recommendation}</dd></div></dl></article>)}</div> : <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">Явных несоответствий в доступной части документа не выявлено. Проверьте ограничения анализа ниже.</p>}{report.limitations.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-2 font-semibold"><AlertTriangle size={18}/>Ограничения и требующие уточнения пункты</div><ul className="mt-2 list-disc space-y-1 pl-5">{report.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>}<p className="text-xs text-slate-500">Отчёт является внутренней аналитической проверкой и не заменяет официальную экспертизу или согласование в Республике Молдова.</p></div>; }
