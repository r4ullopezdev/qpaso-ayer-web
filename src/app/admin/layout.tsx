import { getSession } from "@/lib/auth";
import { AdminTopbar } from "@/components/AdminTopbar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · Q'Paso Ayer" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <div style={{ minHeight: "100vh" }}>
      {session && <AdminTopbar username={session.username} />}
      <div style={{ paddingBottom: 60 }}>{children}</div>
    </div>
  );
}
