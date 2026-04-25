import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import AppSidebar from "@/components/appSidebar";
import HeaderDashboard from "./components/HeaderDashboard";
import SidebarDash from "./components/SidebarDash";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <Sidebar className="resize-none" collapsible="icon">
        <SidebarDash />
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <HeaderDashboard />
        <main>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
