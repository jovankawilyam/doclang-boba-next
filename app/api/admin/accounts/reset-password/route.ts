import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { authorizeAdminRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { validateAdminCsrf } from "@/lib/csrf";

function generateTemporaryPassword(): string {
  return crypto.randomBytes(8).toString("base64url");
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).id !== "number") {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const { id } = body as { id: number };
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "ID akun tidak valid" }, { status: 400 });
    }
    if (id === auth.admin.id) {
      return NextResponse.json({ success: false, error: "Gunakan menu Ubah Password untuk akun sendiri" }, { status: 400 });
    }

    const account = await prisma.adminAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();
    await prisma.adminAccount.update({
      where: { id },
      data: { passwordHash: hashPassword(temporaryPassword), lastLoginAt: null },
    });

    await prisma.adminSession.deleteMany({ where: { adminId: id } });

    return NextResponse.json({
      success: true,
      data: {
        temporaryPassword,
        username: account.username,
        name: account.name,
      },
    });
  } catch (error) {
    console.error("Admin password reset error:", error);
    return NextResponse.json({ success: false, error: "Gagal mereset password" }, { status: 500 });
  }
}
