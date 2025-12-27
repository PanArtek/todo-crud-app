import { requireAdmin } from "@/lib/auth-utils";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export const metadata = {
  title: "Panel Admina",
  description: "Panel administracyjny Ekstraklasa Tracker",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protect all admin routes
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Sidebar - Desktop */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:ml-64">
        <AdminHeader email={session.user.email ?? ""} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
