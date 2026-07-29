import {LoginForm} from "@/components/auth-ui";

export const dynamic = "force-dynamic";

export default async function LoginPage({searchParams}: {searchParams: Promise<{next?: string}>}) {
  const {next} = await searchParams;
  const nextPath = next?.startsWith("/") && !next.startsWith("//") ? next : "/projects";
  return <div className="mx-auto max-w-md space-y-6"><header><p className="text-sm font-semibold text-red-700">DONELVIT OS</p><h1 className="mt-1 text-3xl font-bold">Вход для сотрудников</h1><p className="mt-2 text-slate-500">Используйте учётную запись, полученную по приглашению.</p></header><LoginForm nextPath={nextPath}/></div>;
}
