"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Star,
  Send,
  Pencil,
  AlertTriangle,
  Badge,
  Trash2,
  Plus,
  X,
} from "lucide-react";

const sideBox = [
  { title: "Inbox", url: "/inbox", icon: Mail },
  { title: "Starred", url: "/starred", icon: Star },
  { title: "Sent", url: "/send", icon: Send },
  { title: "Draft", url: "/draft", icon: Pencil },
  { title: "Spam", url: "/spam", icon: AlertTriangle },
  { title: "Important", url: "/important", icon: Badge },
  { title: "Bin", url: "/bin", icon: Trash2 },
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

        <div className="mt-2">
          <span className="text-sm font-semibold text-gray-500 px-2">
            Label
          </span>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-2 px-2 py-1.5 group rounded-md hover:bg-slate-100 dark:hover:bg-gray-700">
              <span className="w-3 h-3 rounded-full shrink-0" />
              <span className="text-sm grow cursor-pointer">label</span>
              <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={14} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>
            <div className="flex items-center gap-1 mt-1 px-2">
              <Input
                type="color"
                className="w-5 h-5 rounded cursor-pointer border-0 p-0"
              />
              <Input placeholder="New label" className="h-7 text-xs" />
              <Button size="icon" variant="ghost" className="h-7 w-7">
                <Plus size={14} />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </aside>
  );
};

export default CardBox;
