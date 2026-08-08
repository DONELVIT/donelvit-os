"use client";

import { upload } from "@vercel/blob/client";
import { ClipboardCheck, FileUp, Plus, Save, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { verificationProfiles, verificationSources } from "@/lib/verification/catalog";

type Project = { id: number; title: string; project_number: string | null; code?: string | null };
type VerificationCase = { id: number; title: string; project_id: number; discipline: string; profile: string; status: string; verdict: string | null; projects?: Project | Project[] | null };
type Finding = { id: number; code: string; section: string; normative_reference: string | null; assessment: string; severity: string; correction: string | null; status: string };
type Calculation = { id: number; kind: string; title: string; inputs: { area?: number; norm?: number }; result: { people?: number }; conclusion: string | null; review_status: string };
type VerificationFile = { id: number; file_name: string; document_role: string; size_bytes: number; created_at: string };

const emptyCase = { projectId: "", title: "", discipline: "SI", profile: verificationProfiles[0].id };

export function VerificationWorkspace() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [cases, setCases] = useState<VerificationCase[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [files, setFiles] = useState<VerificationFile[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [message, setMessage] = useState("Загрузка рабочего пространства…");
  const [caseForm, setCaseForm] = useState(emptyCase);
  const [findingForm, setFindingForm] = useState({ code: "", section: "", normative: "", assessment: "incomplete", severity: "normal", correction: "" });
  const [peopleForm, setPeopleForm] = useState({ area: "", norm: "" });

  const canEdit = role === "admin" || role === "engineer";
  const selected = useMemo(() => cases.find((item) => item.id === selectedId) ?? null, [cases, selectedId]);
  const profile = verificationProfiles.find((item) => item.id === (selected?.profile ?? caseForm.profile)) ?? verificationProfiles[0];

  async function loadCases(preferredId?: number) {
    const supabase = createClient();
    if (!supabase) { setMessage("Подключение к Supabase не настроено."); return; }
    const [{ data: session }, { data: projectData }, { data: caseData, error }] = await Promise.all([
      supabase.auth.getUser(), supabase.from("projects").select("id,title,project_number").order("title"),
      supabase.from("verification_cases").select("id,title,project_id,discipline,profile,status,verdict,projects(id,title,project_number)").order("updated_at", { ascending: false })
    ]);
    if (!session.user) { setMessage("Войдите в систему, чтобы открыть досье верификации."); return; }
    const { data: roleRow, error: roleError } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).single();
    setRole(roleError ? "viewer" : roleRow?.role ?? "viewer"); setProjects(((projectData ?? []) as Project[]).map((project) => ({ ...project, code: project.project_number })));
    if (error) { setMessage(error.message); return; }
    const nextCases = (caseData ?? []) as unknown as VerificationCase[];
    setCases(nextCases); setSelectedId(preferredId ?? selectedId ?? nextCases[0]?.id ?? null);
    setMessage(nextCases.length ? "" : "Создайте первое досье для проекта.");
  }

  async function loadDetails(caseId: number) {
    const supabase = createClient(); if (!supabase) return;
    const [findingData, calculationData, fileData] = await Promise.all([
      supabase.from("verification_findings").select("id,code,section,normative_reference,assessment,severity,correction,status").eq("verification_case_id", caseId).order("sort_order"),
      supabase.from("verification_calculations").select("id,kind,title,inputs,result,conclusion,review_status").eq("verification_case_id", caseId).order("created_at"),
      supabase.from("verification_files").select("id,file_name,document_role,size_bytes,created_at").eq("verification_case_id", caseId).order("created_at", { ascending: false })
    ]);
    setFindings((findingData.data ?? []) as Finding[]); setCalculations((calculationData.data ?? []) as Calculation[]); setFiles((fileData.data ?? []) as VerificationFile[]);
  }

  useEffect(() => { void loadCases(); }, []);
  useEffect(() => { if (selectedId) void loadDetails(selectedId); else { setFindings([]); setCalculations([]); setFiles([]); } }, [selectedId]);

  async function createCase(event: FormEvent) {
    event.preventDefault(); const supabase = createClient();
    if (!supabase || !caseForm.projectId) return;
    if (caseForm.title.trim().length < 3) { setMessage("Введите название проверки не короче 3 символов."); return; }
    const project = projects.find((item) => item.id === Number(caseForm.projectId));
    const { data, error } = await supabase.from("verification_cases").insert({ project_id: Number(caseForm.projectId), title: caseForm.title, discipline: caseForm.discipline, profile: caseForm.profile, project_code: project?.project_number, object_name: project?.title }).select("id").single();
    if (error) { setMessage(error.message); return; }
    const selectedProfile = verificationProfiles.find((item) => item.id === caseForm.profile) ?? verificationProfiles[0];
    const templateRows = [
      ...selectedProfile.fireSafetyChecks.map((section, index) => ({ verification_case_id: data.id, code: `FS-${String(index + 1).padStart(2, "0")}`, section, normative_reference: "Уточнить применимый нормативный пункт и действующую редакцию", assessment: "incomplete", severity: "normal", priority: "recommended", sort_order: index + 1 })),
      ...selectedProfile.documentationChecks.map((section, index) => ({ verification_case_id: data.id, code: `DOC-${String(index + 1).padStart(2, "0")}`, section, normative_reference: "Проверить по официальному источнику и комплекту исходных данных", assessment: "incomplete", severity: "normal", priority: "recommended", sort_order: 100 + index }))
    ];
    const { error: templateError } = await supabase.from("verification_findings").insert(templateRows);
    setCaseForm(emptyCase); setMessage(templateError ? "Досье создано, но матрицу проверок нужно добавить вручную." : "Досье и матрица проверок созданы. Заполните нормативные пункты, оценку и корректировки."); await loadCases(data.id);
  }

  async function createFinding(event: FormEvent) {
    event.preventDefault(); const supabase = createClient(); if (!supabase || !selectedId) return;
    const { error } = await supabase.from("verification_findings").insert({ verification_case_id: selectedId, code: findingForm.code, section: findingForm.section, normative_reference: findingForm.normative || null, assessment: findingForm.assessment, severity: findingForm.severity, correction: findingForm.correction || null, priority: findingForm.assessment === "noncompliant" ? "required" : "recommended" });
    if (error) { setMessage(error.message); return; }
    setFindingForm({ code: "", section: "", normative: "", assessment: "incomplete", severity: "normal", correction: "" }); await loadDetails(selectedId);
  }

  async function applyTemplate() {
    const supabase = createClient(); if (!supabase || !selected) return;
    const activeProfile = verificationProfiles.find((item) => item.id === selected.profile) ?? verificationProfiles[0];
    const rows = [
      ...activeProfile.fireSafetyChecks.map((section, index) => ({ verification_case_id: selected.id, code: `FS-${String(index + 1).padStart(2, "0")}`, section, normative_reference: "Уточнить применимый нормативный пункт и действующую редакцию", assessment: "incomplete", severity: "normal", priority: "recommended", sort_order: index + 1 })),
      ...activeProfile.documentationChecks.map((section, index) => ({ verification_case_id: selected.id, code: `DOC-${String(index + 1).padStart(2, "0")}`, section, normative_reference: "Проверить по официальному источнику и комплекту исходных данных", assessment: "incomplete", severity: "normal", priority: "recommended", sort_order: 100 + index }))
    ];
    const { error } = await supabase.from("verification_findings").upsert(rows, { onConflict: "verification_case_id,code", ignoreDuplicates: true });
    if (error) { setMessage(error.message); return; }
    setMessage("Матрица проверок добавлена. Заполните нормативный пункт, данные проекта, оценку и корректировку."); await loadDetails(selected.id);
  }

  async function savePeopleCalculation(event: FormEvent) {
    event.preventDefault(); const supabase = createClient(); if (!supabase || !selectedId) return;
    const area = Number(peopleForm.area), norm = Number(peopleForm.norm);
    if (!(area > 0 && norm > 0)) { setMessage("Укажите площадь и норматив площади на одного человека."); return; }
    const people = Math.ceil(area / norm);
    const { error } = await supabase.from("verification_calculations").insert({ verification_case_id: selectedId, kind: "people_count", title: "Расчёт численности людей", inputs: { area, norm }, formula: "ceil(площадь / норматив площади на человека)", result: { people }, conclusion: `Расчётный минимум: ${people} чел.`, review_status: "manual_review_required" });
    if (error) { setMessage(error.message); return; }
    setPeopleForm({ area: "", norm: "" }); await loadDetails(selectedId);
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; const supabase = createClient(); if (!file || !supabase || !selectedId) return;
    if (file.size > 50 * 1024 * 1024) { setMessage("Максимальный размер файла — 50 МБ."); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setMessage("Сессия истекла. Войдите в систему повторно."); return; }
    try {
      setMessage("Загрузка приватного файла…");
      const blob = await upload(`verification/${selectedId}/${file.name}`, file, { access: "private", handleUploadUrl: "/api/verification/upload", headers: { Authorization: `Bearer ${session.access_token}` } });
      const { error } = await supabase.from("verification_files").insert({ verification_case_id: selectedId, file_name: file.name, content_type: file.type || "application/octet-stream", size_bytes: file.size, blob_url: blob.url, document_role: "other" });
      if (error) throw error;
      setMessage("Файл добавлен в приватное досье."); await loadDetails(selectedId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось загрузить файл."); }
    finally { event.target.value = ""; }
  }

  async function downloadFile(file: VerificationFile) {
    const supabase = createClient(); if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setMessage("Сессия истекла. Войдите в систему повторно."); return; }
    const response = await fetch(`/api/verification/files/${file.id}`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) { setMessage("Не удалось получить файл."); return; }
    const objectUrl = URL.createObjectURL(await response.blob());
    const link = document.createElement("a"); link.href = objectUrl; link.download = file.file_name; link.click(); URL.revokeObjectURL(objectUrl);
  }

  const projectLabel = (item: VerificationCase) => Array.isArray(item.projects) ? item.projects[0]?.title : item.projects?.title;

  async function downloadDraft() {
    const supabase = createClient(); if (!supabase || !selected) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) { setMessage("Сессия истекла. Войдите в систему повторно."); return; }
    const response = await fetch(`/api/verification/${selected.id}/report`, { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) { setMessage("Не удалось сформировать DOCX-черновик."); return; }
    const objectUrl = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = objectUrl; link.download = `Отчёт_верификации_${selected.id}.docx`; link.click(); URL.revokeObjectURL(objectUrl);
  }

  return <div className="space-y-6">{selected && <><div className="flex justify-end"><button type="button" onClick={() => void downloadDraft()} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">Сформировать DOCX-черновик</button></div>{canEdit && <VerificationCaseDecision caseId={selected.id} initialStatus={selected.status} initialVerdict={selected.verdict} onSaved={() => void loadCases(selected.id)} onMessage={setMessage}/>} {canEdit && <VerificationCalculationTemplates caseId={selected.id} onSaved={() => void loadDetails(selected.id)} onMessage={setMessage}/>}</>}
    <section className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-panel"><div className="flex gap-3"><ShieldCheck className="mt-1 shrink-0 text-red-700"/><div><p className="text-sm font-semibold text-red-700">Внутренняя верификация проекта</p><h1 className="mt-1 text-3xl font-bold">Досье проверки проектных решений</h1><p className="mt-3 max-w-4xl text-slate-600">Файлы, исходные данные, замечания и расчёты сохраняются в досье проекта. Результат — рабочий черновик команды и не является официальным заключением или экспертизой.</p></div></div></section>
    {message && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{message}</p>}
    <div className="grid gap-6 xl:grid-cols-[20rem_1fr]"><aside className="space-y-4"><section className="rounded-2xl border bg-white p-4 shadow-panel"><div className="flex items-center gap-2 font-bold"><ClipboardCheck size={19} className="text-red-700"/>Досье</div><div className="mt-3 space-y-2">{cases.map((item) => <button type="button" onClick={() => setSelectedId(item.id)} key={item.id} className={`w-full rounded-xl border p-3 text-left text-sm ${item.id === selectedId ? "border-red-700 bg-red-50" : "hover:border-red-300"}`}><strong className="block">{item.title}</strong><span className="mt-1 block text-xs text-slate-500">{projectLabel(item) ?? `Проект #${item.project_id}`} · {item.status}</span></button>)}</div></section>
      {canEdit && <form onSubmit={createCase} className="rounded-2xl border bg-white p-4 shadow-panel"><h2 className="font-bold">Новое досье</h2><select className="input mt-3" required value={caseForm.projectId} onChange={(e) => setCaseForm({ ...caseForm, projectId: e.target.value })}><option value="">Выберите проект</option>{projects.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} — ` : ""}{item.title}</option>)}</select><input className="input mt-2" required placeholder="Название проверки" value={caseForm.title} onChange={(e) => setCaseForm({ ...caseForm, title: e.target.value })}/><select className="input mt-2" value={caseForm.profile} onChange={(e) => setCaseForm({ ...caseForm, profile: e.target.value })}>{verificationProfiles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><select className="input mt-2" value={caseForm.discipline} onChange={(e) => setCaseForm({ ...caseForm, discipline: e.target.value })}><option value="SI">SI — пожарная сигнализация</option><option value="PS">PS — пожарная безопасность</option><option value="Mixed">Комплексная</option></select><button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"><Plus size={17}/>Создать</button></form>}</aside>
      <main className="space-y-6">{selected ? <><section className="rounded-2xl border bg-white p-6 shadow-panel"><p className="text-sm font-semibold text-red-700">{selected.discipline} · {selected.status}</p><h2 className="mt-1 text-2xl font-bold">{selected.title}</h2><p className="mt-2 text-sm text-slate-500">Проект: {projectLabel(selected) ?? selected.project_id}. Нормативы указывайте по официальной версии и ссылке на источник.</p></section>
        <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-5 shadow-panel"><div className="flex items-center gap-2 font-bold"><FileUp size={19} className="text-red-700"/>Проектные файлы</div><p className="mt-2 text-xs text-slate-500">PDF, DOCX, DOC, DWG, JPG, PNG; до 50 МБ. Файлы хранятся приватно.</p>{canEdit && <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><FileUp size={17} className="mr-2"/>Загрузить файл<input className="hidden" type="file" accept=".pdf,.doc,.docx,.dwg,image/jpeg,image/png" onChange={uploadFile}/></label>}<ul className="mt-4 space-y-2">{files.map((file) => <li key={file.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span><strong>{file.file_name}</strong><span className="ml-2 text-xs text-slate-500">{Math.ceil(file.size_bytes / 1024)} КБ · {file.document_role}</span></span><button type="button" className="text-xs font-semibold text-red-700" onClick={() => void downloadFile(file)}>Скачать</button></li>)}{!files.length && <li className="text-sm text-slate-500">Файлы ещё не добавлены.</li>}</ul></div>
          <div className="rounded-2xl border bg-white p-5 shadow-panel"><h3 className="font-bold">Нормативная основа</h3><p className="mt-2 text-xs text-slate-500">Полные тексты стандартов не копируются в систему: используйте реквизиты и официальный источник.</p><div className="mt-4 space-y-2">{verificationSources.map((source) => <a key={source.code} className="block rounded-lg border p-3 text-sm hover:border-red-300" href={source.url} target="_blank" rel="noreferrer"><strong className="text-red-700">{source.code}</strong><span className="ml-2 text-slate-600">{source.title}</span></a>)}</div></div></section>
        <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-2xl border bg-white p-5 shadow-panel"><h3 className="font-bold">Замечания и проверки</h3>{canEdit && <form onSubmit={createFinding} className="mt-4 space-y-2"><div className="grid grid-cols-2 gap-2"><input className="input" required placeholder="Код: O-01" value={findingForm.code} onChange={(e) => setFindingForm({ ...findingForm, code: e.target.value })}/><input className="input" required placeholder="Раздел" value={findingForm.section} onChange={(e) => setFindingForm({ ...findingForm, section: e.target.value })}/></div><input className="input" placeholder="Нормативный пункт" value={findingForm.normative} onChange={(e) => setFindingForm({ ...findingForm, normative: e.target.value })}/><textarea className="input" placeholder="Требуемая корректировка" value={findingForm.correction} onChange={(e) => setFindingForm({ ...findingForm, correction: e.target.value })}/><div className="grid grid-cols-2 gap-2"><select className="input" value={findingForm.assessment} onChange={(e) => setFindingForm({ ...findingForm, assessment: e.target.value })}><option value="incomplete">Недостаточно данных</option><option value="compliant">Соответствует</option><option value="noncompliant">Несоответствие</option><option value="risk">Риск</option></select><select className="input" value={findingForm.severity} onChange={(e) => setFindingForm({ ...findingForm, severity: e.target.value })}><option value="critical">Критично</option><option value="major">Существенно</option><option value="normal">Обычно</option><option value="minor">Незначительно</option></select></div><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><Save size={16}/>Сохранить замечание</button></form>}<div className="mt-4 space-y-2">{findings.map((finding) => <article key={finding.id} className="rounded-lg border p-3 text-sm"><div className="flex justify-between gap-2"><strong>{finding.code} · {finding.section}</strong><span className="text-xs text-slate-500">{finding.assessment} / {finding.severity}</span></div>{finding.normative_reference && <p className="mt-1 text-slate-600">{finding.normative_reference}</p>}{finding.correction && <p className="mt-1 text-slate-600">Исправление: {finding.correction}</p>}</article>)}{!findings.length && <p className="mt-4 text-sm text-slate-500">Добавьте проверку в формате отчётов: раздел, норма, оценка, риск и корректировка.</p>}</div></div>
          <div className="rounded-2xl border bg-white p-5 shadow-panel"><h3 className="font-bold">Расчёты</h3><p className="mt-2 text-xs text-slate-500">Автоматизирован только прозрачный расчёт численности. Категории, энергия и акустика сохраняются как проверяемые исходные данные и требуют ручного инженерного контроля.</p>{canEdit && <form onSubmit={savePeopleCalculation} className="mt-4 space-y-2"><div className="grid grid-cols-2 gap-2"><input className="input" inputMode="decimal" placeholder="Площадь, м²" value={peopleForm.area} onChange={(e) => setPeopleForm({ ...peopleForm, area: e.target.value })}/><input className="input" inputMode="decimal" placeholder="Норма, м²/чел." value={peopleForm.norm} onChange={(e) => setPeopleForm({ ...peopleForm, norm: e.target.value })}/></div><button className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"><Save size={16}/>Сохранить расчёт</button></form>}<div className="mt-4 space-y-2">{calculations.map((calculation) => <article key={calculation.id} className="rounded-lg border p-3 text-sm"><strong>{calculation.title}</strong><p className="mt-1 text-slate-600">{calculation.conclusion ?? "Требуется ручная проверка."}</p><span className="mt-1 block text-xs text-amber-700">{calculation.review_status === "reviewed" ? "Проверено" : "Требуется ручная проверка"}</span></article>)}{!calculations.length && <p className="mt-4 text-sm text-slate-500">Расчёты ещё не сохранены.</p>}</div></div></section>
        <section className="rounded-2xl border bg-white p-5 shadow-panel"><h3 className="font-bold">Профиль проверки: {profile.name}</h3><div className="mt-4 grid gap-6 lg:grid-cols-2"><CheckList title="Пожарная безопасность" items={profile.fireSafetyChecks}/><CheckList title="Полнота документации" items={profile.documentationChecks}/></div></section>
      </> : <section className="rounded-2xl border bg-white p-10 text-center shadow-panel"><h2 className="text-xl font-bold">Досье пока не выбрано</h2><p className="mt-2 text-slate-500">{canEdit ? "Создайте досье слева и привяжите его к проекту." : "У вас роль просмотра. После создания досья инженером оно появится здесь."}</p></section>}</main></div>
  </div>;
}

function CheckList({ title, items }: { title: string; items: string[] }) {
  return <div><h4 className="font-semibold">{title}</h4><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="flex gap-2 text-sm text-slate-700"><span className="text-red-700">□</span>{item}</li>)}</ul></div>;
}

function VerificationCaseDecision({ caseId, initialStatus, initialVerdict, onSaved, onMessage }: { caseId: number; initialStatus: string; initialVerdict: string | null; onSaved: () => void; onMessage: (message: string) => void }) {
  const [status, setStatus] = useState(initialStatus); const [verdict, setVerdict] = useState(initialVerdict ?? "pending");
  async function save(event: FormEvent) { event.preventDefault(); const supabase = createClient(); if (!supabase) return; const values = { status, verdict, reviewed_at: status === "completed" ? new Date().toISOString().slice(0, 10) : null }; const { error } = await supabase.from("verification_cases").update(values).eq("id", caseId); if (error) { onMessage(error.message); return; } onMessage("Статус и внутренний вердикт сохранены."); onSaved(); }
  return <form onSubmit={save} className="rounded-2xl border bg-white p-5 shadow-panel"><h2 className="font-bold">Внутренний итог проверки</h2><p className="mt-1 text-sm text-slate-500">Вердикт отражает рабочее состояние досья; он не является официальным заключением.</p><div className="mt-3 grid gap-2 md:grid-cols-3"><select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="draft">Черновик</option><option value="in_review">На проверке</option><option value="completed">Завершено</option><option value="archived">В архиве</option></select><select className="input" value={verdict} onChange={(e) => setVerdict(e.target.value)}><option value="pending">Ожидает решения</option><option value="compliant">Соответствует</option><option value="compliant_with_comments">Соответствует с замечаниями</option><option value="noncompliant">Не соответствует</option><option value="insufficient_data">Недостаточно данных</option></select><button className="rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white">Сохранить итог</button></div></form>;
}

function VerificationCalculationTemplates({ caseId, onSaved, onMessage }: { caseId: number; onSaved: () => void; onMessage: (message: string) => void }) {
  const [power, setPower] = useState({ load: "", hours: "24", factor: "0.8" });
  const [acoustic, setAcoustic] = useState({ measured: "", limit: "" });
  const [category, setCategory] = useState({ room: "", category: "", basis: "" });
  async function save(kind: "energy" | "acoustic" | "fire_category", title: string, inputs: Record<string, string | number>, conclusion: string) {
    const supabase = createClient(); if (!supabase) return;
    const { error } = await supabase.from("verification_calculations").insert({ verification_case_id: caseId, kind, title, inputs, result: {}, conclusion, review_status: "manual_review_required" });
    if (error) { onMessage(error.message); return; } onMessage("Расчётные исходные данные сохранены и отмечены для ручной проверки."); onSaved();
  }
  return <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-panel"><h2 className="font-bold">Шаблоны инженерных расчётов</h2><p className="mt-1 text-sm text-amber-900">Значения сохраняются как рабочие исходные данные. Проверка применимой методики и норматива обязательна.</p><div className="mt-4 grid gap-4 lg:grid-cols-3"><form onSubmit={(event) => { event.preventDefault(); const load = Number(power.load), hours = Number(power.hours), factor = Number(power.factor); if (!(load > 0 && hours > 0 && factor > 0 && factor <= 1)) return onMessage("Для резерва питания укажите положительные значения и коэффициент от 0 до 1."); const ah = Math.ceil(load * hours / factor); void save("energy", "Предварительный резерв питания", { load_a: load, standby_hours: hours, discharge_factor: factor }, `Предварительная требуемая ёмкость: ${ah} А·ч (I × t / коэффициент).`); }} className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Резерв питания</h3><input className="input mt-2" inputMode="decimal" placeholder="Ток нагрузки, А" value={power.load} onChange={(e) => setPower({ ...power, load: e.target.value })}/><input className="input mt-2" inputMode="decimal" placeholder="Время резерва, ч" value={power.hours} onChange={(e) => setPower({ ...power, hours: e.target.value })}/><input className="input mt-2" inputMode="decimal" placeholder="Коэффициент разряда" value={power.factor} onChange={(e) => setPower({ ...power, factor: e.target.value })}/><button className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Сохранить</button></form><form onSubmit={(event) => { event.preventDefault(); const measured = Number(acoustic.measured), limit = Number(acoustic.limit); if (!(measured >= 0 && limit >= 0)) return onMessage("Укажите измеренный и допустимый уровень звука."); const delta = Math.round((measured - limit) * 10) / 10; void save("acoustic", "Сопоставление акустического уровня", { measured_db: measured, limit_db: limit }, delta <= 0 ? `Запас относительно введённого предела: ${Math.abs(delta)} дБ.` : `Превышение введённого предела: ${delta} дБ.`); }} className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Акустика</h3><input className="input mt-2" inputMode="decimal" placeholder="Измеренный уровень, дБ" value={acoustic.measured} onChange={(e) => setAcoustic({ ...acoustic, measured: e.target.value })}/><input className="input mt-2" inputMode="decimal" placeholder="Допустимый предел, дБ" value={acoustic.limit} onChange={(e) => setAcoustic({ ...acoustic, limit: e.target.value })}/><button className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Сохранить</button></form><form onSubmit={(event) => { event.preventDefault(); if (!category.room || !category.category || !category.basis) return onMessage("Укажите помещение, категорию и основание классификации."); void save("fire_category", "Категория пожарной опасности", category, `Введена категория «${category.category}» для «${category.room}»; требуется проверка методики по указанному основанию.`); }} className="rounded-xl border bg-white p-4"><h3 className="font-semibold">Категория помещения</h3><input className="input mt-2" placeholder="Помещение / зона" value={category.room} onChange={(e) => setCategory({ ...category, room: e.target.value })}/><input className="input mt-2" placeholder="Категория" value={category.category} onChange={(e) => setCategory({ ...category, category: e.target.value })}/><input className="input mt-2" placeholder="Основание / методика" value={category.basis} onChange={(e) => setCategory({ ...category, basis: e.target.value })}/><button className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Сохранить</button></form></div></section>;
}
