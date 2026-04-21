import { Input } from "@/components/ui/input";
import Image from "next/image";
import Logo from "@/public/Logo.png";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Home = () => {
  return (
    <div>
      <header>
        <div className="flex items-center justify-between gap-10">
          <div className="flex">
            <SidebarTrigger />
            <div className="items-center font-bold">
              <span className="text-blue-600">Dash</span>Stack
            </div>
          </div>
          <Input />
          <div>
            <Image src={Logo} alt={`${(<Bell />)}`} />
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
