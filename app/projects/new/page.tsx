import {ProjectWriteGate} from "@/components/auth-ui";
import {ProjectForm} from "@/components/project-form";
import {getProjectOptions} from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const options = await getProjectOptions();
  return <ProjectWriteGate nextPath="/projects/new"><div className="mx-auto max-w-5xl space-y-6"><header><p className="text-sm font-semibold text-red-700">Проекты</p><h1 className="mt-1 text-3xl font-bold">Создание проекта</h1><p className="mt-2 text-slate-500">Номер CP-XXXX-YYYY будет присвоен автоматически.</p></header><ProjectForm mode="create" {...options}/></div></ProjectWriteGate>;
}
