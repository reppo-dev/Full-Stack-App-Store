import Link from "next/link";
import { Button } from "@/components/ui/button";
import getToken from "@/features/auth/api/getToken";
import { getuserAction } from "@/features/auth/api/auth.action";
import { ModelUser } from "@/models/modles";
import UserDropdown from '@/features/auth/components/UserDropdown';

export default async function AuthButtons() {
  const token = await getToken();
  const isLoggedIn = !!token;

  if (isLoggedIn && token) {
    const res = await getuserAction();
    const data: ModelUser = res.user;

    return <UserDropdown user={data} />;
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
