"use client";

import { createContext, useContext } from "react";
import type { AdminSessionData } from "@/lib/admin-types";

const AdminSessionContext = createContext<AdminSessionData | null>(null);

export function AdminSessionProvider({
  admin,
  children,
}: {
  admin: AdminSessionData;
  children: React.ReactNode;
}) {
  return (
    <AdminSessionContext.Provider value={admin}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionData {
  const ctx = useContext(AdminSessionContext);
  if (!ctx) throw new Error("useAdminSession must be used within AdminSessionProvider");
  return ctx;
}
