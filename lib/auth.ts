import crypto from "crypto";

function getSecret(): string {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) throw new Error("ADMIN_PASSWORD not configured");
  return pw;
}

export function createToken(): string {
  const secret = getSecret();
  const ts = Date.now();
  const payload = `${ts}:${secret}`;
  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${ts}:${hash}`;
}

export function verifyToken(token: string): boolean {
  try {
    const secret = getSecret();
    const parts = token.split(":");
    if (parts.length !== 2) return false;
    const [ts, hash] = parts;
    const payload = `${ts}:${secret}`;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    const age = Date.now() - parseInt(ts, 10);
    if (age > 24 * 60 * 60 * 1000) return false;
    return hash === expected;
  } catch {
    return false;
  }
}

export function requireAdmin(request: Request): Response | null {
  const authHeader = request.headers.get("Authorization");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : cookieHeader
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith("admin_token="))
        ?.slice("admin_token=".length);

  if (!token) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!verifyToken(token)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function hasAdminCookie(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => part.startsWith("admin_token="));
}
