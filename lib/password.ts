import crypto from "crypto";

const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const DIGEST = "sha512";
const ITERATIONS = 210000;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const actual = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(actual, "hex"));
}
