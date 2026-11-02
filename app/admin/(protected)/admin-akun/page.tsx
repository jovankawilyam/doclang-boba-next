"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuthHeaders } from "@/lib/admin-fetch";
import { isValidAdminPassword, MIN_ADMIN_PASSWORD_LENGTH } from "@/lib/password-policy";

type Role = "superadmin" | "kepala_kantor" | "kepala_bagian" | "karyawan";

type Account = {
  id: number;
  username: string;
  name: string;
  unit: string;
  role: Role;
  isActive: boolean;
  isSelf: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "superadmin", label: "superadmin" },
  { value: "kepala_kantor", label: "kepala_kantor" },
  { value: "kepala_bagian", label: "kepala_bagian" },
  { value: "karyawan", label: "staf" },
];

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>{title}</h1>
      <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>{description}</p>
    </div>
  );
}

function Notice({ text, error }: { text: string; error: string }) {
  if (!text && !error) return null;
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
      {error || text}
    </div>
  );
}

function AccountForm({
  saving,
  editingId,
  name,
  username,
  password,
  role,
  unit,
  isActive,
  isSelf,
  setName,
  setUsername,
  setPassword,
  setRole,
  setUnit,
  setIsActive,
  onSubmit,
  onReset,
}: {
  saving: boolean;
  editingId: number | null;
  name: string;
  username: string;
  password: string;
  role: Role;
  unit: string;
  isActive: boolean;
  isSelf: boolean;
  setName: (value: string) => void;
  setUsername: (value: string) => void;
  setPassword: (value: string) => void;
  setRole: (value: Role) => void;
  setUnit: (value: string) => void;
  setIsActive: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}) {
  const isEditingSelf = Boolean(editingId && isSelf);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border p-5 shadow-sm" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>{editingId ? `Edit akun #${editingId}` : "Tambah akun baru"}</p>
          <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>
            {isEditingSelf ? "Role, status, dan password akun sendiri tidak dapat diubah dari form ini." : "Nama akan otomatis menjadi uppercase."}
          </p>
        </div>
        {editingId && <button type="button" onClick={onReset} className="rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50">Batal Edit</button>}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value.toUpperCase())} placeholder="NAMA AKUN" className="rounded-xl border px-3 py-2.5 text-sm uppercase outline-none transition focus:border-slate-400" required />
        <input value={username} onChange={(e) => setUsername(e.target.value.trimStart())} placeholder="username" className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400" required />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEditingSelf ? "Ubah lewat menu Ubah Password" : editingId ? "password baru (opsional)" : "password"}
          type="password"
          disabled={isEditingSelf}
          className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          autoComplete="new-password"
        />
        <select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={isEditingSelf} className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60">
          {ROLE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (contoh: Seksi Pelayanan Lelang)" className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400 lg:col-span-2" />
      </div>
      <label className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--admin-text-body)" }}>
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isEditingSelf} className="disabled:cursor-not-allowed disabled:opacity-60" />
        Akun aktif
      </label>
      <div className="flex flex-wrap gap-2">
        <button disabled={saving} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50">{saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Akun"}</button>
        {editingId && <button type="button" onClick={onReset} className="rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50">Reset Form</button>}
      </div>
    </form>
  );
}

function FilterBar({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onReset,
}: {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: "all" | Role;
  setRoleFilter: (value: "all" | Role) => void;
  statusFilter: "all" | "active" | "inactive";
  setStatusFilter: (value: "all" | "active" | "inactive") => void;
  onReset: () => void;
}) {
  return (
    <div className="border-b px-5 py-4" style={{ borderColor: "var(--admin-border)" }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>Filter akun</p>
          <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Cari dan sortir data akun dengan cepat.</p>
        </div>
        <button type="button" onClick={onReset} className="rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50">Reset Filter</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(2,minmax(0,0.8fr))]">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, username, atau role" className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          <option value="all">Semua role</option>
          {ROLE_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:border-slate-400">
          <option value="all">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>
    </div>
  );
}

function AccountRow({
  account,
  saving,
  onEdit,
  onToggle,
  onResetPassword,
  onDelete,
}: {
  account: Account;
  saving: boolean;
  onEdit: (account: Account) => void;
  onToggle: (account: Account) => void;
  onResetPassword: (account: Account) => void;
  onDelete: (account: Account) => void;
}) {
  return (
    <div className="grid gap-4 rounded-2xl border bg-white/80 p-5 shadow-sm md:grid-cols-[1fr_auto] md:items-center" style={{ borderColor: "var(--admin-border)" }}>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[1rem] font-bold uppercase tracking-wide" style={{ color: "var(--admin-text-primary)" }}>{account.name}</span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${account.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
            {account.isActive ? "aktif" : "nonaktif"}
          </span>
          {account.isSelf && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">Anda</span>}
        </div>
          <div className="mt-1 text-sm" style={{ color: "var(--admin-text-secondary)" }}>{account.role === "karyawan" ? "staf" : account.role}</div>
        {account.unit && <div className="mt-0.5 text-sm" style={{ color: "var(--admin-text-secondary)" }}>{account.unit}</div>}
        <div className="mt-2 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
          Login terakhir: {formatDate(account.lastLoginAt)} · Dibuat: {formatDate(account.createdAt)}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <button disabled={saving} onClick={() => onEdit(account)} className="rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:opacity-50">Edit</button>
        <button disabled={saving || account.isSelf} onClick={() => onToggle(account)} className="rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
          {account.isActive ? "Nonaktifkan" : "Aktifkan"}
        </button>
        <button disabled={saving || account.isSelf} onClick={() => onResetPassword(account)} className="rounded-xl border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50">
          Reset Password
        </button>
        <button disabled={saving || account.isSelf} onClick={() => onDelete(account)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50">
          Hapus
        </button>
      </div>
    </div>
  );
}

export default function AdminAkunPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("karyawan");
  const [unit, setUnit] = useState("");
  const [isActive, setIsActive] = useState(true);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (roleFilter !== "all" && account.role !== roleFilter) return false;
      if (statusFilter === "active" && !account.isActive) return false;
      if (statusFilter === "inactive" && account.isActive) return false;
      return !query || [account.name, account.username, account.role, account.unit].join(" ").toLowerCase().includes(query);
    });
  }, [accounts, roleFilter, search, statusFilter]);

  const editingIsSelf = editingId !== null && accounts.some((account) => account.id === editingId && account.isSelf);

  const redirectIfUnauthorized = useCallback((res: Response) => {
    if (res.status === 401) {
      router.replace("/admin/login");
      return true;
    }
    return false;
  }, [router]);

  const fetchAccounts = useCallback(async (): Promise<Account[] | null> => {
    const res = await fetch("/api/admin/accounts", { headers: getAuthHeaders() });
    if (redirectIfUnauthorized(res)) return null;
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Gagal memuat akun");
    return json.data as Account[];
  }, [redirectIfUnauthorized]);

  async function reloadAccounts() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAccounts();
      if (data) setAccounts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat akun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    fetchAccounts()
      .then((data) => {
        if (active && data) setAccounts(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Gagal memuat akun");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [fetchAccounts]);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("change-password") === "1") {
      router.replace("/admin/ubah-password");
    }
  }, [router]);

  function resetForm() {
    setEditingId(null);
    setName("");
    setUsername("");
    setPassword("");
    setRole("karyawan");
    setUnit("");
    setIsActive(true);
    setMessage("");
    setError("");
  }

  function startEdit(account: Account) {
    setEditingId(account.id);
    setName(account.name);
    setUsername(account.username);
    setPassword("");
    setRole(account.role);
    setUnit(account.unit);
    setIsActive(account.isActive);
    setMessage("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("Nama wajib diisi");
    if (!username.trim()) return setError("Username wajib diisi");
    if (!editingId && !password.trim()) return setError("Password wajib diisi untuk akun baru");
    if (password.trim() && !isValidAdminPassword(password)) return setError(`Password minimal ${MIN_ADMIN_PASSWORD_LENGTH} karakter`);
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload: Record<string, unknown> = { name, username, role, unit, isActive };
      if (password.trim()) payload.password = password;
      if (editingId) payload.id = editingId;
      const res = await fetch("/api/admin/accounts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      if (redirectIfUnauthorized(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menyimpan akun");
      const successMessage = editingId ? "Akun berhasil diperbarui" : "Akun baru berhasil dibuat";
      resetForm();
      setMessage(successMessage);
      await reloadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan akun");
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword(account: Account) {
    if (account.isSelf) return setError("Gunakan menu Ubah Password untuk akun sendiri");
    if (!confirm(`Reset password untuk ${account.name}? Password sementara akan dibuat.`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id: account.id }),
      });
      if (redirectIfUnauthorized(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal mereset password");
      setMessage(`Password sementara untuk ${json.data.username}: ${json.data.temporaryPassword}`);
      await reloadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mereset password");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(account: Account) {
    if (account.isSelf) return setError("Tidak dapat menonaktifkan akun sendiri");
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id: account.id, isActive: !account.isActive }),
      });
      if (redirectIfUnauthorized(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memperbarui akun");
      setMessage(account.isActive ? "Akun berhasil dinonaktifkan" : "Akun berhasil diaktifkan");
      await reloadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui akun");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account: Account) {
    if (account.isSelf) return setError("Tidak dapat menghapus akun sendiri");
    if (!confirm(`Hapus akun ${account.name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/accounts?id=${account.id}`, { method: "DELETE", headers: getAuthHeaders() });
      if (redirectIfUnauthorized(res)) return;
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menghapus akun");
      setMessage("Akun berhasil dihapus");
      await reloadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-lg" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">Admin Management</span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight lg:text-3xl">Kelola akun admin dengan lebih cepat dan aman</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Tambah akun, ubah role, reset password, dan pantau status aktif dalam satu halaman yang lebih bersih.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{accounts.length}</div>
              <div className="mt-1 text-xs text-white/70">Total akun</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <div className="text-2xl font-bold">{accounts.filter((a) => a.isActive).length}</div>
              <div className="mt-1 text-xs text-white/70">Akun aktif</div>
            </div>
          </div>
        </div>
      </div>

      <Notice text={message} error={error} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <AccountForm
          saving={saving}
          editingId={editingId}
          name={name}
          username={username}
          password={password}
          role={role}
          unit={unit}
          isActive={isActive}
          isSelf={editingIsSelf}
          setName={setName}
          setUsername={setUsername}
          setPassword={setPassword}
          setRole={setRole}
          setUnit={setUnit}
          setIsActive={setIsActive}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />

        <div className="rounded-3xl border bg-white p-5 shadow-sm" style={{ borderColor: "var(--admin-border)" }}>
          <SectionTitle title="Ringkasan" description="Informasi cepat tentang akun yang dikelola." />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-2xl font-bold text-slate-900">{accounts.length}</div>
              <div className="mt-1 text-xs text-slate-500">Total akun</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <div className="text-2xl font-bold text-emerald-700">{accounts.filter((a) => a.isActive).length}</div>
              <div className="mt-1 text-xs text-emerald-700/70">Akun aktif</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4">
              <div className="text-2xl font-bold text-amber-700">{accounts.filter((a) => a.role === "superadmin").length}</div>
              <div className="mt-1 text-xs text-amber-700/70">Superadmin</div>
            </div>
            <div className="rounded-2xl bg-sky-50 p-4">
              <div className="text-2xl font-bold text-sky-700">{accounts.filter((a) => a.role !== "superadmin").length}</div>
              <div className="mt-1 text-xs text-sky-700/70">Akun staf</div>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-dashed p-4 text-xs leading-6 text-slate-500">
            Gunakan reset password hanya saat user lupa password. Setelah reset, user wajib login ulang dengan password sementara.
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border bg-white shadow-sm" style={{ borderColor: "var(--admin-border)" }}>
        <FilterBar
          search={search}
          setSearch={setSearch}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onReset={() => { setSearch(""); setRoleFilter("all"); setStatusFilter("all"); }}
        />

        {loading ? (
          <div className="p-6 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Memuat akun...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-6 text-sm" style={{ color: "var(--admin-text-secondary)" }}>Tidak ada akun yang cocok dengan filter.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {filteredAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                saving={saving}
                onEdit={startEdit}
                onToggle={toggleActive}
                onResetPassword={handleResetPassword}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
