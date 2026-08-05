import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAdminFromRequest, requireAdmin } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { validateAdminCsrf } from "@/lib/csrf";

export async function POST(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const admin = await getAdminFromRequest(request);
    if (!admin) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof (body as Record<string, unknown>).currentPassword !== "string" ||
      typeof (body as Record<string, unknown>).newPassword !== "string"
    ) {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const { currentPassword, newPassword } = body as { currentPassword: string; newPassword: string };
    const account = await prisma.adminAccount.findUnique({ where: { id: admin.id } });
    if (!account || !verifyPassword(currentPassword, account.passwordHash)) {
      return NextResponse.json({ success: false, error: "Password saat ini salah" }, { status: 401 });
    }
    if (newPassword.trim().length < 8) {
      return NextResponse.json({ success: false, error: "Password baru minimal 8 karakter" }, { status: 400 });
    }

    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });

    return NextResponse.json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    console.error("Admin change password error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengubah password" }, { status: 500 });
  }
}
