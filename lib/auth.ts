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
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!verifyToken(auth.slice(7))) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
