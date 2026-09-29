import { assertAdminSession } from "@/lib/auth/assertAdminSession";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── LAYER 2: Independent Admin Authorization Guard ─────────────────────
  // assertAdminSession() verifies Supabase Auth session AND Profile.role === ADMIN.
  // This guard is NOT delegated to middleware alone. Every admin layout call
  // independently re-checks authorization (Defense in Depth).
  let adminName = "";
  try {
    const { profile } = await assertAdminSession();
    adminName = profile.name || profile.email;
  } catch (err: unknown) {
    if (err && typeof err === "object" && "statusCode" in err) {
      const statusCode = (err as { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        redirect(`/admin/login?redirectTo=/admin${statusCode === 403 ? "&error=denied" : ""}`);
      }
    }
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-brand-charcoal text-brand-ivory font-sans flex flex-col lg:flex-row">
      {/*
        AdminSidebar is 'use client' — it handles:
        - Desktop sticky sidebar on the LEFT (w-64 flex-shrink-0 h-screen sticky top-0)
        - Mobile topbar with collapsible menu on top (<lg)
        - Active route highlighting (usePathname)
      */}
      <AdminSidebar adminName={adminName} />

      {/* Main admin page content area — appears directly to the RIGHT of sidebar on desktop */}
      <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
