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
  const select = { [idField]: true } as Record<string, boolean>
  let rows: Record<string, string>[]
  if (model === "kuitansi") {
    rows = await prisma.kuitansi.findMany({ select }) as unknown as Record<string, string>[]
  } else if (model === "kutipanRL") {
    rows = await prisma.kutipanRL.findMany({ select }) as unknown as Record<string, string>[]
  } else {
    rows = await prisma.validasiPPh.findMany({ select }) as unknown as Record<string, string>[]
  }
  let maxCounter = 0
  for (const row of rows) {
    const id: string = row[idField] ?? ""
    if (id) {
      const parts = id.split("/")
      if (parts.length === 3 && parts[1] === prefix && parts[2] === String(year)) {
        const counter = parseInt(parts[0], 10)
        if (counter > maxCounter) maxCounter = counter
      }
    }
  }
  return maxCounter
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
