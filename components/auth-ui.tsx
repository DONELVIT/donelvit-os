"use client";

import Link from "next/link";
import {FormEvent, ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {LogIn, LogOut} from "lucide-react";
import {createClient} from "@/lib/supabase/client";

type AuthStatus = "loading" | "signed-in" | "signed-out" | "unavailable";

function useAuthUser() {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("unavailable");
      return;
    }

    let active = true;
    void supabase.auth.getUser().then(({data}) => {
      if (!active) return;
      setEmail(data.user?.email ?? "");
      setStatus(data.user ? "signed-in" : "signed-out");
    });

    const {data: listener} = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setEmail(session?.user.email ?? "");
      setStatus(session?.user ? "signed-in" : "signed-out");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {status, email};
}

function safeNextPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") ? path : "/projects";
}

export function AuthStatusControl() {
  const router = useRouter();
  const {status, email} = useAuthUser();

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.refresh();
  }

  if (status === "loading") return <div className="h-9 w-28 animate-pulse rounded-full bg-slate-100"/>;
  if (status === "signed-in") return <div className="flex items-center gap-2"><span className="max-w-48 truncate rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">{email}</span><button type="button" onClick={signOut} className="rounded-full border border-slate-300 p-2 text-slate-600 hover:bg-slate-100" aria-label="Выйти"><LogOut size={16}/></button></div>;
  if (status === "unavailable") return <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">Режим просмотра</span>;
  return <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white"><LogIn size={16}/>Войти</Link>;
}

export function ProjectWriteLink({href, className, children}: {href: string; className: string; children?: ReactNode}) {
  const {status} = useAuthUser();
  if (status === "loading") return <span className="h-11 w-36 animate-pulse rounded-xl bg-slate-100"/>;
  if (status === "signed-in") return <Link href={href} className={className}>{children}</Link>;
  return <Link href={`/login?next=${encodeURIComponent(safeNextPath(href))}`} className={className}><LogIn size={18}/>Войти для изменений</Link>;
}

export function ProjectWriteGate({nextPath, children}: {nextPath: string; children: ReactNode}) {
  const router = useRouter();
  const {status} = useAuthUser();

  useEffect(() => {
    if (status === "signed-out") router.replace(`/login?next=${encodeURIComponent(safeNextPath(nextPath))}`);
  }, [nextPath, router, status]);

  if (status === "signed-in") return <>{children}</>;
  if (status === "unavailable") return <AccessMessage title="Supabase не настроен" text="Вход сотрудников недоступен, пока не добавлены публичные переменные Supabase."/>;
  return <AccessMessage title="Проверяем доступ" text="Загрузка учётной записи сотрудника..."/>;
}

export function LoginForm({nextPath}: {nextPath: string}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const supabase = createClient();
    if (!supabase) return setError("Supabase не настроен.");
    setBusy(true);
    const {error: signInError} = await supabase.auth.signInWithPassword({email: email.trim(), password});
    if (signInError) {
      setError("Не удалось войти. Проверьте email и пароль.");
      setBusy(false);
      return;
    }
    router.replace(safeNextPath(nextPath));
    router.refresh();
  }

  return <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel">
    <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">Рабочий email</label><input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)}/></div>
    <div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">Пароль</label><input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)}/></div>
    {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
    <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><LogIn size={17}/>{busy ? "Вход..." : "Войти"}</button>
    <p className="text-sm text-slate-500">Учётная запись создаётся только по приглашению администратора.</p>
  </form>;
}

export function SetPasswordForm() {
  const router = useRouter();
  const {status, email} = useAuthUser();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "signed-out") router.replace("/login");
  }, [router, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password.length < 12) return setError("Пароль должен содержать не менее 12 символов.");
    if (password !== confirmation) return setError("Пароли не совпадают.");
    const supabase = createClient();
    if (!supabase) return setError("Supabase не настроен.");
    setBusy(true);
    const {error: updateError} = await supabase.auth.updateUser({password});
    if (updateError) {
      setError("Не удалось установить пароль. Откройте приглашение ещё раз или обратитесь к администратору.");
      setBusy(false);
      return;
    }
    router.replace("/projects");
    router.refresh();
  }

  if (status !== "signed-in") return <AccessMessage title="Проверяем приглашение" text="Загрузка учётной записи сотрудника..."/>;
  return <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">Учётная запись: {email}</p><div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="new-password">Новый пароль</label><input id="new-password" className="input" type="password" autoComplete="new-password" required minLength={12} value={password} onChange={(event) => setPassword(event.target.value)}/></div><div><label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="confirm-password">Повторите пароль</label><input id="confirm-password" className="input" type="password" autoComplete="new-password" required minLength={12} value={confirmation} onChange={(event) => setConfirmation(event.target.value)}/></div>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}<button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Сохранение..." : "Установить пароль"}</button></form>;
}

export function AuthCallback() {
  const router = useRouter();
  const {status} = useAuthUser();
  useEffect(() => {
    if (status === "signed-in") router.replace("/set-password");
  }, [router, status]);
  if (status === "signed-out") return <AccessMessage title="Ссылка недействительна" text="Откройте новое приглашение от администратора или войдите со своим паролем."/>;
  return <AccessMessage title="Подтверждаем приглашение" text="Пожалуйста, подождите..."/>;
}

function AccessMessage({title, text}: {title: string; text: string}) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-panel"><h2 className="text-lg font-bold">{title}</h2><p className="mt-2 text-sm text-slate-500">{text}</p></div>;
}
