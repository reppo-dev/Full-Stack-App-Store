import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import HeaderDashboard from '@/features/dashboard/components/layout/HeaderDashboard';
import SidebarDash from '@/features/dashboard/components/layout/SidebarDash';
import { redirect } from "next/navigation";
import axios from "axios";
import getToken from '@/features/auth/api/getToken';

const BASE_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();

  if (!token) {
    redirect("/login");
  }

  let userData = null;

  try {
    const res = await axios.get(`${BASE_API_URL}/api/v1/auth/me`, {
      headers: {
        Cookie: `jwt=${token}`,
        Authorization: `Bearer ${token}`,
      },
    });
    userData = res.data?.data || res.data;
  } catch (error) {
    console.error("Failed to fetch user in dashboard guard:", error);
    redirect("/login");
  }

  const roleName =
    userData?.role?.name || userData?.role_name || (typeof userData?.role === "string" ? userData.role : "");
  const isAdmin = roleName === "admin" || userData?.role_id === 2;

  if (!isAdmin) {
    redirect("/");
  }

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
