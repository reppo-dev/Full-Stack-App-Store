"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
      <Menu size={50} />
    </Button>
  );
}
