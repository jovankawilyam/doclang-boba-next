import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeAdminName, requireAdminRole } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { validateAdminCsrf } from "@/lib/csrf";

const ROLES = ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"] as const;

export async function GET(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin"]);
  if (unauth) return unauth;

  const accounts = await prisma.adminAccount.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }] });
  return NextResponse.json({
    success: true,
    data: accounts.map((a) => ({
      id: a.id,
      username: a.username,
      name: a.name,
      unit: a.unit,
      role: a.role,
      isActive: a.isActive,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin"]);
  if (unauth) return unauth;

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
    const unit = typeof (body as Record<string, unknown>).unit === "string" ? ((body as Record<string, unknown>).unit as string).trim() : "";
    if (!ROLES.includes(role as (typeof ROLES)[number])) {
      return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
    }

    const account = await prisma.adminAccount.create({
      data: {
        username: username.trim(),
        name: normalizeAdminName(name),
        unit,
        passwordHash: hashPassword(password),
        role: role as (typeof ROLES)[number],
      },
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
  const unauth = await requireAdminRole(request, ["superadmin"]);
  if (unauth) return unauth;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body) || typeof (body as Record<string, unknown>).id !== "number") {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const { id } = body as { id: number; name?: string; username?: string; role?: string; password?: string; isActive?: boolean };
    const payload = body as { id: number; name?: string; username?: string; role?: string; password?: string; isActive?: boolean };

    const existing = await prisma.adminAccount.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Akun tidak ditemukan" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (typeof payload.name === "string") data.name = normalizeAdminName(payload.name);
    if (typeof payload.username === "string") data.username = payload.username.trim();
    if (typeof (payload as Record<string, unknown>).unit === "string") data.unit = ((payload as Record<string, unknown>).unit as string).trim();
    if (typeof payload.role === "string") {
      if (!ROLES.includes(payload.role as (typeof ROLES)[number])) {
        return NextResponse.json({ success: false, error: "Role tidak valid" }, { status: 400 });
      }
      data.role = payload.role;
    }
    if (typeof payload.password === "string" && payload.password.trim()) {
      data.passwordHash = hashPassword(payload.password);
    }
    if (typeof payload.isActive === "boolean") data.isActive = payload.isActive;

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

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        username: account.username,
        name: account.name,
        unit: account.unit,
        role: account.role,
        isActive: account.isActive,
      },
    });
  } catch (error) {
    console.error("Admin account update error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui akun admin" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const unauth = await requireAdminRole(request, ["superadmin"]);
  if (unauth) return unauth;

  try {
    if (!validateAdminCsrf(request)) {
      return NextResponse.json({ success: false, error: "CSRF token tidak valid" }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id") ?? "0");
    if (!id) {
      return NextResponse.json({ success: false, error: "ID akun harus diisi" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin account delete error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus akun admin" }, { status: 500 });
  }
}
