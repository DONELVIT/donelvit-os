"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Role = "admin" | "engineer" | "viewer";
type Member = { user_id: string; email: string; role: Role };
const labels: Record<Role, string> = { admin: "Администратор", engineer: "Инженер", viewer: "Наблюдатель" };

export function RoleManagement() {
  const [role, setRole] = useState<Role | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    if (!supabase) return setError("Supabase не настроен.");
    const { data: mine, error: mineError } = await supabase.rpc("get_my_role");
    if (mineError || !mine) return setError("Войдите в систему, чтобы увидеть роль.");
    const ownRole = mine as Role;
    setRole(ownRole);
    if (ownRole !== "admin") return;
    const { data, error: membersError } = await supabase.rpc("list_role_members");
    if (membersError) return setError(membersError.message);
    setMembers((data ?? []) as Member[]);
  }

  useEffect(() => { void load(); }, []);

  async function changeRole(userId: string, nextRole: Role) {
    const supabase = createClient();
    if (!supabase) return;
    setBusy(userId); setError("");
    const { error: updateError } = await supabase.rpc("set_user_role", { p_user_id: userId, p_role: nextRole });
    if (updateError) setError(updateError.message);
    else await load();
    setBusy(null);
  }

  if (error) return <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>;
  if (!role) return <div className="mt-4 h-24 animate-pulse rounded-xl bg-slate-100"/>;
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-panel"><h2 className="text-xl font-bold">Доступ сотрудников</h2><p className="mt-2 text-sm text-slate-500">Ваша роль: <strong>{labels[role]}</strong>.</p>{role === "admin" ? <><p className="mt-4 text-sm text-slate-500">Новые приглашённые сотрудники получают роль «Наблюдатель». Администратор может изменить её здесь.</p><div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="pb-3">Сотрудник</th><th className="pb-3">Роль</th></tr></thead><tbody className="divide-y">{members.map((member) => <tr key={member.user_id}><td className="py-3 font-medium">{member.email}</td><td className="py-3"><select className="input max-w-52" value={member.role} disabled={busy === member.user_id} onChange={(event) => void changeRole(member.user_id, event.target.value as Role)}>{(Object.keys(labels) as Role[]).map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select></td></tr>)}</tbody></table></div></> : <p className="mt-4 text-sm text-slate-500">Изменять роли сотрудников может только администратор.</p>}</section>;
}
