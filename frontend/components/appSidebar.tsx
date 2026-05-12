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
  Inbox,
  ShoppingCart,
  Layers,
  CreditCard,
  Calendar,
  CheckSquare,
  Phone,
  Settings,
} from "lucide-react";
import Link from "next/link";
import Logout from "./logout";
import { cookies } from "next/headers";
import axios from "axios";
import { redirect } from "next/navigation";

const menuItems = [
  { title: "Products", url: "/products", icon: Package, requiresAuth: true },
  { title: "Favorites", url: "/favorites", icon: Heart, requiresAuth: true },
  { title: "Inbox", url: "/inbox", icon: Inbox, requiresAuth: true },
  {
    title: "Order Lists",
    url: "/orderlists",
    icon: ShoppingCart,
    requiresAuth: true,
  },
  {
    title: "Product Stock",
    url: "/productstock",
    icon: Layers,
    requiresAuth: true,
  },
  { title: "Pricing", url: "/pricing", icon: CreditCard, requiresAuth: false },
  { title: "Calendar", url: "/calendar", icon: Calendar, requiresAuth: true },
  { title: "To-Do", url: "/todo", icon: CheckSquare, requiresAuth: true },
  { title: "Contact", url: "/contact", icon: Phone, requiresAuth: false },
  { title: "Settings", url: "/settings", icon: Settings, requiresAuth: true },
];

const AppSidebar = async () => {
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
              (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/dashboard">
                    <Home />
                    <span>Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              )
              {/* {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))} */}
              {/* {isLogedin ? (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Logout />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : ( */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/login">
                    <Settings />
                    <span>Login</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* )} */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
