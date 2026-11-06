import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { authorizeAdminRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await authorizeAdminRole(request, ["superadmin"]);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20));

    const [total, rows] = await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: rows.map((r) => ({
        id: r.id,
        actorName: r.actorName,
        action: r.action,
        targetUsername: r.targetUsername,
        detail: r.detail,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("Audit GET error:", error);
    return NextResponse.json({ success: false, error: "Gagal memuat log admin" }, { status: 500 });
  }
}
