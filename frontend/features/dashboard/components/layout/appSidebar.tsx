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
} from "@/components/ui/sidebar";

import {
  Home,
  Package,
  Heart,
  ShoppingCart,
  CreditCard,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Logout from '@/features/auth/components/logout';
import { cookies } from "next/headers";
import { getuserAction } from "@/features/auth/api/auth.action";
import getToken from "@/features/auth/api/getToken";

const menuItems = [
  { title: "Products", url: "/products", icon: Package, requiresAuth: true },
  { title: "Favorites", url: "/favorite", icon: Heart, requiresAuth: true },
  {
    title: "Order Lists",
    url: "/orderlist",
    icon: ShoppingCart,
    requiresAuth: true,
  },
  { title: "Pricing", url: "/pricing", icon: CreditCard, requiresAuth: false },
  { title: "Settings", url: "/settings", icon: Settings, requiresAuth: true, requiresAdmin: true },
];

const AppSidebar = async () => {
  const token = await getToken();
  const isLogedin = !!token;

  const userData = await getuserAction();

  let isAdmin = false;
  if (userData.success && userData.user) {
    isAdmin = userData.user.role_id === 2;
  }

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.requiresAdmin && !isAdmin) return false;
    if (item.requiresAuth && !isLogedin) return false;
    return true;
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="flex mt-8 items-center justify-center font-bold text-xl"
        >
          <span className="text-blue-600 text-xl">Dash</span>Stack
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {isLogedin && isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard">
                      <Home />
                      <span>Dashboard</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isLogedin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Logout />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/login">
                      <Settings />
                      <span>Login</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
