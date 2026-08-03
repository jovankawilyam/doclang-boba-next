"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthHeaders } from "@/lib/admin-fetch";

type Role = "superadmin" | "kepala_kantor" | "kepala_bagian" | "karyawan";

type Account = {
  id: number;
  username: string;
  name: string;
  role: Role;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "superadmin", label: "superadmin" },
  { value: "kepala_kantor", label: "kepala_kantor" },
  { value: "kepala_bagian", label: "kepala_bagian" },
  { value: "karyawan", label: "karyawan" },
];

function formatDate(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export default function AdminAkunPage() {
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
  const [isActive, setIsActive] = useState(true);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      if (roleFilter !== "all" && account.role !== roleFilter) return false;
      if (statusFilter === "active" && !account.isActive) return false;
      if (statusFilter === "inactive" && account.isActive) return false;
      if (!query) return true;
      return [account.name, account.username, account.role]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [accounts, roleFilter, search, statusFilter]);

  async function loadAccounts() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", { headers: getAuthHeaders() });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal memuat akun");
      }
      setAccounts(json.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        await loadAccounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat akun");
      }
    };
    void run();
  }, []);

  function resetForm() {
    setEditingId(null);
    setName("");
    setUsername("");
    setPassword("");
    setRole("karyawan");
    setIsActive(true);
    setMessage("");
    setError("");
  }

  function resetFilters() {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  }

  function startEdit(account: Account) {
    setEditingId(account.id);
    setName(account.name);
    setUsername(account.username);
    setPassword("");
    setRole(account.role);
    setIsActive(account.isActive);
    setMessage("");
    setError("");
  }

  function validateForm() {
    if (!name.trim()) return "Nama wajib diisi";
    if (!username.trim()) return "Username wajib diisi";
    if (!editingId && !password.trim()) return "Password wajib diisi untuk akun baru";
    if (editingId && password && password.trim().length < 6) return "Password minimal 6 karakter";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        name,
        username,
        role,
        isActive,
      };
      if (password.trim()) payload.password = password;
      if (editingId) payload.id = editingId;

      const res = await fetch("/api/admin/accounts", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Gagal menyimpan akun");
      }
      setMessage(editingId ? "Akun berhasil diperbarui" : "Akun baru berhasil dibuat");
      resetForm();
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan akun");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(account: Account) {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ id: account.id, isActive: !account.isActive }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal memperbarui akun");
      setMessage(account.isActive ? "Akun berhasil dinonaktifkan" : "Akun berhasil diaktifkan");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui akun");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(account: Account) {
    if (!confirm(`Hapus akun ${account.name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/accounts?id=${account.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Gagal menghapus akun");
      setMessage("Akun berhasil dihapus");
      await loadAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus akun");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--admin-text-primary)" }}>Admin Akun</h1>
        <p className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>Kelola akun admin, role, status aktif, dan password.</p>
      </div>

      {(message || error) && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
          {error || message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border p-4" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--admin-text-primary)" }}>
              {editingId ? `Edit akun #${editingId}` : "Tambah akun baru"}
            </p>
            <p className="text-xs" style={{ color: "var(--admin-text-secondary)" }}>Nama akan otomatis menjadi uppercase.</p>
          </div>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-3 py-2 text-xs font-semibold">
              Batal Edit
            </button>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="NAMA AKUN"
            className="rounded-lg border px-3 py-2 text-sm uppercase"
            required
          />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.trimStart())}
            placeholder="username"
            className="rounded-lg border px-3 py-2 text-sm"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={editingId ? "password baru (opsional)" : "password"}
            type="password"
            className="rounded-lg border px-3 py-2 text-sm"
            autoComplete="new-password"
          />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-lg border px-3 py-2 text-sm">
            {ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium" style={{ color: "var(--admin-text-body)" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Akun aktif
        </label>

        <div className="flex flex-wrap gap-2">
          <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Menyimpan..." : editingId ? "Simpan Perubahan" : "Tambah Akun"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-lg border px-4 py-2 text-sm font-semibold">
              Reset Form
            </button>
          )}
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "var(--admin-border)", backgroundColor: "var(--admin-bg-card)" }}>
        <div className="border-b p-4" style={{ borderColor: "var(--admin-border)" }}>
          <div className="grid gap-3 md:grid-cols-[1.5fr_repeat(2,minmax(0,0.8fr))_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, username, atau role"
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="all">Semua role</option>
              {ROLE_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-lg border px-3 py-2 text-sm">
              <option value="all">Semua status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
            <button type="button" onClick={resetFilters} className="rounded-lg border px-3 py-2 text-sm font-semibold">
              Reset Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-sm">Memuat akun...</div>
        ) : filteredAccounts.length === 0 ? (
          <div className="p-4 text-sm" style={{ color: "var(--admin-text-secondary)" }}>
            Tidak ada akun yang cocok dengan filter.
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--admin-border)" }}>
            {filteredAccounts.map((account) => (
              <div key={account.id} className="grid gap-3 p-4 text-sm md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold uppercase" style={{ color: "var(--admin-text-primary)" }}>{account.name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${account.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {account.isActive ? "aktif" : "nonaktif"}
                    </span>
                  </div>
                  <div style={{ color: "var(--admin-text-secondary)" }}>{account.username} · {account.role}</div>
                  <div className="mt-1 text-xs" style={{ color: "var(--admin-text-secondary)" }}>
                    Login terakhir: {formatDate(account.lastLoginAt)} · Dibuat: {formatDate(account.createdAt)}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 md:justify-end">
                  <button disabled={saving} onClick={() => startEdit(account)} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50">
                    Edit
                  </button>
                  <button disabled={saving} onClick={() => toggleActive(account)} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50">
                    {account.isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button disabled={saving} onClick={() => handleDelete(account)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
