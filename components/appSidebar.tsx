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
  LogOut,
} from "lucide-react";
import Link from "next/link";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Products", url: "/products", icon: Package },
  { title: "Favorites", url: "/favorites", icon: Heart },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Order Lists", url: "/orderlists", icon: ShoppingCart },
  { title: "Product Stock", url: "/productstock", icon: Layers },
  { title: "Pricing", url: "/pricing", icon: CreditCard },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "To-Do", url: "/todo", icon: CheckSquare },
  { title: "Contact", url: "/contact", icon: Phone },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Log Out", url: "/logout", icon: LogOut },
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/"
          className="flex mt-8 items-center scale-125 justify-center font-bold"
        >
          <span className="text-blue-600 ">Dash</span>Stack
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
