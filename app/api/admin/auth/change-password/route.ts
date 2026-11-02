import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeAdminRole } from "@/lib/auth";
import { verifyPassword, hashPassword } from "@/lib/password";
import { isValidAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { validateAdminCsrf, ADMIN_CSRF_COOKIE } from "@/lib/csrf";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-types";

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"]);
  if (!auth.ok) return auth.response;
  const admin = auth.admin;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
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
    if (!isValidAdminPassword(newPassword)) {
      return NextResponse.json({ success: false, error: `Password baru minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter` }, { status: 400 });
    }

    await prisma.adminAccount.update({
      where: { id: admin.id },
      data: { passwordHash: hashPassword(newPassword) },
    });
    await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });

    const response = NextResponse.json({ success: true, message: "Password berhasil diubah" });
    response.cookies.set(ADMIN_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    response.cookies.set(ADMIN_CSRF_COOKIE, "", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
    });
    return response;
  } catch (error) {
    console.error("Admin change password error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengubah password" }, { status: 500 });
  }
}
