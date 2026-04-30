import { Input } from "../ui/input";
import { Bell, Search, User } from "lucide-react";
import LightDarkToggle from "../light-dark";
import { SidebarToggle } from "../sidebarToggle";
import AuthButtons from "./AuthButtons";

const Header = () => {
  return (
    <header>
      <div className="flex m-13 mt-14 items-center justify-between gap-10 ">
        <div className="flex items-center justify-center gap-5">
          <SidebarToggle />
          <div className="items-center font-bold text-xl">
            <span className="text-blue-600 text-xl">Dash</span>Stack
          </div>
        </div>
        <div className="relative w-[42%]">
          <Input className="w-full p-6" placeholder="Search product, item" />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center justify-center gap-8">
          <LightDarkToggle />
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
