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
    <header className="w-full border-b bg-background/95 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarToggle />
        </div>

        <div className="relative hidden md:block w-full max-w-sm lg:max-w-md">
          <Input
            className="w-full h-10 pl-4 pr-10 rounded-full bg-muted/40 border-border/70 text-sm"
            placeholder="Search dashboard, orders..."
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LightDarkToggle />
          <button
            type="button"
            className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors focus:outline-none cursor-pointer">
                <Avatar size="sm" className="h-8 w-8 sm:h-9 sm:w-9 border">
                  <AvatarImage src={user?.image || "https://github.com/shadcn.png"} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left leading-tight">
                  <p className="text-xs font-semibold text-foreground line-clamp-1 max-w-[120px]">
                    {displayName}
                  </p>
                  <span className="text-[10px] text-muted-foreground capitalize">
                    {roleName}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52" align="end" sideOffset={6}>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{displayName}</p>
                  <p className="text-xs text-muted-foreground capitalize">{roleName}</p>
                </div>
              </DropdownMenuLabel>
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
                    Orders Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/banners" className="cursor-pointer">
                    Banner Campaigns
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
