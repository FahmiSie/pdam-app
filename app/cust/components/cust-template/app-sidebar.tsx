"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, UserPen, FileText, CreditCard, LogOut } from "lucide-react";
import Cookies from "js-cookie";
import { toast } from "sonner";

const items = [
  { title: "Home", href: "/cust/dashboard", icon: Home },
  { title: "My Profile", href: "/cust/profile", icon: UserPen },
  { title: "Tagihan", href: "/cust/bills", icon: FileText },
  { title: "Pembayaran", href: "/cust/payments", icon: CreditCard },
];

export function CustSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("accessToken");
    toast.success("Berhasil logout");
    router.push("/sign-in");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-6 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <div>
              <p className="font-bold text-sidebar-foreground text-base leading-tight">PDAM</p>
              <p className="text-xs text-sidebar-foreground/60">Customer Portal</p>
            </div>
          </div>
        </div>

        <SidebarGroup className="pt-4">
          <SidebarGroupLabel className="px-4 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-1">
            CUSTOMER
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg mx-2 transition-all duration-200 ${isActive ? "bg-blue-600 text-white shadow-md" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}