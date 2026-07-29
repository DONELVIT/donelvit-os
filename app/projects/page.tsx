import Link from "next/link";
import {BriefcaseBusiness, CheckCircle2, Clock3, Plus, Search, ShieldCheck} from "lucide-react";
import {ProjectWriteLink} from "@/components/auth-ui";
import {StatusBadge} from "@/components/status-badge";
import {getProjects} from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage({searchParams}: {searchParams: Promise<{q?: string; status?: string}>}) {
  const [all, sp] = await Promise.all([getProjects(), searchParams]);
  const q = (sp.q ?? "").trim().toLowerCase();
  const status = sp.status ?? "";
  const projects = all.filter((project) =>
    (!status || project.status === status) &&
    (!q || [project.project_number, project.title, project.client_name, project.object_name, project.responsible_person]
      .some((value) => value?.toLowerCase().includes(q))),
  );
  const metrics = [
    {label: "Всего", value: all.length, icon: BriefcaseBusiness},
    {label: "В работе", value: all.filter((project) => project.status === "in_progress").length, icon: Clock3},
    {label: "На проверке", value: all.filter((project) => project.status === "review").length, icon: ShieldCheck},
    {label: "Завершено", value: all.filter((project) => project.status === "completed").length, icon: CheckCircle2},
  ];

  return <div className="space-y-6">
    <header>
      <p className="text-sm font-semibold text-red-700">Рабочий реестр</p>
      <h1 className="mt-1 text-3xl font-bold">Проекты</h1>
      <p className="mt-2 text-slate-500">Проектирование, проверка и техническая экспертиза.</p>
      <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">Создание и изменение проектов доступны авторизованным сотрудникам.</p>
      <div className="mt-4"><ProjectWriteLink href="/projects/new" className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white"><Plus size={18}/>Новый проект</ProjectWriteLink></div>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({label, value, icon: Icon}) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className="rounded-xl bg-slate-100 p-3"><Icon size={20}/></div></div></article>)}
    </section>

    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel md:grid-cols-[1fr_220px_auto]">
      <label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input name="q" defaultValue={sp.q} className="input pl-10" placeholder="Номер, название, клиент, объект..."/></label>
      <select name="status" defaultValue={status} className="input"><option value="">Все статусы</option><option value="new">Новый</option><option value="in_progress">В работе</option><option value="review">На проверке</option><option value="completed">Завершён</option><option value="archived">Архив</option></select>
      <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Применить</button>
    </form>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["№ проекта", "Наименование", "Клиент / объект", "Вид работ / этап", "Ответственный", "Срок", "Статус"].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{projects.map((project) => <tr key={project.id} className="hover:bg-slate-50"><td className="whitespace-nowrap px-5 py-4 font-semibold"><Link className="text-red-700" href={`/projects/${project.id}`}>{project.project_number ?? "Без номера"}</Link></td><td className="max-w-sm px-5 py-4 font-medium">{project.title}</td><td className="px-5 py-4"><div>{project.client_name}</div><div className="mt-1 text-xs text-slate-500">{project.object_name ?? "Объект не указан"}</div></td><td className="px-5 py-4"><div>{project.project_type_name ?? "—"}</div><div className="mt-1 text-xs text-slate-500">{project.stage}</div></td><td className="px-5 py-4">{project.responsible_person ?? "—"}</td><td className="whitespace-nowrap px-5 py-4">{project.due_date ?? "—"}</td><td className="px-5 py-4"><StatusBadge status={project.status}/></td></tr>)}{!projects.length && <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-500">Проекты не найдены.</td></tr>}</tbody></table></div></section>
  </div>;
}
