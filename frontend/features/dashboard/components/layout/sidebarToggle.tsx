"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarToggle() {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className="h-9 w-9 rounded-full text-foreground hover:bg-muted transition-colors cursor-pointer"
      aria-label="Toggle sidebar menu"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
