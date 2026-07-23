import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!process.env.ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return NextResponse.json(
        { success: false, error: "Konfigurasi server tidak lengkap. Hubungi administrator." },
        { status: 500 },
      );
    }

    if (password === process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json(
      { success: false, error: "Password salah" },
      { status: 401 },
    );
  } catch (err) {
    console.error("Admin auth error:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses permintaan" },
      { status: 400 },
    );
  }
}
