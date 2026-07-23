import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function saveFileLocally(
  file: File,
): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${file.name}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, fileName), buffer);
  return `/uploads/${fileName}`;
}
