import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ContractItem = { id: number; client_id: number; contract_number: string; contract_date: string | null; service_type: string | null; amount: number | null; currency: string; status: string; revision: string | null; client_name: string | null };
export type ContractDocument = { id: number; title: string; document_number: string | null; status: string };
export type ContractDetails = ContractItem & { contract_location: string | null; amount_words: string | null; advance_percent: number | null; execution_days: number | null; payment_days: number | null; drive_folder_url: string | null; documents: ContractDocument[] };

export async function getContracts(): Promise<ContractItem[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("contracts").select("id,client_id,contract_number,contract_date,service_type,amount,currency,status,revision,clients(legal_name)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row: any) => ({ ...row, client_name: row.clients?.legal_name ?? null }));
}

export async function getContract(id: number): Promise<ContractDetails | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("contracts").select("id,client_id,contract_number,contract_date,contract_location,service_type,amount,currency,amount_words,advance_percent,execution_days,payment_days,status,revision,drive_folder_url,clients(legal_name),documents(id,title,document_number,status)").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return { ...data, client_name: (data.clients as any)?.legal_name ?? null, documents: (data.documents ?? []) as ContractDocument[] };
}
