import { demoProjects } from "@/lib/demo-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ClientDetails, ClientListItem } from "@/lib/types";

function hasPublicSupabaseConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function numberFromRelation(value: unknown) {
  if (Array.isArray(value)) return Number(value[0]?.count ?? 0);
  if (value && typeof value === "object" && "count" in value) return Number((value as {count?: unknown}).count ?? 0);
  return 0;
}

function mapClient(row: any): ClientListItem {
  return {
    id: row.id,
    legal_name: row.legal_name,
    fiscal_code: row.fiscal_code,
    email: row.email,
    phone: row.phone,
    is_active: row.is_active,
    projects_count: numberFromRelation(row.projects),
    objects_count: numberFromRelation(row.objects),
    contracts_count: numberFromRelation(row.contracts)
  };
}

function demoClients(): ClientListItem[] {
  return Array.from(new Map(demoProjects.map((project) => [project.client_name, project])).values()).map((project, index) => ({
    id: index + 1,
    legal_name: project.client_name,
    fiscal_code: null,
    email: null,
    phone: null,
    is_active: true,
    projects_count: demoProjects.filter((item) => item.client_name === project.client_name).length,
    objects_count: project.object_name ? 1 : 0,
    contracts_count: 0
  }));
}

export async function getClients(): Promise<ClientListItem[]> {
  if (!hasPublicSupabaseConfig()) return demoClients();
  const supabase = createServerSupabaseClient();
  if (!supabase) return demoClients();
  const {data, error} = await supabase
    .from("clients")
    .select("id, legal_name, fiscal_code, email, phone, is_active, projects(count), objects(count), contracts(count)")
    .order("legal_name");
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapClient);
}

export async function getClient(id: number): Promise<ClientDetails | null> {
  if (!hasPublicSupabaseConfig()) {
    const client = demoClients().find((item) => item.id === id);
    return client ? {...client, vat_code: null, legal_address: null, postal_address: null, iban: null, bank_name: null, bank_bic: null, representative_position: null, representative_name: null, signing_basis: null, contact_person: null, notes: null} : null;
  }
  const supabase = createServerSupabaseClient();
  if (!supabase) return null;
  const {data, error} = await supabase
    .from("clients")
    .select("id, legal_name, fiscal_code, vat_code, legal_address, postal_address, iban, bank_name, bank_bic, email, phone, representative_position, representative_name, signing_basis, contact_person, notes, is_active, projects(count), objects(count), contracts(count)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {...mapClient(data), vat_code: data.vat_code, legal_address: data.legal_address, postal_address: data.postal_address, iban: data.iban, bank_name: data.bank_name, bank_bic: data.bank_bic, representative_position: data.representative_position, representative_name: data.representative_name, signing_basis: data.signing_basis, contact_person: data.contact_person, notes: data.notes};
}
