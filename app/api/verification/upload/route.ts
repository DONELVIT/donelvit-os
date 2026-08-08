import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const allowedContentTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/dwg",
  "image/jpeg",
  "image/png"
];

async function getUserId(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return null;

  const supabase = createClient(url, key, {
    db: { schema: "donelvit" },
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;
  const { data: role } = await supabase.rpc("get_my_role");
  return role === "admin" || role === "engineer" ? user.id : null;
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId) return NextResponse.json({ error: "Требуется роль инженера или администратора." }, { status: 403 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ userId })
      })
    });
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Не удалось выдать разрешение на загрузку." }, { status: 400 });
  }
}
