import { prisma } from "./db/prisma"

type ServiceInfo = { model: "kuitansi" | "kutipanRL" | "validasiPPh"; idField: string; prefix: string }

function getServiceInfo(
  jenisLayanan: string,
): ServiceInfo | null {
  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang":
      return { model: "kuitansi", idField: "idKPHL", prefix: "KPHL" }
    case "Pemberian Kutipan Risalah Lelang":
      return { model: "kutipanRL", idField: "idKRL", prefix: "K-RL" }
    case "Validasi PPh (1 Bidang)":
      return { model: "validasiPPh", idField: "idVPPh", prefix: "VPPH" }
    default:
      return null
  }
}

async function getLatestCounter(model: ServiceInfo["model"], idField: string, prefix: string, year: number): Promise<number> {
  const suffix = `/${prefix}/${year}`
  let id = ""
  
  try {
    if (model === "kuitansi") {
      const rows = await prisma.$queryRaw<Array<{ idKPHL: string }>>`
        SELECT "idKPHL" FROM "Kuitansi"
        WHERE "idKPHL" LIKE ${'%' + suffix}
        ORDER BY CAST(SPLIT_PART("idKPHL", '/', 1) AS INTEGER) DESC
        LIMIT 1
      `
      id = rows[0]?.idKPHL ?? ""
    } else if (model === "kutipanRL") {
      const rows = await prisma.$queryRaw<Array<{ idKRL: string }>>`
        SELECT "idKRL" FROM "KutipanRL"
        WHERE "idKRL" LIKE ${'%' + suffix}
        ORDER BY CAST(SPLIT_PART("idKRL", '/', 1) AS INTEGER) DESC
        LIMIT 1
      `
      id = rows[0]?.idKRL ?? ""
    } else if (model === "validasiPPh") {
      const rows = await prisma.$queryRaw<Array<{ idVPPh: string }>>`
        SELECT "idVPPh" FROM "ValidasiPPh"
        WHERE "idVPPh" LIKE ${'%' + suffix}
        ORDER BY CAST(SPLIT_PART("idVPPh", '/', 1) AS INTEGER) DESC
        LIMIT 1
      `
      id = rows[0]?.idVPPh ?? ""
    }
  } catch (err) {
    console.error("Error fetching latest counter:", err)
    return 0
  }
  
  if (id) {
    const parts = id.split("/")
    const counter = parseInt(parts[0], 10)
    if (!isNaN(counter)) return counter
  }

  return 0
}

export async function generateId(
  jenisLayanan: string,
): Promise<{ id: string; tiket: string; kodeTiket: string; counter: number }> {
  const info = getServiceInfo(jenisLayanan)
  if (!info) {
    return { id: "0/UNKNOWN/0", tiket: "0000", kodeTiket: "/UNKNOWN/0", counter: 0 }
  }

  const { model, idField, prefix } = info
  const year = new Date().getFullYear()
  const maxCounter = await getLatestCounter(model, idField, prefix, year)

  const counter = maxCounter + 1
  return {
    id: `${counter}/${prefix}/${year}`,
    tiket: String(counter).padStart(4, "0"),
    kodeTiket: `/${prefix}/${year}`,
    counter,
  }
}
