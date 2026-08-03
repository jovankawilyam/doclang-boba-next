import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_HEADER, type AdminRole, type AdminSessionData } from "@/lib/admin-types";

function sessionTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);

  const headerToken = request.headers.get(ADMIN_SESSION_HEADER);
  if (headerToken) return headerToken;

  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(`${ADMIN_SESSION_COOKIE}=`.length) ?? null;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function normalizeAdminName(name: string): string {
  return name.trim().toUpperCase();
}

export function createSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function storeAdminSession(adminId: number, token: string) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await prisma.adminSession.create({
    data: {
      tokenHash: hashToken(token),
      adminId,
      expiresAt,
    },
  });
}

export async function getAdminSession(token: string | null): Promise<AdminSessionData | null> {
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.adminSession.delete({ where: { tokenHash: session.tokenHash } }).catch(() => {});
    return null;
  }
  if (!session.admin.isActive) return null;

  return {
    id: session.admin.id,
    username: session.admin.username,
    name: session.admin.name,
    role: session.admin.role as AdminRole,
  };
}

export async function getAdminFromRequest(request: Request): Promise<AdminSessionData | null> {
  return getAdminSession(sessionTokenFromRequest(request));
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function requireAdminRole(
  request: Request,
  allowedRoles: AdminRole[],
): Promise<Response | null> {
  const admin = await getAdminFromRequest(request);
  if (!admin) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!allowedRoles.includes(admin.role)) {
    return Response.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function hasAdminCookie(request: Request): Promise<boolean> {
  return Boolean(await getAdminFromRequest(request));
}

export function hashSessionToken(token: string): string {
  return hashToken(token);
}
