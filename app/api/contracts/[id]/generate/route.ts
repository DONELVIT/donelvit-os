import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { renderContractDocx } from "@/lib/contracts/contract-docx";
import { getGoogleServiceAccount, uploadDocxToDrive } from "@/lib/google-drive/service-account";

export const runtime = "nodejs";

const months = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
const text = (value: unknown) => value == null ? "" : String(value);

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = request.headers.get("authorization");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const folderId = process.env.GOOGLE_DRIVE_CONTRACTS_FOLDER_ID;
  if (!auth || !url || !key) return NextResponse.json({ error: "Требуется авторизованная сессия." }, { status: 401 });
  if (!folderId || !getGoogleServiceAccount()) return NextResponse.json({ error: "Google Drive ещё не настроен." }, { status: 503 });

  const supabase = createClient(url, key, { db: { schema: "donelvit" }, global: { headers: { Authorization: auth } } });
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user.user) return NextResponse.json({ error: "Сессия недействительна." }, { status: 401 });

  const { id } = await params;
  const body = await request.json() as { objectId?: number };
  if (!Number.isInteger(body.objectId)) return NextResponse.json({ error: "Выберите объект." }, { status: 400 });

  const { data: contract, error: contractError } = await supabase.from("contracts").select("id,client_id,contract_number,contract_date,contract_location,amount,amount_words,currency,clients(legal_name,legal_address,fiscal_code,representative_name,representative_position,signing_basis,iban,bank_name,bank_bic,phone,email)").eq("id", Number(id)).maybeSingle();
  if (contractError || !contract) return NextResponse.json({ error: "Договор не найден." }, { status: 404 });
  const { data: object, error: objectError } = await supabase.from("objects").select("id,name,address").eq("id", body.objectId).eq("client_id", contract.client_id).maybeSingle();
  if (objectError || !object) return NextResponse.json({ error: "Объект не относится к клиенту договора." }, { status: 400 });

  try {
    const client = contract.clients as unknown as Record<string, unknown> | null;
    const date = contract.contract_date ? new Date(`${contract.contract_date}T00:00:00`) : new Date();
    const amount = contract.amount == null ? "" : new Intl.NumberFormat("ro-MD", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(contract.amount));
    const bytes = await renderContractDocx({
      NR_ORDINE: text(contract.contract_number), LOCALITATE: text(contract.contract_location), ZI: String(date.getDate()), LUNA: months[date.getMonth()],
      BENEFICIAR_DEN: text(client?.legal_name), BENEFICIAR_ADRESA: text(client?.legal_address), BENEFICIAR_CF: text(client?.fiscal_code),
      BENEFICIAR_FUNCTIE: text(client?.representative_position), BENEFICIAR_Rep: text(client?.representative_name), BENEFICIAR_BAZA: text(client?.signing_basis),
      DENUMIRE_OBIECT: text(object.name), ADRESA_OBIECT: text(object.address), SUMA_NUMERIC: amount, SUMA_LITERE: text(contract.amount_words),
      BENEFICIAR_IBAN: text(client?.iban), BENEFICIAR_BANCA: text(client?.bank_name), BENEFICIAR_BIC: text(client?.bank_bic), BENEFICIAR_TEL: text(client?.phone), BENEFICIAR_EMAIL: text(client?.email),
    });
    const fileName = `Договор ${contract.contract_number}.docx`;
    const file = await uploadDocxToDrive({ fileName, bytes, folderId });
    return NextResponse.json({ fileName: file.name, driveFileUrl: file.url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось сформировать договор." }, { status: 500 });
  }
}
