import {createServerSupabaseClient} from "@/lib/supabase/server";

export type ContractItem={id:number;client_id:number;contract_number:string;contract_date:string|null;service_type:string|null;amount:number|null;currency:string;status:string;revision:string|null;client_name:string|null};

export async function getContracts():Promise<ContractItem[]>{const s=createServerSupabaseClient();if(!s)return [];const {data,error}=await s.from("contracts").select("id,client_id,contract_number,contract_date,service_type,amount,currency,status,revision,clients(legal_name)").order("created_at",{ascending:false});if(error)throw new Error(error.message);return (data??[]).map((x:any)=>({...x,client_name:x.clients?.legal_name??null}));}

export async function getContract(id:number){const s=createServerSupabaseClient();if(!s)return null;const {data,error}=await s.from("contracts").select("id,client_id,contract_number,contract_date,contract_location,service_type,amount,currency,amount_words,advance_percent,execution_days,payment_days,status,revision,drive_folder_url,clients(legal_name)").eq("id",id).maybeSingle();if(error)throw new Error(error.message);return data?{...data,client_name:(data.clients as any)?.legal_name??null}:null;}
