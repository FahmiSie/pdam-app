import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"
import { items } from "@/app/admin/admin-menu"
import Link from "next/link"


export function AppSidebar() {
  return (
    <Sidebar className="bg-gradient-to-br from-slate-50 to-slate-100 border-r border-slate-200">
      <SidebarHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-blue-600">P</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">PDAM</h2>
            <p className="text-blue-100 text-sm">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 font-semibold text-sm uppercase tracking-wide mb-4">
            Administrator
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="group hover:bg-white hover:shadow-lg transition-all duration-200 rounded-xl p-3 border border-slate-200"
                  >
                    <Link href={item.href} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                        <item.icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-slate-700 group-hover:text-slate-900">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}