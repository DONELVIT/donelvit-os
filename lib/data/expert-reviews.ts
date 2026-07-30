import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ExpertReview = { id: number; project_id: number; document_id: number | null; title: string; description: string | null; normative_reference: string | null; severity: string; status: string; resolution: string | null; resolved_at: string | null; project_name: string | null; document_title: string | null };

function mapReview(row: any): ExpertReview { return { ...row, project_name: row.projects?.title ?? null, document_title: row.documents?.title ?? null }; }

export async function getExpertReviews(): Promise<ExpertReview[]> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("expert_reviews").select("id,project_id,document_id,title,description,normative_reference,severity,status,resolution,resolved_at,projects(title),documents(title)").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapReview);
}

export async function getExpertReview(id: number): Promise<ExpertReview | null> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("expert_reviews").select("id,project_id,document_id,title,description,normative_reference,severity,status,resolution,resolved_at,projects(title),documents(title)").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapReview(data) : null;
}
