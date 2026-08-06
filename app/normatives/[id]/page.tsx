import Link from "next/link";
import { notFound } from "next/navigation";
import { getNormative } from "@/lib/data/normatives";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const item = await getNormative(Number(id)); if (!item) notFound();
  return <div className="space-y-6"><Link href="/normatives" className="font-semibold text-red-700">К каталогу</Link><section className="rounded-2xl border bg-white p-6 shadow-panel"><div className="flex flex-wrap items-center gap-3"><span className="font-semibold text-red-700">{item.code}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium">{item.family}</span></div><h1 className="mt-3 text-3xl font-bold">{item.title}</h1><dl className="mt-6 grid gap-4 md:grid-cols-2">{[["Статус", item.status === "active" ? "Действует" : item.status],["Юрисдикция", item.jurisdiction],["Язык", item.language],["Дата вступления", item.effective_date ?? "—"],["Заменяет", item.replaces_code ?? "—"],["Источник", item.source_name]].map(([label,value])=><div key={label}><dt className="text-xs uppercase text-slate-500">{label}</dt><dd className="mt-1 font-medium">{value}</dd></div>)}</dl>{item.metadata.title_ru && <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm"><span className="font-semibold">Русское название: </span>{item.metadata.title_ru}</p>}<a className="mt-6 inline-flex rounded-xl bg-red-700 px-5 py-3 font-semibold text-white" href={item.source_url} target="_blank" rel="noreferrer">Открыть на EDNC</a></section></div>;
}
