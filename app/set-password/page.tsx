import {SetPasswordForm} from "@/components/auth-ui";

export const dynamic = "force-dynamic";

export default function SetPasswordPage() {
  return <div className="mx-auto max-w-md space-y-6"><header><p className="text-sm font-semibold text-red-700">DONELVIT OS</p><h1 className="mt-1 text-3xl font-bold">Установите пароль</h1><p className="mt-2 text-slate-500">Завершите настройку учётной записи сотрудника.</p></header><SetPasswordForm/></div>;
}
