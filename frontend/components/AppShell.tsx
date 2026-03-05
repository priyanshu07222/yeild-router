"use client";

import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/deposit",
  "/withdraw",
  "/strategies",
  "/leaderboard",
  "/profile",
  "/wallet",
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboardRoute = DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (!isDashboardRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen">
      <DashboardSidebar />
      <main className="p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 md:ml-64 md:pt-8">{children}</main>
    </div>
  );
}
