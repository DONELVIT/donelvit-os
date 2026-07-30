"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ClientDetails } from "@/lib/types";

export function ClientForm({ client }: { client?: ClientDetails }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState({
    legal_name: client?.legal_name ?? "", fiscal_code: client?.fiscal_code ?? "", vat_code: client?.vat_code ?? "",
    iban: client?.iban ?? "", bank_name: client?.bank_name ?? "", bank_bic: client?.bank_bic ?? "",
    legal_address: client?.legal_address ?? "", postal_address: client?.postal_address ?? "", email: client?.email ?? "",
    phone: client?.phone ?? "", representative_position: client?.representative_position ?? "",
    representative_name: client?.representative_name ?? "", signing_basis: client?.signing_basis ?? "",
    contact_person: client?.contact_person ?? "", notes: client?.notes ?? ""
  });
  const setValue = (key: keyof typeof values, value: string) => setValues((previous) => ({ ...previous, [key]: value }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!values.legal_name.trim()) return setError("Укажите наименование клиента.");
    const supabase = createClient();
    if (!supabase) return setError("Supabase не настроен.");
    setBusy(true);
    const payload = Object.fromEntries(Object.entries(values).map(([key, value]) => [`p_${key}`, value.trim() || null]));
    const result = client
      ? await supabase.rpc("update_client", { p_id: client.id, ...payload })
      : await supabase.rpc("create_client", payload);
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    const data: any = result.data;
    const id = Array.isArray(data) ? data[0]?.id : data?.id;
    router.push(`/clients/${id ?? client?.id}`);
    router.refresh();
  }

  async function archive() {
    if (!client || !confirm("Переместить клиента в архив?")) return;
    const supabase = createClient();
    if (!supabase) return;
    setBusy(true);
    const { error: archiveError } = await supabase.rpc("archive_client", { p_id: client.id });
    if (archiveError) { setError(archiveError.message); setBusy(false); return; }
    router.push("/clients");
    router.refresh();
  }

  const fields = [
    ["legal_name", "Наименование *"], ["fiscal_code", "IDNO"], ["vat_code", "TVA"],
    ["iban", "IBAN"], ["bank_name", "Banca"], ["bank_bic", "BIC"], ["email", "Email"],
    ["phone", "Телефон"], ["contact_person", "Контактное лицо"],
    ["representative_position", "Должность представителя"], ["representative_name", "Представитель"],
    ["signing_basis", "Основание подписания"], ["legal_address", "Юридический адрес"],
    ["postal_address", "Почтовый адрес"], ["notes", "Примечания"]
  ] as const;

  return <form onSubmit={submit} className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-lg font-bold">Реквизиты и контакты</h2><div className="mt-5 grid gap-5 md:grid-cols-2">{fields.map(([key, label]) => <label key={key} className={key === "legal_name" || key === "notes" ? "md:col-span-2" : ""}><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{key === "notes" ? <textarea className="input min-h-28" value={values[key]} onChange={(event) => setValue(key, event.target.value)} /> : <input className="input" value={values[key]} onChange={(event) => setValue(key, event.target.value)} />}</label>)}</div></section>{error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="flex justify-between rounded-2xl border bg-white p-4"><div>{client?.is_active && <button type="button" onClick={archive} disabled={busy} className="inline-flex gap-2 rounded-xl border border-amber-300 px-4 py-3 text-sm font-semibold text-amber-800"><Archive size={17} />В архив</button>}</div><div className="flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-xl border px-4 py-3 text-sm font-semibold"><X size={17} /></button><button disabled={busy} className="inline-flex gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white"><Save size={17} />{busy ? "Сохранение..." : client ? "Сохранить" : "Создать клиента"}</button></div></div></form>;
}
