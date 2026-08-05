import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/password";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const limit = consumeRateLimit(getRateLimitKey("admin-reset-password", request), {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const payload = body as Record<string, unknown>;
    const token = typeof payload.token === "string" ? payload.token.trim() : "";
    const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";

    if (!token || newPassword.length < 8) {
      return NextResponse.json({ success: false, error: "Token atau password tidak valid" }, { status: 400 });
    }

    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { admin: true } });
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Token reset tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    await prisma.adminAccount.update({
      where: { id: resetToken.adminId },
      data: { passwordHash: hashPassword(newPassword), lastLoginAt: null },
    });
    await prisma.adminSession.deleteMany({ where: { adminId: resetToken.adminId } });
    await prisma.passwordResetToken.deleteMany({ where: { adminId: resetToken.adminId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses permintaan" }, { status: 500 });
  }
}
