import Link from "next/link";
import LightDarkToggle from "../light-dark";
import { SidebarToggle } from "@/features/dashboard/components/layout/sidebarToggle";
import AuthButtons from "./AuthButtons";
import HeaderCartButton from "@/features/cart/components/HeaderCartButton";
import HeaderSearch from "./HeaderSearch";

const Header = () => {
  return (
    <header className="relative w-full border-b bg-background/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1520px] mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
        {/* Left: Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <SidebarToggle />
          <Link
            href="/"
            className="flex items-center font-bold text-lg sm:text-xl tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-blue-600">Dash</span>
            <span className="text-foreground">Stack</span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="flex items-center justify-center flex-1 max-w-xl mx-2 sm:mx-4">
          <HeaderSearch />
        </div>

        {/* Right: Actions (Cart, Theme, Auth) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <HeaderCartButton />
          <LightDarkToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
