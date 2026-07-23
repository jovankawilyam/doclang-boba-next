import { Readable } from "stream";
import { google } from "googleapis";

function getDrive() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !key) return null;
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });
  return google.drive({ version: "v3", auth });
}

export async function uploadFile(
  file: File,
  fileName: string,
): Promise<string | null> {
  const drive = getDrive();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!drive || !folderId) return null;
  const buffer = Buffer.from(await file.arrayBuffer());
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: file.type || "application/octet-stream",
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
    supportsAllDrives: true,
  });
  const fileId = response.data.id;
  if (fileId) {
    await drive.permissions.create({
      fileId,
      requestBody: { role: "reader", type: "anyone" },
    });
  }
  return response.data.webViewLink ?? null;
}
