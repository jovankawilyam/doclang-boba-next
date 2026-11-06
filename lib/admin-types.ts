export type AdminRole = "superadmin" | "kepala_kantor" | "kepala_bagian" | "karyawan";

export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_HEADER = "x-admin-session";

export type AdminSessionData = {
  id: number;
  username: string;
  name: string;
  role: AdminRole;
  mustChangePassword: boolean;
};

export const NAVIGATION_ACCESS: Record<string, AdminRole[]> = {
  "/admin": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/kuitansi": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/kutipan-rl": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/validasi-pph": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/riwayat": ["superadmin", "kepala_kantor", "kepala_bagian"],
  "/admin/sampah": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/pengaturan": ["superadmin", "kepala_kantor", "kepala_bagian"],
  "/admin/admin-akun": ["superadmin"],
  "/admin/ubah-password": ["superadmin", "kepala_kantor", "kepala_bagian", "karyawan"],
  "/admin/log-admin": ["superadmin"],
};

export function canAccessAdminPath(role: AdminRole, pathname: string): boolean {
  const entry = Object.entries(NAVIGATION_ACCESS)
    .filter(([path]) => pathname === path || pathname.startsWith(`${path}/`))
    .sort(([a], [b]) => b.length - a.length)[0];
  if (!entry) return true;
  return entry[1].includes(role);
}
