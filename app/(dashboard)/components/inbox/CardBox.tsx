import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Mail,
  Star,
  Send,
  Pencil,
  AlertTriangle,
  Badge,
  Trash2,
} from "lucide-react";

const sideBox = [
  { title: "Inbox", url: "/Inbox", icon: Mail },
  { title: "Starred", url: "/Starred", icon: Star },
  { title: "Sent", url: "/Send", icon: Send },
  { title: "Draft", url: "/Draft", icon: Pencil },
  { title: "Spam", url: "/Spam", icon: AlertTriangle },
  { title: "Important", url: "/Important", icon: Badge },
  { title: "Bin", url: "/Bin", icon: Trash2 },
];

const CardBox = () => {
  return (
    <aside className="w-64">
      <Card className="flex flex-col p-5 gap-4">
        <Button className="w-full p-5">+ Compose</Button>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-500 px-2">
            My Email
          </span>

          <nav className="flex flex-col gap-1">
            {sideBox.map((item) => (
              <a
                href={item.url}
                key={item.title}
                className="flex items-center gap-3 px-2 py-2 rounded-md dark:hover:bg-gray-700 hover:bg-slate-100 cursor-pointer font-normal text-sm transition-colors"
              >
                <item.icon size={18} />
                {item.title}
              </a>
            ))}
          </nav>
        </div>

        <span className="text-sm font-semibold text-gray-500 px-2 mt-2">
          Label
        </span>
      </Card>
    </aside>
  );
};

export default CardBox;
