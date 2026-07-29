import Link from "next/link";
import {notFound} from "next/navigation";
import {Activity, CalendarDays, CheckCircle2, CircleDollarSign, FileText, FolderOpen, History, Layers3, ListChecks, PenLine, ShieldCheck} from "lucide-react";
import {StatusBadge} from "@/components/status-badge";
import {getProject,getProjectDocuments,getProjectSystems} from "@/lib/data/projects";

export const dynamic="force-dynamic";
const tabs=[
 {id:"general",label:"Общие",icon:Activity},
 {id:"systems",label:"Системы",icon:Layers3},
 {id:"documents",label:"Документы",icon:FileText},
 {id:"expertise",label:"Экспертиза",icon:ShieldCheck},
 {id:"finance",label:"Финансы",icon:CircleDollarSign},
 {id:"history",label:"История",icon:History}
];

export default async function ProjectPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{tab?:string}>}){
 const [{id},sp]=await Promise.all([params,searchParams]);
 const projectId=Number(id); if(!Number.isInteger(projectId)||projectId<=0)notFound(); const p=await getProject(projectId); if(!p)notFound();
 const active=tabs.some(x=>x.id===sp.tab)?sp.tab!:"general";
 const [systems,documents]=await Promise.all([getProjectSystems(projectId),getProjectDocuments(projectId)]);
 const fields=[["Клиент",p.client_name],["Объект",p.object_name??"—"],["Вид работ",p.project_type_name??"—"],["Этап",p.stage],["Ответственный",p.responsible_person??"Не назначен"],["Дата начала",p.start_date??"—"],["Срок",p.due_date??"Не установлен"],["Стоимость",p.amount===null?"—":`${p.amount.toLocaleString("ru-RU")} ${p.currency}`]];
 return <div className="space-y-6">
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
   <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
    <div><div className="flex flex-wrap items-center gap-3"><p className="text-sm font-bold text-red-700">{p.project_number??"Без номера"}</p><StatusBadge status={p.status}/></div><h1 className="mt-3 max-w-5xl text-3xl font-bold">{p.title}</h1><p className="mt-3 text-sm text-slate-500">{p.client_name} · {p.object_name??"Объект не указан"}</p></div>
    <div className="flex flex-wrap gap-3"><Link href="/projects" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">К реестру</Link><Link href={`/projects/${p.id}/edit`} className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"><PenLine size={17}/>Редактировать</Link></div>
   </div>
  </section>

  <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-panel">
   {tabs.map(({id:tabId,label,icon:Icon})=><Link key={tabId} href={`/projects/${p.id}?tab=${tabId}`} className={`inline-flex min-w-max items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${active===tabId?"bg-slate-900 text-white":"text-slate-600 hover:bg-slate-100"}`}><Icon size={17}/>{label}</Link>)}
  </nav>

  {active==="general"&&<section className="grid gap-6 xl:grid-cols-[1fr_360px]">
   <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-lg font-bold">Паспорт проекта</h2><dl className="mt-5 grid gap-5 md:grid-cols-2">{fields.map(([l,v])=><div key={l} className="border-b border-slate-100 pb-4"><dt className="text-xs uppercase tracking-wide text-slate-500">{l}</dt><dd className="mt-2 font-medium">{v}</dd></div>)}</dl>{p.notes&&<div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Примечания</p><p className="mt-2 whitespace-pre-wrap text-sm">{p.notes}</p></div>}</div>
   <aside className="space-y-4"><InfoCard title="Готовность проекта" value={p.status==="completed"?"100%":p.status==="review"?"75%":p.status==="in_progress"?"45%":"15%"} icon={CheckCircle2}/><InfoCard title="Инженерные системы" value={String(systems.length)} icon={Layers3}/><InfoCard title="Документы" value={String(documents.length)} icon={FileText}/><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><h3 className="font-bold">Интеграции</h3><div className="mt-4 space-y-3">{p.drive_folder_url?<a href={p.drive_folder_url} target="_blank" className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold">Google Drive<FolderOpen size={17}/></a>:<div className="rounded-xl border border-dashed px-4 py-3 text-sm text-slate-500">Google Drive не подключён</div>}{p.todoist_url?<a href={p.todoist_url} target="_blank" className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold">Todoist<ListChecks size={17}/></a>:<div className="rounded-xl border border-dashed px-4 py-3 text-sm text-slate-500">Todoist не подключён</div>}</div></div></aside>
  </section>}

  {active==="systems"&&<Panel title="Инженерные системы" subtitle="Состав систем, закреплённых за проектом.">{systems.length?<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{systems.map(s=><article key={s.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wide text-red-700">{s.code}</p><h3 className="mt-2 font-bold">{s.name}</h3></div><Layers3 size={20} className="text-slate-400"/></div><p className="mt-3 text-sm text-slate-500">{s.notes??s.description??"Технические данные ещё не заполнены."}</p><div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">Оборудование · расчёты · Cause & Effect · ПНР</div></article>)}</div>:<Empty text="Для проекта пока не назначены инженерные системы."/>}</Panel>}

  {active==="documents"&&<Panel title="Документы проекта" subtitle="Проектные, договорные и экспертные документы.">{documents.length?<div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Документ</th><th>Тип</th><th>Ревизия</th><th>Дата</th><th>Статус</th></tr></thead><tbody className="divide-y">{documents.map(d=><tr key={d.id}><td className="py-4 font-semibold">{d.drive_file_url?<a className="text-red-700" href={d.drive_file_url} target="_blank">{d.title}</a>:d.title}<div className="text-xs font-normal text-slate-500">{d.document_number??"Без номера"}</div></td><td>{d.document_type}</td><td>{d.revision??"—"}</td><td>{d.issued_at??"—"}</td><td>{d.status}</td></tr>)}</tbody></table></div>:<Empty text="В реестре ещё нет документов по этому проекту."/>}</Panel>}

  {active==="expertise"&&<Panel title="Экспертиза" subtitle="Замечания, нормативные ссылки и контроль устранения."><div className="grid gap-4 md:grid-cols-3"><InfoCard title="Открытые замечания" value="0" icon={ShieldCheck}/><InfoCard title="Устранено" value="0" icon={CheckCircle2}/><InfoCard title="Критические" value="0" icon={Activity}/></div><Empty text="Модуль замечаний будет подключён следующим этапом."/></Panel>}
  {active==="finance"&&<Panel title="Финансы" subtitle="Стоимость проекта, договоры и оплаты."><div className="grid gap-4 md:grid-cols-3"><InfoCard title="Стоимость" value={p.amount===null?"—":`${p.amount.toLocaleString("ru-RU")} ${p.currency}`} icon={CircleDollarSign}/><InfoCard title="Оплачено" value="—" icon={CheckCircle2}/><InfoCard title="Остаток" value="—" icon={CalendarDays}/></div></Panel>}
  {active==="history"&&<Panel title="История проекта" subtitle="Ключевые даты и изменения."><div className="space-y-4"><Timeline label="Проект создан" date={fmt(p.created_at)}/><Timeline label="Последнее изменение" date={fmt(p.updated_at)}/>{p.start_date&&<Timeline label="Дата начала" date={p.start_date}/>} {p.due_date&&<Timeline label="Плановый срок" date={p.due_date}/>}</div></Panel>}
 </div>;
}
function Panel({title,subtitle,children}:{title:string;subtitle:string;children:React.ReactNode}){return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-slate-500">{subtitle}</p><div className="mt-6">{children}</div></section>}
function InfoCard({title,value,icon:Icon}:{title:string;value:string;icon:any}){return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold">{value}</p></div><div className="rounded-xl bg-slate-100 p-3"><Icon size={20}/></div></div></div>}
function Empty({text}:{text:string}){return <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">{text}</div>}
function Timeline({label,date}:{label:string;date:string}){return <div className="flex gap-4"><div className="mt-1 h-3 w-3 rounded-full bg-red-700"/><div><p className="font-semibold">{label}</p><p className="text-sm text-slate-500">{date}</p></div></div>}
function fmt(x:string){return new Intl.DateTimeFormat("ru-RU",{dateStyle:"medium",timeStyle:"short"}).format(new Date(x))}
