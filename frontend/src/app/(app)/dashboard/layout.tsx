import type { Metadata } from "next";import { Geist, Geist_Mono } from "next/font/google";
import "../../globals.css";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from "@/components/site-header";
import { DashboardHeader } from "@/components/dashboard/header";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
// import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Dashboard | PlaneFlow",
  description: "Personalized dashboard with tasks and projects management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ProtectedRoute>
  <SidebarProvider
    style={
      {
        "--sidebar-width": "calc(var(--spacing) * 56)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties
    }
  >
    <AppSidebar variant="inset" />

    <div className="flex h-svh min-w-0 flex-1 flex-col lg:p-2">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background lg:rounded-md lg:border">
        <DashboardHeader />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
</ProtectedRoute>
  );
}
