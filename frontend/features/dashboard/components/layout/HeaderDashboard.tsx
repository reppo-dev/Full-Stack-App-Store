import LightDarkToggle from "@/components/light-dark";
import { SidebarToggle } from "@/features/dashboard/components/layout/sidebarToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Bell, ChevronDown, Search, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { getuserAction } from "@/features/auth/api/auth.action";
import Logout from "@/features/auth/components/logout";

const HeaderDashboard = async () => {
  const res = await getuserAction();
  const user = res.success ? res.user : null;

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.user_name || "Admin";

  const roleName =
    user?.role?.name ||
    (user?.role_id === 2 ? "Admin" : "User");

  return (
    <header className="border-b">
      <div className="flex mx-13 my-3 items-center justify-between gap-10 ">
        <SidebarToggle />
        <div className="relative hidden md:block w-[42%]">
          <Input
            className="w-full p-6 rounded-full"
            placeholder="Search product, item"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-center gap-8">
          <LightDarkToggle />
          <Bell size={30} />
          <Avatar size="lg">
            <AvatarImage src={user?.image || "https://github.com/shadcn.png"} />
            <AvatarFallback>
              <User size={20} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start justify-between gap-0.5">
            <p className="text-sm font-medium">{displayName}</p>
            <span className="text-xs text-muted-foreground capitalize">{roleName}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-accent transition-colors focus:outline-none">
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {user?.ID && (
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/user/${user.ID}`} className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/orderlists" className="cursor-pointer">
                    Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer">
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Logout />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default HeaderDashboard;
