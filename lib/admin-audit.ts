import { prisma } from "@/lib/db/prisma";

export async function logAdminAction(entry: {
  actorId?: number;
  actorName: string;
  action: string;
  targetId?: number;
  targetUsername?: string;
  detail?: string;
}) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "AdminAuditLog" ("actorId", "actorName", "action", "targetId", "targetUsername", "detail", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      entry.actorId ?? null,
      entry.actorName,
      entry.action,
      entry.targetId ?? null,
      entry.targetUsername ?? "",
      entry.detail ?? "",
    );
  } catch (err) {
    console.error("Audit log error:", (err as Error).message);
  }
}
