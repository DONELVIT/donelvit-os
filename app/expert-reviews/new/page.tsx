import { ExpertReviewForm } from "@/components/expert-review-form";
import { getProjects } from "@/lib/data/projects";
import { getDocuments } from "@/lib/data/documents";
export default async function Page() { const [projects, documents] = await Promise.all([getProjects(), getDocuments()]); return <ExpertReviewForm projects={projects.map((project) => ({ id: project.id, label: project.title }))} documents={documents.map((document) => ({ id: document.id, label: document.title }))} />; }
