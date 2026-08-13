import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin-types";
import { createSessionToken, getAdminFromRequest, normalizeAdminName, storeAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/password";
import { createCsrfToken, setCsrfCookie, ADMIN_CSRF_COOKIE } from "@/lib/csrf";

function withRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}

function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminFromRequest(request);
  const response = !admin
    ? NextResponse.json({ success: true, authenticated: false })
    : NextResponse.json({
        success: true,
        authenticated: true,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
      });
  const existingCsrf = request.cookies.get(ADMIN_CSRF_COOKIE)?.value;
  return setCsrfCookie(response, existingCsrf || createCsrfToken());
}

export async function POST(request: NextRequest) {
  try {
    const limit = await consumeRateLimit(getRateLimitKey("admin-login", request), {
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.allowed) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
          { status: 429 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof (body as Record<string, unknown>).username !== "string" ||
      typeof (body as Record<string, unknown>).password !== "string"
    ) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Format data tidak sesuai" },
          { status: 400 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const { username, password } = body as { username: string; password: string };
    const admin = await prisma.adminAccount.findUnique({ where: { username } });

    if (!admin || !admin.isActive || !verifyPassword(password, admin.passwordHash)) {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Username atau password salah" },
          { status: 401 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const token = createSessionToken();
    await storeAdminSession(admin.id, token);
    await prisma.adminAccount.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    const response = setCsrfCookie(
      setAdminCookie(
        NextResponse.json({
          success: true,
          admin: {
            id: admin.id,
            username: admin.username,
            name: normalizeAdminName(admin.name),
            role: admin.role,
          },
        }),
        token,
      ),
      request.cookies.get(ADMIN_CSRF_COOKIE)?.value || createCsrfToken(),
    );

    return withRateLimitHeaders(response, limit.remaining, limit.resetAt);
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses permintaan" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  response.cookies.set("admin_csrf", "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  const admin = await getAdminFromRequest(request);
  if (admin) {
    await prisma.adminSession.deleteMany({ where: { adminId: admin.id } }).catch(() => {});
  }

  return response;
}
