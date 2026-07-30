import { notFound } from "next/navigation";
import { ExpertReviewForm } from "@/components/expert-review-form";
import { getExpertReview } from "@/lib/data/expert-reviews";
import { getProjects } from "@/lib/data/projects";
import { getDocuments } from "@/lib/data/documents";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const [item, projects, documents] = await Promise.all([getExpertReview(Number(id)), getProjects(), getDocuments()]); if (!item) notFound(); return <ExpertReviewForm item={item} projects={projects.map((project) => ({ id: project.id, label: project.title }))} documents={documents.map((document) => ({ id: document.id, label: document.title }))} />; }
