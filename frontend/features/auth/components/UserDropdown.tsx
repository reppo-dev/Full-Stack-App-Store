"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, User, Heart, ShoppingBag, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserDropdownProps {
  user: {
    image?: string;
    first_name?: string;
    last_name?: string;
    user_name?: string;
    email?: string;
    role_id?: number;
  };
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const displayName =
    user.first_name && user.last_name
      ? `${user.first_name} ${user.last_name}`
      : user.user_name || user.email || "User";

  const isAdmin = user.role_id === 2;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/v1/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // Ignore errors — still clear local state
    }
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      <button className="relative p-2 rounded-full hover:bg-accent transition-colors" aria-label="Notifications">
        <Bell size={22} />
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors focus:outline-none">
            <Avatar size="lg">
              <AvatarImage src={user.image} />
              <AvatarFallback>
                <User size={20} />
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              )}
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/favorite" className="flex items-center gap-2 cursor-pointer">
                <Heart className="h-4 w-4" />
                <span>My Wishlist</span>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link href="/orderlist" className="flex items-center gap-2 cursor-pointer">
                <ShoppingBag className="h-4 w-4" />
                <span>My Orders</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {isAdmin && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
