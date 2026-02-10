import React from "react";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { AppSidebar } from "../components/admin-template/app-sidebar";

export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
        <nav className="bg-white shadow-lg border-b border-slate-200 p-4 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="p-2 hover:bg-slate-100 rounded-lg transition-colors duration-200" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
                <p className="text-slate-600 text-sm">Manage your PDAM system</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-8 px-4">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
