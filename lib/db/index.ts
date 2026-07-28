import { prisma } from "./prisma"
import {
  SHEET_MAPPINGS,
  SHEET_ID_COLUMNS,
  MONITORING_MAPPING,
} from "./mapping"
import type { FieldMapping } from "./mapping"

type RowData = Record<string, string>

const LAYANAN_MAP: Record<string, string> = {
  "Pemberian Kuitansi Pembayaran Harga Lelang": "Kuitansi",
  "Pemberian Kutipan Risalah Lelang": "Kutipan RL",
  "Validasi PPh (1 Bidang)": "Validasi PPh",
  "Validasi PPh (1 bidang)": "Validasi PPh",
}

const STATUS_MAP: Record<string, string> = {
  "Total": "Selesai",
  "Valid Total": "Selesai",
  "Ditolak": "Tidak Valid",
  "Dalam Proses": "Proses",
  "Selesai": "Selesai",
  "Siap Diambil": "Siap Diambil",
  "Tidak Valid": "Tidak Valid",
  "Proses": "Proses",
}

export interface SheetRow {
  get: (key: string) => string
  _worksheet: { headerValues: string[] }
  [key: string]: string | { headerValues: string[] } | ((key: string) => string)
}

function createRow(data: RowData, mapping: FieldMapping[]): SheetRow {
  const row: Record<string, string | (() => string) | { headerValues: string[] }> = {}
  for (const m of mapping) {
    row[m.column] = data[m.field] ?? ""
  }
  const headerValues = mapping.map((m) => m.column)
  row._worksheet = { headerValues }
  return new Proxy(row as unknown as SheetRow, {
    get(target, prop) {
      if (prop === "get") {
        return (key: string) => {
          const val = target[key]
          return typeof val === "string" ? val : ""
        }
      }
      if (prop === "_worksheet") return target._worksheet
      const val = target[prop as string]
      return typeof val === "string" ? val : undefined
    },
  })
}

function mappingFor(sheetName: string): FieldMapping[] {
  const m = SHEET_MAPPINGS[sheetName]
  if (!m) throw new Error(`Unknown sheet: ${sheetName}`)
  return m
}

export async function getRows(sheetName: string): Promise<SheetRow[]> {
  const mapping = mappingFor(sheetName)
  let rows: RowData[]

  switch (sheetName) {
    case "Monitoring": {
      const result = await prisma.monitoring.findMany({ orderBy: { id: "desc" } })
      rows = result.map((r) => {
        const row: RowData = {}
        for (const m of mapping) {
          let val = String((r as any)[m.field] ?? "")
          if (m.field === "jenisLayanan" && LAYANAN_MAP[val]) {
            val = LAYANAN_MAP[val]
          }
          if (m.field === "statusProses" && STATUS_MAP[val]) {
            val = STATUS_MAP[val]
          }
          row[m.field] = val
        }
        return row
      })
      break
    }
    case "Kuitansi": {
      const result = await prisma.kuitansi.findMany({ orderBy: { id: "desc" } })
      rows = result.map((r) => {
        const row: RowData = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
        return row
      })
      break
    }
    case "Kutipan RL": {
      const result = await prisma.kutipanRL.findMany({ orderBy: { id: "desc" } })
      rows = result.map((r) => {
        const row: RowData = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
        return row
      })
      break
    }
    case "Validasi PPh": {
      const result = await prisma.validasiPPh.findMany({ orderBy: { id: "desc" } })
      rows = result.map((r) => {
        const row: RowData = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
        return row
      })
      break
    }
    case "Activity Log": {
      const result = await prisma.activityLog.findMany({ orderBy: { id: "desc" } })
      rows = result.map((r) => {
        const row: RowData = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
        return row
      })
      break
    }
    default:
      throw new Error(`Unknown sheet: ${sheetName}`)
  }

  return rows.map((r) => createRow(r, mapping))
}

export async function appendRow(
  sheetName: string,
  data: Record<string, string>,
) {
  const mapping = mappingFor(sheetName)
  const record: Record<string, string> = {}
  for (const m of mapping) {
    record[m.field] = data[m.column] ?? ""
  }

  switch (sheetName) {
    case "Monitoring":
      await prisma.monitoring.create({ data: record as any })
      break
    case "Kuitansi":
      await prisma.kuitansi.create({ data: record as any })
      break
    case "Kutipan RL":
      await prisma.kutipanRL.create({ data: record as any })
      break
    case "Validasi PPh":
      await prisma.validasiPPh.create({ data: record as any })
      break
    case "Activity Log":
      await prisma.activityLog.create({ data: record as any })
      break
  }
}

export async function findRowInSheet(
  sheetName: string,
  idColumn: string,
  value: string,
): Promise<SheetRow | null> {
  const mapping = mappingFor(sheetName)
  const idMapping = mapping.find((m) => m.column === idColumn)
  if (!idMapping) return null

  const field = idMapping.field
  let row: RowData | null = null

  switch (sheetName) {
    case "Kuitansi": {
      const r = await prisma.kuitansi.findFirst({ where: { [field]: value } })
      if (r) {
        row = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
      }
      break
    }
    case "Kutipan RL": {
      const r = await prisma.kutipanRL.findFirst({ where: { [field]: value } })
      if (r) {
        row = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
      }
      break
    }
    case "Validasi PPh": {
      const r = await prisma.validasiPPh.findFirst({ where: { [field]: value } })
      if (r) {
        row = {}
        for (const m of mapping) row[m.field] = String((r as any)[m.field] ?? "")
      }
      break
    }
  }

  return row ? createRow(row, mapping) : null
}

export async function findRow(value: string): Promise<SheetRow | null> {
  for (const [sheetName, info] of Object.entries(SHEET_ID_COLUMNS)) {
    const row = await findRowInSheet(sheetName, info.idColumn, value)
    if (row) return row
  }
  return null
}

export async function updateRow(
  sheetName: string,
  idColumn: string,
  idValue: string,
  updates: Record<string, string>,
) {
  const mapping = mappingFor(sheetName)
  const idMapping = mapping.find((m) => m.column === idColumn)
  if (!idMapping) return null

  const where = { [idMapping.field]: idValue }
  const data: Record<string, string> = {}
  for (const [col, val] of Object.entries(updates)) {
    const fm = mapping.find((m) => m.column === col)
    if (fm) data[fm.field] = val
  }

  switch (sheetName) {
    case "Monitoring":
      await prisma.monitoring.updateMany({ where: where as any, data: data as any })
      break
    case "Kuitansi":
      await prisma.kuitansi.updateMany({ where: where as any, data: data as any })
      break
    case "Kutipan RL":
      await prisma.kutipanRL.updateMany({ where: where as any, data: data as any })
      break
    case "Validasi PPh":
      await prisma.validasiPPh.updateMany({ where: where as any, data: data as any })
      break
    case "Activity Log":
      await prisma.activityLog.updateMany({ where: where as any, data: data as any })
      break
  }
}

export async function getStats() {
  const mapping = MONITORING_MAPPING
  const rows = await prisma.monitoring.findMany()
  const total = rows.length
  let proses = 0, siapDiambil = 0, tidakValid = 0, selesai = 0
  for (const r of rows) {
    const raw = STATUS_MAP[r.statusProses] ?? r.statusProses
    const s = raw.toLowerCase() ?? ""
    if (s === "proses") proses++
    else if (s === "siap diambil") siapDiambil++
    else if (s === "tidak valid") tidakValid++
    else if (s === "selesai") selesai++
  }
  return { total, proses, siap_diambil: siapDiambil, tidak_valid: tidakValid, selesai }
}
