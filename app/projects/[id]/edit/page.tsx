import {notFound} from "next/navigation";
import {ProjectWriteGate} from "@/components/auth-ui";
import {ProjectForm} from "@/components/project-form";
import {getProject, getProjectOptions} from "@/lib/data/projects";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  const [project, options] = await Promise.all([getProject(Number(id)), getProjectOptions()]);
  if (!project) notFound();
  return <ProjectWriteGate nextPath={`/projects/${project.id}/edit`}><div className="mx-auto max-w-5xl space-y-6"><header><p className="text-sm font-semibold text-red-700">{project.project_number}</p><h1 className="mt-1 text-3xl font-bold">Редактирование проекта</h1></header><ProjectForm mode="edit" project={project} {...options}/></div></ProjectWriteGate>;
}
