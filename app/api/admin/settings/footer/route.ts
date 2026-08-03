import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getFooterSettings, saveFooterSettings } from "@/lib/site-settings";

const DEFAULT_FOOTER = {
  officeName: "Kantor Pelayanan Kekayaan Negara dan Lelang Bogor",
  address: "Jalan Veteran No. 45, Panaragan, Kecamatan Bogor Tengah, Kota Bogor, Jawa Barat 16125",
  operatingHours: "Senin - Kamis: 08.00 - 16.00 WIB\nJumat: WFH",
  socialLinks: {
    youtube: "https://www.youtube.com/@kpknlbogor",
    instagram: "https://www.instagram.com/kpknl.bogor",
    tiktok: "https://www.tiktok.com/@kpknl.bogor",
  },
  mapsUrl: "https://maps.google.com/?q=KPKNL+Bogor+Jalan+Veteran+No+45+Bogor+Jawa+Barat",
  copyright: "© 2026 KPKNL Bogor. Seluruh hak cipta dilindungi sesuai ketentuan yang berlaku.",
};

type FooterSettings = typeof DEFAULT_FOOTER;

export async function GET(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;

  const settings = await getFooterSettings();
  return NextResponse.json({ success: true, data: settings, defaults: DEFAULT_FOOTER });
}

export async function PUT(request: NextRequest) {
  const unauth = await requireAdmin(request);
  if (unauth) return unauth;

  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Format data tidak sesuai" }, { status: 400 });
    }

    const input = body as Partial<FooterSettings>;
    const value: FooterSettings = {
      officeName: typeof input.officeName === "string" ? input.officeName : DEFAULT_FOOTER.officeName,
      address: typeof input.address === "string" ? input.address : DEFAULT_FOOTER.address,
      operatingHours: typeof input.operatingHours === "string" ? input.operatingHours : DEFAULT_FOOTER.operatingHours,
      socialLinks: {
        youtube: typeof input.socialLinks?.youtube === "string" ? input.socialLinks.youtube : DEFAULT_FOOTER.socialLinks.youtube,
        instagram: typeof input.socialLinks?.instagram === "string" ? input.socialLinks.instagram : DEFAULT_FOOTER.socialLinks.instagram,
        tiktok: typeof input.socialLinks?.tiktok === "string" ? input.socialLinks.tiktok : DEFAULT_FOOTER.socialLinks.tiktok,
      },
      mapsUrl: typeof input.mapsUrl === "string" ? input.mapsUrl : DEFAULT_FOOTER.mapsUrl,
      copyright: typeof input.copyright === "string" ? input.copyright : DEFAULT_FOOTER.copyright,
    };

    await saveFooterSettings(value);

    return NextResponse.json({ success: true, data: value });
  } catch (error) {
    console.error("Footer settings update error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan pengaturan footer" }, { status: 500 });
  }
}
