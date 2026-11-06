import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { authorizeAdminRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { validateAdminCsrf } from "@/lib/csrf";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { isEmailConfigured, sendTemporaryPasswordEmail } from "@/lib/email";
import { logAdminAction } from "@/lib/admin-audit";

const SAFE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generateTemporaryPassword(length = 12): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += SAFE_CHARS[crypto.randomInt(SAFE_CHARS.length)];
  }
  return result;
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    const limit = await consumeRateLimit(getRateLimitKey("admin-reset-password", request), {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return NextResponse.json({ success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." }, { status: 429 });
    }

    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).id !== "number") {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const { id, delivery = "email" } = body as { id: number; delivery?: unknown };
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "ID akun tidak valid" }, { status: 400 });
    }
    if (delivery !== "manual" && delivery !== "email") {
      return NextResponse.json({ success: false, error: "Metode pengiriman tidak valid" }, { status: 400 });
    }
    if (id === auth.admin.id) {
      return NextResponse.json({ success: false, error: "Gunakan menu Ubah Password untuk akun sendiri" }, { status: 400 });
    }

    const account = await prisma.adminAccount.findUnique({ where: { id } });
    if (!account) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 });
    }
    if (!account.isActive) {
      return NextResponse.json({ success: false, error: "Aktifkan akun terlebih dahulu sebelum reset password" }, { status: 400 });
    }
    const hasEmail = Boolean(account.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email));
    if (delivery === "email" && !hasEmail) {
      return NextResponse.json({ success: false, error: "Akun belum memiliki email yang valid" }, { status: 400 });
    }

    const temporaryPassword = generateTemporaryPassword();
    await prisma.adminAccount.update({
      where: { id },
      data: {
        passwordHash: hashPassword(temporaryPassword),
        mustChangePassword: true,
        tempPasswordExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        lastLoginAt: null,
      },
    });

    await prisma.adminSession.deleteMany({ where: { adminId: id } });

    let emailSent = false;
    let emailError = "";

    if (delivery === "email") {
      if (isEmailConfigured()) {
        const result = await sendTemporaryPasswordEmail({
          to: account.email,
          name: account.name,
          username: account.username,
          temporaryPassword,
        });
        emailSent = result.sent;
        emailError = result.error ?? "";
      } else {
        emailError = "SMTP belum dikonfigurasi";
      }
    }

    await logAdminAction({
      actorId: auth.admin.id,
      actorName: auth.admin.name,
      action: "reset_password",
      targetId: id,
      targetUsername: account.username,
      detail: `delivery=${delivery};email_sent=${emailSent}${emailError ? ";fallback=true" : ""}`,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        username: account.username,
        name: account.name,
        email: account.email,
        delivery,
        emailSent,
        ...(emailSent ? {} : { temporaryPassword }),
      },
    });

    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("Admin password reset error:", error);
    return NextResponse.json({ success: false, error: "Gagal mereset password" }, { status: 500 });
  }
}
