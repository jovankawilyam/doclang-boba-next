import { NextRequest, NextResponse } from "next/server";
import { createToken, hasAdminCookie, requireAdmin } from "@/lib/auth";
import { consumeRateLimit, getRateLimitKey } from "@/lib/rate-limit";

function withRateLimitHeaders(response: NextResponse, remaining: number, resetAt: number): NextResponse {
  response.headers.set("X-RateLimit-Remaining", String(remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  return response;
}

function setAdminCookie(response: NextResponse, token: string) {
  response.cookies.set("admin_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
  });
  return response;
}

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if (auth) {
    return auth;
  }
  return NextResponse.json({ success: true, authenticated: hasAdminCookie(request) });
}

export async function POST(request: NextRequest) {
  try {
    const limit = consumeRateLimit(getRateLimitKey("admin-login", request), {
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
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).password !== "string") {
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Format data tidak sesuai" },
          { status: 400 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    const { password } = body as { password: string };

    if (!process.env.ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return withRateLimitHeaders(
        NextResponse.json(
          { success: false, error: "Konfigurasi server tidak lengkap. Hubungi administrator." },
          { status: 500 },
        ),
        limit.remaining,
        limit.resetAt,
      );
    }

    if (password === process.env.ADMIN_PASSWORD) {
      const token = createToken();
      return withRateLimitHeaders(
        setAdminCookie(NextResponse.json({ success: true, token }), token),
        limit.remaining,
        limit.resetAt,
      );
    }
    return withRateLimitHeaders(
      NextResponse.json(
        { success: false, error: "Password salah" },
        { status: 401 },
      ),
      limit.remaining,
      limit.resetAt,
    );
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses permintaan" },
      { status: 400 },
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
  return response;
}
