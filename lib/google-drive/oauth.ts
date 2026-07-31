type GoogleDriveOAuth = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export function getGoogleDriveOAuth(): GoogleDriveOAuth | null {
  const clientId = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_OAUTH_REFRESH_TOKEN;
  return clientId && clientSecret && refreshToken ? { clientId, clientSecret, refreshToken } : null;
}

async function accessToken(credentials: GoogleDriveOAuth) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: credentials.clientId, client_secret: credentials.clientSecret, refresh_token: credentials.refreshToken, grant_type: "refresh_token" }),
  });
  const data = await response.json() as GoogleTokenResponse;
  if (!response.ok || !data.access_token) {
    const detail = data.error_description || data.error || `HTTP ${response.status}`;
    throw new Error(`Google OAuth не выдал access token: ${detail}.`);
  }
  return data.access_token;
}

export async function uploadDocxToDrive({ fileName, bytes, folderId }: { fileName: string; bytes: Buffer; folderId: string }) {
  const credentials = getGoogleDriveOAuth();
  if (!credentials) throw new Error("Google Drive OAuth ещё не настроен.");
  const token = await accessToken(credentials);
  const boundary = `donelvit-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: fileName, parents: [folderId], mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const prefix = Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`);
  const suffix = Buffer.from(`\r\n--${boundary}--`);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": `multipart/related; boundary=${boundary}` },
    body: Buffer.concat([prefix, bytes, suffix]),
  });
  if (!response.ok) throw new Error(`Не удалось загрузить DOCX в Google Drive (HTTP ${response.status}).`);
  const file = await response.json() as { id?: string; name?: string; webViewLink?: string };
  if (!file.id) throw new Error("Google Drive не вернул идентификатор файла.");
  return { id: file.id, name: file.name ?? fileName, url: file.webViewLink ?? `https://drive.google.com/open?id=${file.id}` };
}
