import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_CSRF_COOKIE = "admin_csrf";
export const ADMIN_CSRF_HEADER = "x-csrf-token";

export function createCsrfToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function setCsrfCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(ADMIN_CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60,
  });
  return response;
}

function readCookie(request: NextRequest, name: string): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return (
    cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${name}=`))
      ?.slice(name.length + 1) ?? null
  );
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export function validateAdminCsrf(request: NextRequest): boolean {
  const cookieToken = readCookie(request, ADMIN_CSRF_COOKIE);
  const headerToken = request.headers.get(ADMIN_CSRF_HEADER);
  return Boolean(cookieToken && headerToken && cookieToken === headerToken) && isSameOrigin(request);
}
