import { RoleManagement } from "@/components/role-management";

export default function Page(){return <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-panel"><h1 className="text-3xl font-bold">Настройки</h1><p className="mt-3 text-slate-500">Supabase, Google Drive, Todoist и параметры нумерации проектов.</p><RoleManagement/></div>}
