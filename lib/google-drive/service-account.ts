import { createSign } from "node:crypto";

type ServiceAccount = {
  client_email: string;
  private_key: string;
  token_uri?: string;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

export function getGoogleServiceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ServiceAccount;
    return parsed.client_email && parsed.private_key ? parsed : null;
  } catch {
    return null;
  }
}

async function accessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: account.client_email,
    scope: "https://www.googleapis.com/auth/drive.file",
    aud: account.token_uri ?? "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  const assertion = `${header}.${body}.${signer.sign(account.private_key).toString("base64url")}`;
  const response = await fetch(account.token_uri ?? "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
  });
  if (!response.ok) throw new Error("Google Drive не выдал access token.");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google Drive вернул неполный access token.");
  return data.access_token;
}

export async function uploadDocxToDrive({ fileName, bytes, folderId }: { fileName: string; bytes: Buffer; folderId: string }) {
  const token = await accessToken(getGoogleServiceAccount()!);
  const boundary = `donelvit-${crypto.randomUUID()}`;
  const metadata = JSON.stringify({ name: fileName, parents: [folderId], mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const prefix = Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`);
  const suffix = Buffer.from(`\r\n--${boundary}--`);
  const body = Buffer.concat([prefix, bytes, suffix]);
  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "content-type": `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!response.ok) throw new Error("Не удалось загрузить DOCX в Google Drive.");
  const file = await response.json() as { id?: string; name?: string; webViewLink?: string };
  if (!file.id) throw new Error("Google Drive не вернул идентификатор файла.");
  return { id: file.id, name: file.name ?? fileName, url: file.webViewLink ?? `https://drive.google.com/open?id=${file.id}` };
}
