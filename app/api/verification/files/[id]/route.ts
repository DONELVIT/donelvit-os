import { get } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { id } = await params;
  if (!token || !url || !key || !/^\d+$/.test(id)) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const supabase = createClient(url, key, { db: { schema: "donelvit" }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: "Требуется вход в систему." }, { status: 401 });
  const { data: file } = await supabase.from("verification_files").select("file_name,content_type,blob_url").eq("id", Number(id)).single();
  if (!file) return NextResponse.json({ error: "Файл не найден." }, { status: 404 });
  const result = await get(file.blob_url, { access: "private", ifNoneMatch: request.headers.get("if-none-match") ?? undefined });
  if (!result) return NextResponse.json({ error: "Файл не найден в хранилище." }, { status: 404 });
  if (result.statusCode === 304) return new NextResponse(null, { status: 304, headers: { ETag: result.blob.etag, "Cache-Control": "private, no-cache" } });
  return new NextResponse(result.stream, { headers: { "Content-Type": file.content_type || result.blob.contentType, "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.file_name)}`, "X-Content-Type-Options": "nosniff", ETag: result.blob.etag, "Cache-Control": "private, no-cache" } });
}
