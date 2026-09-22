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

import Link from "next/link";
import { usePathname } from "next/navigation";

const sideBox = [
  { title: "All Tickets", url: "/inbox", icon: Mail },
  { title: "Starred", url: "/starred", icon: Star },
  { title: "Urgent & High", url: "/important", icon: Badge },
  { title: "Resolved / Closed", url: "/bin", icon: Trash2 },
];

const CardBox = () => {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 hidden md:block">
      <Card className="flex flex-col p-4 gap-4 shadow-sm">
        <Link href="/inbox">
          <Button className="w-full font-medium" size="sm">
            <Plus className="w-4 h-4 mr-1" /> New Ticket
          </Button>
        </Link>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Support Views
          </span>

          <nav className="flex flex-col gap-1">
            {sideBox.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  href={item.url}
                  key={item.title}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={16} />
                  {item.title}
                </Link>
              );
            })}
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
