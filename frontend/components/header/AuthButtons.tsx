// components/AuthButtons.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import axios from "axios";

export default async function AuthButtons() {
  const cookieStore = await cookies();
  const token = cookieStore.get("jwt")?.value;
  const isLoggedIn = !!token;

  if (isLoggedIn && token) {
    const res = await axios.get(`/api/user`, {
      headers: {
        Cookie: `jwt=${token}`,
      },
    });
    const data = res.data;

    return (
      <>
        <Bell size={30} />
        <Avatar size="lg">
          <AvatarImage src={data.image || "https://github.com/shadcn.png"} />
          <AvatarFallback>
            <User size={20} />
          </AvatarFallback>
        </Avatar>
      </>
    );
  }

  return (
    <>
      <Link href="/login">
        <Button variant="ghost">Login</Button>
      </Link>
      <Link href="/signup">
        <Button>Sign up</Button>
      </Link>
    </>
  );
}
