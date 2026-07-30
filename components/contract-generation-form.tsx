"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ObjectOption = { id: number; name: string; address: string | null };

export function ContractGenerationForm({ contractId, contractNumber, objects }: { contractId: number; contractNumber: string; objects: ObjectOption[] }) {
  const router = useRouter();
  const [objectId, setObjectId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function generate() {
    if (!objectId) return setError("Выберите объект для договора.");
    const supabase = createClient();
    if (!supabase) return setError("Supabase не настроен.");
    setLoading(true); setError("");
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Войдите в систему, чтобы сформировать договор.");
      const response = await fetch(`/api/contracts/${contractId}/generate`, { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ objectId: Number(objectId) }) });
      const result = await response.json() as { error?: string; fileName?: string; driveFileUrl?: string };
      if (!response.ok || !result.fileName || !result.driveFileUrl) throw new Error(result.error ?? "Не удалось сформировать договор.");
      const { error: saveError } = await supabase.rpc("create_document", { p_project_id: null, p_contract_id: contractId, p_document_type: "contract", p_document_number: contractNumber, p_title: result.fileName, p_drive_file_url: result.driveFileUrl });
      if (saveError) throw new Error(`DOCX загружен в Drive, но ссылка не сохранена: ${saveError.message}`);
      router.refresh();
      window.open(result.driveFileUrl, "_blank", "noopener,noreferrer");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Не удалось сформировать договор."); }
    finally { setLoading(false); }
  }
  return <section className="rounded-2xl border bg-white p-6 shadow-panel"><h2 className="text-xl font-bold">Сформировать договор</h2><p className="mt-2 text-sm text-slate-500">Выберите объект: его наименование и адрес попадут в DOCX. Готовый файл будет загружен в Google Drive.</p><div className="mt-4 flex flex-col gap-3 sm:flex-row"><select className="input" value={objectId} onChange={(event) => setObjectId(event.target.value)}><option value="">Выберите объект</option>{objects.map((object) => <option key={object.id} value={object.id}>{object.name}{object.address ? ` — ${object.address}` : ""}</option>)}</select><button type="button" className="rounded-xl bg-red-700 px-5 py-3 font-semibold text-white disabled:opacity-60" onClick={generate} disabled={loading || objects.length === 0}>{loading ? "Формирование…" : "Сформировать DOCX"}</button></div>{objects.length === 0 && <p className="mt-3 text-sm text-amber-700">У этого клиента нет объектов. Сначала добавьте объект.</p>}{error && <p className="mt-3 text-sm text-red-700">{error}</p>}</section>;
}
