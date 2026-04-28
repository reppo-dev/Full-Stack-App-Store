import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/appSidebar";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1">
        <Header />
        {children}
      </main>
    </SidebarProvider>
  );
}
