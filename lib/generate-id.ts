import { getRows } from "./google/sheets";

function getServiceInfo(
  jenisLayanan: string,
): { sheetName: string; idColumn: string; prefix: string } | null {
  switch (jenisLayanan) {
    case "Pemberian Kuitansi Pembayaran Harga Lelang":
      return { sheetName: "Kuitansi", idColumn: "ID KPHL", prefix: "KPHL" };
    case "Pemberian Kutipan Risalah Lelang":
      return { sheetName: "Kutipan RL", idColumn: "ID K-RL", prefix: "K-RL" };
    case "Validasi PPh (1 Bidang)":
      return { sheetName: "Validasi PPh", idColumn: "ID VPPh", prefix: "VPPH" };
    default:
      return null;
  }
}

export async function generateId(
  jenisLayanan: string,
): Promise<{ id: string; tiket: string; kodeTiket: string; counter: number }> {
  const info = getServiceInfo(jenisLayanan);
  if (!info) {
    return { id: "0/UNKNOWN/0", tiket: "0000", kodeTiket: "/UNKNOWN/0", counter: 0 };
  }

  const { sheetName, idColumn, prefix } = info;
  const year = new Date().getFullYear();
  const rows = await getRows(sheetName);

  let maxCounter = 0;
  for (const row of rows) {
    const id = row.get(idColumn);
    if (id) {
      const parts = id.split("/");
      if (
        parts.length === 3 &&
        parts[1] === prefix &&
        parts[2] === String(year)
      ) {
        const counter = parseInt(parts[0], 10);
        if (counter > maxCounter) maxCounter = counter;
      }
    }
  }

  const counter = maxCounter + 1;
  return {
    id: `${counter}/${prefix}/${year}`,
    tiket: String(counter).padStart(4, "0"),
    kodeTiket: `/${prefix}/${year}`,
    counter,
  };
}
