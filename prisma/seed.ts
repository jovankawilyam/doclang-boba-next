import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import * as fs from "fs";
import * as path from "path";
import { hashPassword } from "../lib/password";
import { normalizeAdminName } from "../lib/auth";
import {
  KUITANSI_MAPPING,
  KUTIPAN_RL_MAPPING,
  VALIDASI_PPH_MAPPING,
} from "../lib/db/mapping";
import type { FieldMapping } from "../lib/db/mapping";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function ensureAdminAuthSchema() {
  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'kepala_kantor', 'kepala_bagian', 'karyawan');
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END $$;
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminAccount" (
      "id" SERIAL PRIMARY KEY,
      "username" TEXT NOT NULL UNIQUE,
      "name" TEXT NOT NULL,
      "passwordHash" TEXT NOT NULL,
      "role" "AdminRole" NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "lastLoginAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "AdminSession" (
      "id" SERIAL PRIMARY KEY,
      "tokenHash" TEXT NOT NULL UNIQUE,
      "adminId" INTEGER NOT NULL,
      "expiresAt" TIMESTAMP(3) NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AdminSession_adminId_fkey"
        FOREIGN KEY ("adminId") REFERENCES "AdminAccount"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        current.push(field.trim());
        field = "";
      } else if (char === '\n') {
        current.push(field.trim());
        field = "";
        if (current.length > 0 && current.some((c) => c !== "")) {
          rows.push(current);
        }
        current = [];
      } else if (char === '\r') {
        continue;
      } else {
        field += char;
      }
    }
  }

  if (field.trim() || current.length > 0) {
    current.push(field.trim());
    if (current.some((c) => c !== "")) {
      rows.push(current);
    }
  }

  return rows;
}

function buildRecords(rows: string[][], headerRow: string[], mapping: FieldMapping[]): Record<string, string>[] {
  const result: Record<string, string>[] = [];
  for (const row of rows) {
    const record: Record<string, string> = {};
    let hasData = false;
    for (const m of mapping) {
      const colIndex = headerRow.indexOf(m.column);
      if (colIndex >= 0 && colIndex < row.length) {
        record[m.field] = row[colIndex];
        if (row[colIndex]) hasData = true;
      } else if (colIndex === -1) {
        record[m.field] = "";
      }
    }
    if (hasData) result.push(record);
  }
  return result;
}

function escape(val: string): string {
  if (!val) return "''";
  return `'${val.replace(/'/g, "''")}'`;
}

const NOW = new Date().toISOString();

async function batchInsert(table: string, records: Record<string, string>[], batchSize = 500) {
  if (records.length === 0) return 0;
  let count = 0;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    const keys = Object.keys(batch[0]);
    const fields = [...keys, "createdAt", "updatedAt"].map((f) => `"${f}"`).join(", ");
    const values = batch
      .map((r) => `(${[...Object.values(r), NOW, NOW].map((v) => escape(v)).join(", ")})`)
      .join(", ");
    await prisma.$executeRawUnsafe(`INSERT INTO "${table}" (${fields}) VALUES ${values} ON CONFLICT DO NOTHING`);
    count += batch.length;
  }
  return count;
}

async function seedAdminAccounts() {
  const accounts = [
    {
      username: "jovankawilyam",
      name: "JOVANKA WILYAM",
      role: "superadmin" as const,
    },
  ];

  const seedPassword = process.env.SEED_ADMIN_PASSWORD;

  for (const account of accounts) {
    const existing = await prisma.adminAccount.findUnique({
      where: { username: account.username },
    });

    if (existing) {
      await prisma.adminAccount.update({
        where: { username: account.username },
        data: {
          name: normalizeAdminName(account.name),
          role: account.role,
          isActive: true,
          ...(seedPassword ? { passwordHash: hashPassword(seedPassword) } : {}),
        },
      });
      console.log(
        `  Updated admin '${account.username}'${seedPassword ? " (password reset via SEED_ADMIN_PASSWORD)" : ""}`,
      );
      continue;
    }

    if (!seedPassword) {
      console.warn(
        `  SKIP creating admin '${account.username}': set SEED_ADMIN_PASSWORD to create a new admin account.`,
      );
      continue;
    }

    await prisma.adminAccount.create({
      data: {
        username: account.username,
        name: normalizeAdminName(account.name),
        passwordHash: hashPassword(seedPassword),
        role: account.role,
        isActive: true,
      },
    });
    console.log(`  Created admin '${account.username}'`);
  }
}

async function seedMonitoring(csvDir: string) {
  const filePath = path.join(csvDir, "doclang proses - 1. Monitoring.csv");
  if (!fs.existsSync(filePath)) {
    console.log("  SKIP: Monitoring CSV not found");
    return;
  }

  const text = fs.readFileSync(filePath, "utf-8");
  const parsed = parseCSV(text);
  if (parsed.length < 2) {
    console.log("  SKIP: Monitoring CSV has insufficient rows");
    return;
  }

  const dataRows = parsed.slice(1);
  const records: Record<string, string>[] = [];
  for (const row of dataRows) {
    const record: Record<string, string> = {};
    record.tglPermintaan = (row[0] ?? "").trim();
    record.kodeLotLelang = (row[1] ?? "").trim();
    record.idPengajuan = (row[2] ?? "").trim();
    record.tanggalPengambilan = (row[3] ?? "").trim();
    record.jenisLayanan = (row[4] ?? "").trim();
    record.nomorDokumen = (row[5] ?? "").trim();

    const col6 = (row[6] ?? "").trim();
    const col7 = (row[7] ?? "").trim();

    if (col7) {
      record.statusProses = col7;
      record.tanggalDokumen = col6;
    } else if (col6 && col6 !== "Total" && col6 !== "Valid Total" && col6 !== "Tidak Valid") {
      record.statusProses = "";
      record.tanggalDokumen = col6;
    } else {
      record.statusProses = col6;
      record.tanggalDokumen = "";
    }

    if (record.idPengajuan) records.push(record);
  }

  if (records.length > 0) {
    const count = await batchInsert("Monitoring", records);
    console.log(`  Imported ${count} monitoring records`);
  }
}

async function seedSheet(csvDir: string, fileName: string, mapping: FieldMapping[], table: string, label: string) {
  const filePath = path.join(csvDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.log(`  SKIP: ${label} CSV not found`);
    return;
  }

  const text = fs.readFileSync(filePath, "utf-8");
  const parsed = parseCSV(text);
  if (parsed.length < 2) {
    console.log(`  SKIP: ${label} CSV has insufficient rows`);
    return;
  }

  const rawHeader = parsed[0];
  const dataRows = parsed.slice(1);
  const records = buildRecords(dataRows, rawHeader, mapping);
  const filtered = records.filter((r) => {
    const idField = mapping.find((m) => m.column === "ID KPHL" || m.column === "ID K-RL" || m.column === "ID VPPh");
    return idField ? r[idField.field] : true;
  });

  if (filtered.length > 0) {
    const count = await batchInsert(table, filtered);
    console.log(`  Imported ${count} ${label} records`);
  }
}

async function main() {
  const csvDir = path.join(__dirname, "..", "doclang-csv");
  console.log("Seeding from:", csvDir);

  console.log("\n0. Admin accounts...");
  await ensureAdminAuthSchema();
  await seedAdminAccounts();

  console.log("\n1. Monitoring...");
  await seedMonitoring(csvDir);

  console.log("\n2. Kuitansi...");
  await seedSheet(csvDir, "kuitansi.csv", KUITANSI_MAPPING, "Kuitansi", "Kuitansi");

  console.log("\n3. Kutipan RL...");
  await seedSheet(csvDir, "kutipan RL.csv", KUTIPAN_RL_MAPPING, "KutipanRL", "Kutipan RL");

  console.log("\n4. Validasi PPh...");
  await seedSheet(csvDir, "validasi_PPh.csv", VALIDASI_PPH_MAPPING, "ValidasiPPh", "Validasi PPh");

  console.log("\nSeed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
