import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import getToken from "@/app/actions/getToken";
import { getuserAction } from "@/app/actions/auth";
import { ModelUser } from "@/models/modles";

export default async function AuthButtons() {
  const token = await getToken();
  console.log(token);
  const isLoggedIn = !!token;

  if (isLoggedIn && token) {
    const res = await getuserAction();
    const data: ModelUser = res.user;

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
