import {ObjectForm} from "@/components/object-form";
import {getClients} from "@/lib/data/clients";
export const dynamic="force-dynamic";
export default async function NewObjectPage(){const clients=await getClients();return <div className="mx-auto max-w-3xl space-y-6"><h1 className="text-3xl font-bold">Создание объекта</h1><ObjectForm clients={clients.filter(x=>x.is_active)}/></div>}
