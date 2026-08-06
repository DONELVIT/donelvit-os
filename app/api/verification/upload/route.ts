import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const maxBytes = 50 * 1024 * 1024;
const acceptedTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function getUser(accessToken: string | null) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !url || !anon) return null;

  const auth = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
  } = await auth.auth.getUser(accessToken);
  return user;
}

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const user = await getUser(clientPayload);
        if (!user || !pathname.startsWith(`verification/${user.id}/`)) {
          throw new Error("Требуется авторизованная сессия сотрудника.");
        }

        return {
          allowedContentTypes: acceptedTypes,
          maximumSizeInBytes: maxBytes,
          addRandomSuffix: true,
          validUntil: Date.now() + 15 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось подготовить загрузку файла.";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
