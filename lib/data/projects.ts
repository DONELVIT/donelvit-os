import { createServerSupabaseClient } from "@/lib/supabase/server";
import { demoProjects } from "@/lib/demo-data";
import type { ProjectDetails, ProjectDocument, ProjectListItem, ProjectSystem, SelectOption } from "@/lib/types";

const projectSelect = `
  id, project_number, title, stage, status, start_date, due_date, amount, currency,
  responsible_person, client_id, object_id, project_type_id, notes, location, created_at, updated_at,
  drive_folder_url, todoist_url,
  clients!projects_client_id_fkey(legal_name),
  objects!projects_object_id_fkey(name),
  project_types!projects_project_type_id_fkey(name)
`;

function mapProject(row:any):ProjectDetails {
 return {
  id:row.id, project_number:row.project_number, title:row.title, stage:row.stage, status:row.status,
  start_date:row.start_date, due_date:row.due_date, amount:row.amount===null?null:Number(row.amount),
  currency:String(row.currency??"MDL").trim(), responsible_person:row.responsible_person,
  client_id:row.client_id, object_id:row.object_id, project_type_id:row.project_type_id,
  client_name:row.clients?.legal_name??"—", object_name:row.objects?.name??null,
  project_type_name:row.project_types?.name??null, notes:row.notes, location:row.location,
  created_at:row.created_at, updated_at:row.updated_at, drive_folder_url:row.drive_folder_url,
  todoist_url:row.todoist_url
 };
}
function demoProjectDetails(project: ProjectListItem): ProjectDetails {
 return {...project,client_id:0,object_id:null,project_type_id:0,start_date:null,notes:null,location:null,created_at:"",updated_at:"",drive_folder_url:null,todoist_url:null};
}

function hasPublicSupabaseConfig() {
 return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getProjects():Promise<ProjectListItem[]> {
 if (!hasPublicSupabaseConfig()) return demoProjects;
 const s=createServerSupabaseClient(); if(!s) throw new Error("Supabase не настроен.");
 const {data,error}=await s.from("projects").select(projectSelect).order("created_at",{ascending:false});
 if(error) throw new Error(error.message); return (data??[]).map(mapProject);
}
export async function getProject(id:number):Promise<ProjectDetails|null>{
 if (!hasPublicSupabaseConfig()) {
  const project=demoProjects.find((item)=>item.id===id);
  return project ? demoProjectDetails(project) : null;
 }
 const s=createServerSupabaseClient(); if(!s) throw new Error("Supabase не настроен.");
 const {data,error}=await s.from("projects").select(projectSelect).eq("id",id).maybeSingle();
 if(error) throw new Error(error.message); return data?mapProject(data):null;
}
export async function getProjectOptions(){
 if (!hasPublicSupabaseConfig()) return {clients:[] as SelectOption[],objects:[] as SelectOption[],types:[] as SelectOption[]};
 const s=createServerSupabaseClient(); if(!s) throw new Error("Supabase не настроен.");
 const [c,o,t]=await Promise.all([
  s.from("clients").select("id, legal_name").eq("is_active",true).order("legal_name"),
  s.from("objects").select("id, name, client_id").order("name"),
  s.from("project_types").select("id, name").eq("is_active",true).order("id")
 ]);
 const e=c.error??o.error??t.error; if(e) throw new Error(e.message);
 return {clients:(c.data??[]).map((x:any)=>({id:x.id,name:x.legal_name})),objects:(o.data??[]) as SelectOption[],types:(t.data??[]) as SelectOption[]};
}
export async function getProjectSystems(projectId:number):Promise<ProjectSystem[]>{
 if (!hasPublicSupabaseConfig()) return [];
 const s=createServerSupabaseClient(); if(!s) throw new Error("Supabase не настроен.");
 const {data,error}=await s.from("project_systems").select(`notes, system_types!project_systems_system_type_id_fkey(id,code,name,description)`).eq("project_id",projectId);
 if(error) throw new Error(error.message);
 return (data??[]).map((r:any)=>({id:r.system_types?.id,code:r.system_types?.code??"—",name:r.system_types?.name??"Система",description:r.system_types?.description??null,notes:r.notes??null}));
}
export async function getProjectDocuments(projectId:number):Promise<ProjectDocument[]>{
 if (!hasPublicSupabaseConfig()) return [];
 const s=createServerSupabaseClient(); if(!s) throw new Error("Supabase не настроен.");
 const {data,error}=await s.from("documents").select("id,document_type,document_number,title,status,revision,issued_at,drive_file_url").eq("project_id",projectId).order("created_at",{ascending:false});
 if(error) throw new Error(error.message); return (data??[]) as ProjectDocument[];
}
