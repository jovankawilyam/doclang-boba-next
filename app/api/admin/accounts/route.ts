import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { authorizeAdminRole, normalizeAdminName } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { isValidAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/password-policy";
import { validateAdminCsrf } from "@/lib/csrf";
import { logAdminAction } from "@/lib/admin-audit";

const ROLES = ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] as const;

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  const accounts = await prisma.adminAccount.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  const response = NextResponse.json({
    success: true,
    data: accounts.map((a) => ({
      id: a.id,
      username: a.username,
      name: a.name,
      unit: a.unit,
      role: a.role,
      isActive: a.isActive,
      email: a.email,
      mustChangePassword: a.mustChangePassword,
      isSelf: a.id === auth.admin.id,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
    })),
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export async function POST(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      typeof (body as Record<string, unknown>).username !== "string" ||
      typeof (body as Record<string, unknown>).password !== "string" ||
      typeof (body as Record<string, unknown>).name !== "string" ||
      typeof (body as Record<string, unknown>).role !== "string"
    ) {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const { username, password, name, role } = body as { username: string; password: string; name: string; role: string };
    const payload = body as Record<string, unknown>;
    const unit = typeof payload.unit === "string" ? payload.unit.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const isActive = typeof payload.isActive === "boolean" ? payload.isActive : true;
    const trimmedUsername = username.trim();
    const normalizedName = normalizeAdminName(name);

    if (!trimmedUsername) {
      return NextResponse.json({ success: false, error: "Username wajib diisi" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Email wajib diisi dan harus valid" }, { status: 400 });
    }
    if (!normalizedName) {
      return NextResponse.json({ success: false, error: "Nama wajib diisi" }, { status: 400 });
    }
    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ success: false, error: `Password minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter` }, { status: 400 });
    }
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
    }

    const account = await prisma.adminAccount.create({
      data: {
        username: trimmedUsername,
        name: normalizedName,
        unit,
        email,
        passwordHash: hashPassword(password),
        role: role as (typeof ROLES)[number],
        isActive,
        mustChangePassword: true,
      },
    });

    await logAdminAction({
      actorId: auth.admin.id,
      actorName: auth.admin.name,
      action: "create_account",
      targetId: account.id,
      targetUsername: account.username,
      detail: `role=${account.role}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        username: account.username,
        name: account.name,
        unit: account.unit,
        role: account.role,
        isActive: account.isActive,
        email: account.email,
      },
    });
  } catch (error) {
    console.error("Admin account create error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Gagal membuat akun admin" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).id !== "number") {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const payload = body as { id: number; name?: string; username?: string; unit?: string; email?: string; role?: string; password?: string; isActive?: boolean };
    if (typeof payload.password === "string") {
      return NextResponse.json({ success: false, error: "Ubah password melalui menu Ubah Password atau Reset Password" }, { status: 400 });
    }
    const { id } = payload;
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "ID akun tidak valid" }, { status: 400 });
    }

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 });
    }

    const isSelf = id === auth.admin.id;
    if (isSelf) {
      if (typeof payload.role === "string" && payload.role !== existing.role) {
        return NextResponse.json({ success: false, error: "Tidak dapat mengubah role akun sendiri" }, { status: 400 });
      }
      if (payload.isActive === false) {
        return NextResponse.json({ success: false, error: "Tidak dapat menonaktifkan akun sendiri" }, { status: 400 });
      }
    }

    const data: Record<string, unknown> = {};
    if (typeof payload.name === "string") {
      const name = normalizeAdminName(payload.name);
      if (!name) {
        return NextResponse.json({ success: false, error: "Nama wajib diisi" }, { status: 400 });
      }
      data.name = name;
    }
    if (typeof payload.username === "string") {
      const username = payload.username.trim();
      if (!username) {
        return NextResponse.json({ success: false, error: "Username wajib diisi" }, { status: 400 });
      }
      data.username = username;
    }
    if (typeof payload.unit === "string") data.unit = payload.unit.trim();
    if (typeof payload.email === "string") {
      const email = payload.email.trim().toLowerCase();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ success: false, error: "Format email tidak valid" }, { status: 400 });
      }
      data.email = email;
    }
    if (typeof payload.role === "string") {
      if (!ROLES.includes(payload.role as (typeof ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
      }
      data.role = payload.role;
    }
    if (typeof payload.isActive === "boolean") data.isActive = payload.isActive;
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: "Tidak ada perubahan akun" }, { status: 400 });
    }

    if (existing.role === "superadmin" && existing.isActive) {
      const willDowngrade = data.role && data.role !== "superadmin";
      const willDeactivate = data.isActive === false;

      if (willDowngrade || willDeactivate) {
        const totalSuperadmin = await prisma.adminAccount.count({ where: { role: "superadmin", isActive: true } });
        if (totalSuperadmin <= 1) {
          return NextResponse.json({ success: false, error: "Minimal harus ada satu superadmin aktif" }, { status: 400 });
        }
      }
    }

    const account = await prisma.adminAccount.update({
      where: { id },
      data,
    });

    if (data.passwordHash || data.isActive === false) {
      await prisma.adminSession.deleteMany({ where: { adminId: id } });
    }

    await logAdminAction({
      actorId: auth.admin.id,
      actorName: auth.admin.name,
      action: "update_account",
      targetId: account.id,
      targetUsername: account.username,
      detail: Object.keys(data).filter(k => k !== "passwordHash").join(","),
    });

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        username: account.username,
        name: account.name,
        unit: account.unit,
        role: account.role,
        isActive: account.isActive,
        email: account.email,
      },
    });
  } catch (error) {
    console.error("Admin account update error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: "Gagal memperbarui akun admin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id") ?? "0");
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: "ID akun tidak valid" }, { status: 400 });
    }
    if (id === auth.admin.id) {
      return NextResponse.json({ success: false, error: "Tidak dapat menghapus akun sendiri" }, { status: 400 });
    }

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 });
    }
    if (existing.role === "superadmin" && existing.isActive) {
      const totalSuperadmin = await prisma.adminAccount.count({ where: { role: "superadmin", isActive: true } });
      if (totalSuperadmin <= 1) {
        return NextResponse.json({ success: false, error: "Minimal harus ada satu superadmin aktif" }, { status: 400 });
      }
    }

    await prisma.adminSession.deleteMany({ where: { adminId: id } });
    await prisma.adminAccount.delete({ where: { id } });

    await logAdminAction({
      actorId: auth.admin.id,
      actorName: auth.admin.name,
      action: "delete_account",
      targetId: id,
      targetUsername: existing.username,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin account delete error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus akun admin" }, { status: 500 });
  }
}
