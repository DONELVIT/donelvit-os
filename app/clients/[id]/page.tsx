import Link from "next/link";
import {notFound} from "next/navigation";
import {Building2, FileText, FolderKanban, MapPin} from "lucide-react";
import {getClient} from "@/lib/data/clients";
import {getProjects} from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function ClientPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const clientId = Number(id);
  if (!Number.isInteger(clientId) || clientId <= 0) notFound();
  const [client, projects] = await Promise.all([getClient(clientId), getProjects()]);
  if (!client) notFound();
  const clientProjects = projects.filter((project) => project.client_name === client.legal_name);
  const fields = [["IDNO", client.fiscal_code], ["TVA", client.vat_code], ["Юридический адрес", client.legal_address], ["Почтовый адрес", client.postal_address], ["Email", client.email], ["Телефон", client.phone], ["Контактное лицо", client.contact_person], ["Представитель", [client.representative_position, client.representative_name].filter(Boolean).join(" ") || null], ["Основание подписания", client.signing_basis], ["Банк", client.bank_name], ["IBAN", client.iban], ["BIC", client.bank_bic]];
  return <div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div><p className="text-sm font-bold text-red-700">Клиент</p><h1 className="mt-2 text-3xl font-bold">{client.legal_name}</h1><p className="mt-3 text-sm text-slate-500">{client.is_active ? "Активный контрагент" : "Неактивный контрагент"}</p></div><Link href="/clients" className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold">К реестру</Link></div></section><section className="grid gap-4 md:grid-cols-3"><Metric label="Проекты" value={client.projects_count} icon={FolderKanban}/><Metric label="Объекты" value={client.objects_count} icon={MapPin}/><Metric label="Договоры" value={client.contracts_count} icon={FileText}/></section><section className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-lg font-bold">Реквизиты и контакты</h2><dl className="mt-5 grid gap-5 md:grid-cols-2">{fields.map(([label, value]) => <div key={label} className="border-b border-slate-100 pb-4"><dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-2 font-medium">{value || "—"}</dd></div>)}</dl>{client.notes && <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Примечания</p><p className="mt-2 whitespace-pre-wrap text-sm">{client.notes}</p></div>}</div><aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-lg font-bold">Проекты клиента</h2><div className="mt-4 space-y-3">{clientProjects.length ? clientProjects.map((project) => <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-xl border border-slate-200 p-4 hover:bg-slate-50"><p className="font-semibold text-red-700">{project.project_number ?? "Без номера"}</p><p className="mt-1 text-sm font-medium">{project.title}</p><p className="mt-1 text-xs text-slate-500">{project.status}</p></Link>) : <p className="rounded-xl bg-slate-50 px-4 py-5 text-sm text-slate-500">Связанные проекты не найдены.</p>}</div></aside></section></div>;
}

function Metric({label, value, icon: Icon}: {label: string; value: number; icon: typeof Building2}) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className="rounded-xl bg-slate-100 p-3"><Icon size={20}/></div></div></article>; }
