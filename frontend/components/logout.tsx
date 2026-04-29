"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { useState } from "react";
import { LogOut } from "lucide-react";

const Logout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleSubmit} disabled={loading}>
      <LogOut />
      <span>Log out</span>
    </Button>
  );
};

export default Logout;
