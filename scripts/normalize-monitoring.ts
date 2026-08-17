import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const LAYANAN_TO_FULL: Record<string, string> = {
  Kuitansi: "Pemberian Kuitansi Pembayaran Harga Lelang",
  "Kutipan RL": "Pemberian Kutipan Risalah Lelang",
  "Validasi PPh": "Validasi PPh (1 Bidang)",
};

const STATUS_TO_TITLECASE: Record<string, string> = {
  proses: "Proses",
  selesai: "Selesai",
  "siap diambil": "Siap Diambil",
  "tidak valid": "Tidak Valid",
};

async function main() {
  const rows = await prisma.monitoring.findMany({
    where: {
      OR: [
        { jenisLayanan: { in: Object.keys(LAYANAN_TO_FULL) } },
        { statusProses: { in: Object.keys(STATUS_TO_TITLECASE) } },
      ],
    },
    select: { id: true, jenisLayanan: true, statusProses: true },
  });

  let layananFixed = 0;
  let statusFixed = 0;

  for (const row of rows) {
    const data: { jenisLayanan?: string; statusProses?: string } = {};
    const newLayanan = LAYANAN_TO_FULL[row.jenisLayanan];
    if (newLayanan) {
      data.jenisLayanan = newLayanan;
      layananFixed++;
    }
    const newStatus = STATUS_TO_TITLECASE[row.statusProses];
    if (newStatus) {
      data.statusProses = newStatus;
      statusFixed++;
    }
    if (Object.keys(data).length > 0) {
      await prisma.monitoring.update({ where: { id: row.id }, data });
    }
  }

  console.log(`Done. Updated ${rows.length} rows (layanan: ${layananFixed}, status: ${statusFixed}).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
