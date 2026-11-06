import nodemailer from "nodemailer";

const SMTP_CONFIG = {
  host: process.env.SMTP_HOST ?? "",
  port: parseInt(process.env.SMTP_PORT ?? "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
  },
};

const SMTP_FROM = process.env.SMTP_FROM ?? "";

export function isEmailConfigured(): boolean {
  return Boolean(SMTP_CONFIG.host && SMTP_CONFIG.auth.user && SMTP_CONFIG.auth.pass && SMTP_FROM);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function sendTemporaryPasswordEmail({
  to,
  name,
  username,
  temporaryPassword,
}: {
  to: string;
  name: string;
  username: string;
  temporaryPassword: string;
}): Promise<{ sent: boolean; error?: string }> {
  if (!isEmailConfigured()) return { sent: false, error: "SMTP belum dikonfigurasi" };

  const transport = nodemailer.createTransport({
    ...SMTP_CONFIG,
    ...(!SMTP_CONFIG.secure ? { requireTLS: true } : {}),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  const safeName = escapeHtml(name);
  const safeUsername = escapeHtml(username);
  const safePassword = escapeHtml(temporaryPassword);
  const waktu = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

  const text = [
    `Halo ${name},`,
    "",
    "Password akun admin Anda telah direset oleh superadmin.",
    "",
    `Username: ${username}`,
    `Password sementara: ${temporaryPassword}`,
    "",
    "Segera login dan ganti password melalui menu Ubah Password.",
    "Password sementara ini berlaku 24 jam.",
    "",
    `Waktu reset: ${waktu}`,
    "",
    "Jika Anda tidak merasa meminta reset password, segera hubungi superadmin.",
    "",
    "---",
    "Doclang Boba — KPKNL Bogor",
  ].join("\n");

  const html = `
<div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;border:1px solid #D8E0EC;border-radius:12px">
  <h2 style="color:#005FAC;margin:0 0 16px">Password Sementara</h2>
  <p>Halo <strong>${safeName}</strong>,</p>
  <p>Password akun admin Anda telah direset oleh superadmin.</p>
  <table style="margin:16px 0;border-collapse:collapse">
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Username</td><td style="padding:4px 0;font-weight:600">${safeUsername}</td></tr>
    <tr><td style="padding:4px 12px 4px 0;color:#64748b">Password</td><td style="padding:4px 0;font-weight:600;font-family:monospace;font-size:16px;letter-spacing:1px">${safePassword}</td></tr>
  </table>
  <p style="color:#DC2626;font-weight:600">Segera login dan ganti password melalui menu Ubah Password.</p>
  <p style="color:#64748b;font-size:13px">Password sementara ini berlaku 24 jam.</p>
  <hr style="border:none;border-top:1px solid #D8E0EC;margin:20px 0">
  <p style="color:#94a3b8;font-size:12px">Waktu reset: ${waktu}</p>
  <p style="color:#94a3b8;font-size:12px">Jika Anda tidak merasa meminta reset, segera hubungi superadmin.</p>
  <p style="color:#94a3b8;font-size:12px;margin-top:16px">Doclang Boba — KPKNL Bogor</p>
</div>`.trim();

  try {
    await transport.sendMail({
      from: SMTP_FROM,
      to,
      subject: "[Doclang Boba] Password Sementara Akun Admin",
      text,
      html,
    });
    return { sent: true };
  } catch (err) {
    console.error("Email send error:", (err as Error).message);
    return { sent: false, error: "Gagal mengirim email" };
  }
}
