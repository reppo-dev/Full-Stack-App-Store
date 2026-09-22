"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";

const Logout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed", error);
    }
    // Clear cookie client-side as fallback
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  }

  return (
    <Button onClick={handleSubmit} disabled={loading}>
      <LogOut />
      <span>Log out</span>
    </Button>
  );
};

export default Logout;
