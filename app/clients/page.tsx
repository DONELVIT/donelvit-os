import Link from "next/link";
import {Building2, FileText, FolderKanban, Search} from "lucide-react";
import {getClients} from "@/lib/data/clients";

export const dynamic = "force-dynamic";

export default async function ClientsPage({searchParams}: {searchParams: Promise<{q?: string; status?: string}>}) {
  const [allClients, params] = await Promise.all([getClients(), searchParams]);
  const query = (params.q ?? "").trim().toLowerCase();
  const status = params.status ?? "active";
  const clients = allClients.filter((client) => (status === "all" || client.is_active) && (!query || [client.legal_name, client.fiscal_code, client.email, client.phone].some((value) => value?.toLowerCase().includes(query))));

  return <div className="space-y-6">
    <header><p className="text-sm font-semibold text-red-700">Контрагенты</p><h1 className="mt-1 text-3xl font-bold">Клиенты</h1><p className="mt-2 text-slate-500">Реестр заказчиков и их связи с проектами, объектами и договорами.</p></header>
    <section className="grid gap-4 sm:grid-cols-3"><Metric label="Активные" value={allClients.filter((item) => item.is_active).length} icon={Building2}/><Metric label="Проекты" value={allClients.reduce((sum, item) => sum + item.projects_count, 0)} icon={FolderKanban}/><Metric label="Договоры" value={allClients.reduce((sum, item) => sum + item.contracts_count, 0)} icon={FileText}/></section>
    <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-panel md:grid-cols-[1fr_200px_auto]"><label className="relative"><Search className="absolute left-3 top-3.5 text-slate-400" size={18}/><input name="q" defaultValue={params.q} className="input pl-10" placeholder="Наименование, IDNO, email, телефон..."/></label><select name="status" defaultValue={status} className="input"><option value="active">Активные</option><option value="all">Все клиенты</option></select><button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Применить</button></form>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["Клиент", "Контакты", "Проекты", "Объекты", "Договоры", "Статус"].map((label) => <th key={label} className="px-5 py-4">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{clients.map((client) => <tr key={client.id} className="hover:bg-slate-50"><td className="px-5 py-4"><Link href={`/clients/${client.id}`} className="font-semibold text-red-700">{client.legal_name}</Link><p className="mt-1 text-xs text-slate-500">{client.fiscal_code ?? "IDNO не указан"}</p></td><td className="px-5 py-4"><p>{client.email ?? "—"}</p><p className="mt-1 text-xs text-slate-500">{client.phone ?? "—"}</p></td><td className="px-5 py-4">{client.projects_count}</td><td className="px-5 py-4">{client.objects_count}</td><td className="px-5 py-4">{client.contracts_count}</td><td className="px-5 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${client.is_active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{client.is_active ? "Активен" : "Неактивен"}</span></td></tr>)}{!clients.length && <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">Клиенты не найдены.</td></tr>}</tbody></table></div></section>
  </div>;
}

function Metric({label, value, icon: Icon}: {label: string; value: number; icon: typeof Building2}) { return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-panel"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div><div className="rounded-xl bg-slate-100 p-3"><Icon size={20}/></div></div></article>; }
