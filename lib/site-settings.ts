import { Prisma } from "@prisma/client";
import { prisma } from "./db/prisma";

const FOOTER_SETTINGS_KEY = "footer";

export type FooterSettings = {
  officeName: string;
  address: string;
  operatingHours: string;
  socialLinks: {
    youtube: string;
    instagram: string;
    tiktok: string;
  };
  mapsUrl: string;
  copyright: string;
};

export const DEFAULT_FOOTER_SETTINGS: FooterSettings = {
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

async function ensureSiteSettingsTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "SiteSettings" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT NOT NULL DEFAULT '',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function parseFooter(value: string | null): FooterSettings {
  if (!value) return DEFAULT_FOOTER_SETTINGS;
  try {
    const parsed = JSON.parse(value) as Partial<FooterSettings>;
    return {
      ...DEFAULT_FOOTER_SETTINGS,
      ...parsed,
      socialLinks: {
        ...DEFAULT_FOOTER_SETTINGS.socialLinks,
        ...(parsed.socialLinks ?? {}),
      },
    };
  } catch {
    return DEFAULT_FOOTER_SETTINGS;
  }
}

export async function getFooterSettings(): Promise<FooterSettings> {
  await ensureSiteSettingsTable();
  const rows = await prisma.$queryRaw<Array<{ value: string }>>(Prisma.sql`
    SELECT "value" FROM "SiteSettings" WHERE "key" = ${FOOTER_SETTINGS_KEY} LIMIT 1
  `);
  return parseFooter(rows[0]?.value ?? null);
}

export async function saveFooterSettings(settings: FooterSettings) {
  await ensureSiteSettingsTable();
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "SiteSettings" ("key", "value", "createdAt", "updatedAt")
    VALUES (${FOOTER_SETTINGS_KEY}, ${JSON.stringify(settings)}, NOW(), NOW())
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()
  `);
}
