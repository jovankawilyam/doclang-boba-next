"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/sidebar";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    const ok = sessionStorage.getItem("admin_auth") === "true";
    if (!ok) router.replace("/admin/login");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#F4F7FB]">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto lg:pl-0">
        <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
