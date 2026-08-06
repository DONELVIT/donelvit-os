import { createServerSupabaseClient } from "@/lib/supabase/server";

export type Normative = { id: number; code: string; title: string; family: string; jurisdiction: string; language: string; status: string; effective_date: string | null; source_name: string; source_url: string; source_published_at: string | null; replaces_code: string | null; metadata: Record<string, string> };

export async function getNormatives(query = "", family = "") {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [] as Normative[];
  let request = supabase.from("normatives").select("*").order("effective_date", { ascending: false });
  if (family) request = request.eq("family", family);
  if (query.trim()) request = request.or(`code.ilike.%${query.trim()}%,title.ilike.%${query.trim()}%`);
  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data ?? []) as Normative[];
}

export async function getNormative(id: number) {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("normatives").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as Normative | null;
}
