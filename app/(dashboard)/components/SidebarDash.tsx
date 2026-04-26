"use client";

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  Inbox,
  ListOrdered,
  BarChart3,
  DollarSign,
  Calendar,
  ClipboardList,
  Phone,
  FileText,
  Puzzle,
  Users,
  Table,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Products", url: "/product", icon: Package },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Order Lists", url: "/orderlists", icon: ListOrdered },
  { title: "Product Stock", url: "/productstock", icon: BarChart3 },
];

const bodySide = [
  { title: "Pricing", url: "/pricing", icon: DollarSign },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "To‑Do", url: "/todo", icon: ClipboardList },
  { title: "Contact", url: "/contact", icon: Phone },
  { title: "Invoice", url: "/invoice", icon: FileText },
  { title: "UI Elements", url: "/uiElements", icon: Puzzle },
  { title: "Team", url: "/team", icon: Users },
  { title: "Table", url: "/table", icon: Table },
];

const buttonside = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Log Out", url: "/logout", icon: LogOut },
];

const SidebarDash = () => {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Link
          href="/"
          className="flex mt-8 items-center justify-center font-bold text-xl group-data-[collapsible=icon]:hidden"
        >
          <span className="text-blue-600 text-xl">Dash</span>Stack
        </Link>
      </SidebarHeader>

      <SidebarContent className="mt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors 
                            ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0 p-0" />

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            PAGES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {bodySide.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors 
                            ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-3 mx-0 p-0" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {buttonside.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors 
                            ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

export default SidebarDash;
