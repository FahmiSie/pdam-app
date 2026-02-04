import React from "react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/admin-template/app-sidebar";

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1">
        <nav className="bg-white shadow-md p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 px-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
