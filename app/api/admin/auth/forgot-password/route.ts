import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { prisma } from "@/lib/db/prisma";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const limit = await consumeRateLimit(getRateLimitKey("admin-forgot-password", request), {
      limit: 5,
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
    const username = typeof payload.username === "string" ? payload.username.trim() : "";
    const role = typeof payload.role === "string" ? payload.role.trim() : "";
    const unit = typeof payload.unit === "string" ? payload.unit.trim() : "";

    if (!username || !role) {
      return NextResponse.json({ success: false, error: "Username dan role wajib diisi" }, { status: 400 });
    }

    const where: { username: string; role: never; unit?: string } = { username, role: role as never };
    if (role !== "superadmin") {
      if (!unit) {
        return NextResponse.json({ success: false, error: "Unit wajib diisi" }, { status: 400 });
      }
      where.unit = unit;
    }

    const admin = await prisma.adminAccount.findFirst({ where });
    if (!admin || !admin.isActive) {
      return NextResponse.json({ success: false, error: "Data tidak cocok" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("base64url");
    await prisma.passwordResetToken.deleteMany({ where: { adminId: admin.id } });
    await prisma.passwordResetToken.create({
      data: {
        adminId: admin.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        admin: { username: admin.username, name: admin.name, role: admin.role, unit: admin.unit },
      },
    });
  } catch (error) {
    console.error("Admin forgot password error:", error);
    return NextResponse.json({ success: false, error: "Gagal memproses permintaan" }, { status: 500 });
  }
}
