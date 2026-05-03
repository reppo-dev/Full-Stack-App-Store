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
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const sideBox = [
  { title: "Inbox", url: "/inbox", icon: Mail },
  { title: "Starred", url: "/starred", icon: Star },
  { title: "Sent", url: "/send", icon: Send },
  { title: "Draft", url: "/draft", icon: Pencil },
  { title: "Spam", url: "/spam", icon: AlertTriangle },
  { title: "Important", url: "/important", icon: Badge },
  { title: "Bin", url: "/bin", icon: Trash2 },
];

interface Label {
  ID: number;
  name: string;
  color_code: string;
}

const CardBox = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#808080");
  const router = useRouter();

  // دریافت لیبل‌ها

  useEffect(() => {
    const fetchLabels = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/labels", {
          withCredentials: true,
        });
        setLabels(res.data);
      } catch (err) {
        console.error("Failed to fetch labels", err);
      }
    };
    fetchLabels();
  }, []);

  // ایجاد لیبل جدید
  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    try {
      await axios.post(
        "http://localhost:3000/api/labels",
        {
          name: newLabelName,
          color_code: newLabelColor,
        },
        { withCredentials: true },
      );
      setNewLabelName("");
      const fetchLabels = async () => {
        try {
          const res = await axios.get("http://localhost:3000/api/labels", {
            withCredentials: true,
          });
          setLabels(res.data);
        } catch (err) {
          console.error("Failed to fetch labels", err);
        }
      };
      fetchLabels(); // لیست را به‌روز کن
    } catch (err) {
      console.error("Failed to create label", err);
    }
  };

  // حذف لیبل
  const handleDeleteLabel = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/api/labels/${id}`, {
        withCredentials: true,
      });
      setLabels((prev) => prev.filter((l) => l.ID !== id));
    } catch (err) {
      console.error("Failed to delete label", err);
    }
  };

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

        {/* بخش لیبل‌ها */}
        <div className="mt-2">
          <span className="text-sm font-semibold text-gray-500 px-2">
            Label
          </span>
          <div className="flex flex-col gap-1 mt-1">
            {labels.map((label) => (
              <div
                key={label.ID}
                className="flex items-center gap-2 px-2 py-1.5 group rounded-md hover:bg-slate-100 dark:hover:bg-gray-700"
              >
                {/* دایره رنگی */}
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: label.color_code }}
                />
                <span
                  className="text-sm flex-grow cursor-pointer"
                  onClick={() => router.push(`/inbox?label=${label.ID}`)}
                >
                  {label.name}
                </span>
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteLabel(label.ID)}
                >
                  <X size={14} className="text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}

            {/* فرم ایجاد لیبل جدید */}
            <div className="flex items-center gap-1 mt-1 px-2">
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 p-0"
              />
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="New label"
                className="h-7 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleCreateLabel()}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={handleCreateLabel}
              >
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
