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
    let data;
    try {
      const res = await axios.get(`http://localhost:3000/api/user`, {
        headers: { Cookie: `jwt=${token}` },
      });
      data = res.data;
    } catch {
      console.warn("Invalid token - treating as guest");
    }

    return (
      <>
        <Bell size={30} />
        <Avatar size="lg">
          <AvatarImage src={data?.image} />
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
