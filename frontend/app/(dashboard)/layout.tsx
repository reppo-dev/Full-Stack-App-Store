import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import HeaderDashboard from "./components/HeaderDashboard";
import SidebarDash from "./components/SidebarDash";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";
import getToken from "../actions/getToken";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getToken();
  console.log(token);

  if (!token) {
    redirect("/login");
  }

  let userData = null;

  try {
    const res = await axios.get(`http://localhost:3000/api/user`, {
      headers: { Cookie: `jwt=${token}` },
    });
    userData = res.data;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    redirect("/login");
  }

  const isAdmin = userData?.role_id === 2;

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
