import Link from "next/link";
import { ClipboardCheck, FileCheck2, ShieldCheck } from "lucide-react";
import { verificationProfiles, verificationSources } from "@/lib/verification/catalog";

export default async function Page({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const { profile } = await searchParams;
  const selected = verificationProfiles.find((item) => item.id === profile) ?? verificationProfiles[0];
  return <div className="space-y-6">
    <section className="rounded-2xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-6 shadow-panel"><p className="text-sm font-semibold text-red-700">Внутренняя проверка проекта</p><h1 className="mt-2 text-3xl font-bold">Верификация по требованиям Республики Молдова</h1><p className="mt-3 max-w-3xl text-slate-600">Выберите категорию объекта, чтобы проверить пожарную безопасность и полноту проектной документации. Результат является рабочим контролем команды и не заменяет официальную экспертизу или согласование компетентного органа.</p></section>
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">{verificationProfiles.map((item) => <Link key={item.id} href={`/verification?profile=${item.id}`} className={`rounded-2xl border p-4 text-sm transition ${item.id === selected.id ? "border-red-700 bg-red-700 text-white shadow-panel" : "bg-white hover:border-red-300"}`}><span className="font-semibold">{item.name}</span><span className={`mt-2 block text-xs ${item.id === selected.id ? "text-red-100" : "text-slate-500"}`}>{item.description}</span></Link>)}</section>
    <section className="rounded-2xl border bg-white p-6 shadow-panel"><div className="flex items-start gap-3"><ClipboardCheck className="mt-1 text-red-700"/><div><p className="text-sm font-semibold text-red-700">Профиль проверки</p><h2 className="text-2xl font-bold">{selected.name}</h2><p className="mt-2 text-slate-500">{selected.description}</p></div></div><div className="mt-6 grid gap-6 lg:grid-cols-2"><CheckList title="Пожарная безопасность" icon={<ShieldCheck size={20}/>} items={selected.fireSafetyChecks}/><CheckList title="Полнота документации" icon={<FileCheck2 size={20}/>} items={selected.documentationChecks}/></div></section>
    <section className="rounded-2xl border bg-white p-6 shadow-panel"><h2 className="text-xl font-bold">Нормативная основа</h2><p className="mt-2 text-sm text-slate-500">Перед выпуском заключения проверяйте действующую редакцию и применимость документа к объекту.</p><div className="mt-4 grid gap-3 md:grid-cols-3">{verificationSources.map((source) => <a key={source.code} href={source.url} target="_blank" rel="noreferrer" className="rounded-xl border p-4 transition hover:border-red-300"><div className="font-semibold text-red-700">{source.code}</div><div className="mt-2 text-sm text-slate-600">{source.title}</div><div className="mt-3 text-xs font-semibold text-slate-500">Открыть официальный источник ↗</div></a>)}</div></section>
    <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Сохранение результатов, назначение ответственных и прикрепление доказательств потребуют отдельного согласования модели данных и прав доступа.</p>
  </div>;
}

function CheckList({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return <div className="rounded-xl border border-slate-200 p-5"><div className="flex items-center gap-2 font-bold text-slate-900">{icon}{title}</div><ul className="mt-4 space-y-3">{items.map((item) => <li key={item} className="flex gap-3 text-sm text-slate-700"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 text-xs text-slate-400">□</span><span>{item}</span></li>)}</ul></div>;
}
