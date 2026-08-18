"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminTopbar({ username }: { username: string }) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <div
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,10,13,0.7)",
        position: "sticky",
        top: 0,
        zIndex: 30,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container-x" style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Link href="/admin" className="font-display" style={{ fontSize: 22, color: "var(--gold)" }}>
            QPA · ADMIN
          </Link>
          <Link href="/admin" style={{ fontSize: 13, color: "var(--muted)" }}>Panel</Link>
          <Link href="/admin/eventos/new" style={{ fontSize: 13, color: "var(--muted)" }}>Nuevo evento</Link>
          <Link href="/" style={{ fontSize: 13, color: "var(--muted)" }} target="_blank">Ver sitio ↗</Link>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{username}</span>
          <button onClick={logout} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: 13 }}>
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
