"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Download, Info, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface Message {
  ID: number;
  sender_id: number;
  subject: string;
  snippet: string;
  is_read: boolean;
  is_starred: boolean;
  is_important: boolean;
  is_trashed: boolean;
  sender?: {
    first_name: string;
    last_name?: string;
    user_name?: string;
  };
  labels: { ID: number; name: string; color_code: string }[];
  CreatedAt: string;
}

type BoxMessageProps = {
  folder:
    | "inbox"
    | "starred"
    | "sent"
    | "draft"
    | "important"
    | "trash"
    | "spam";
};

const BoxMessage = ({ folder }: BoxMessageProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // دریافت پیام‌ها از API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/messages`, {
          params: { folder },
          withCredentials: true,
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [folder]);

  // تغییر وضعیت ستاره
  const toggleStar = async (id: number) => {
    try {
      await axios.put(`http://localhost:3000/api/messages/${id}/star`, null, {
        withCredentials: true,
      });
      setMessages((prev) =>
        prev.map((m) =>
          m.ID === id ? { ...m, is_starred: !m.is_starred } : m,
        ),
      );
    } catch (err) {
      console.error("Star failed", err);
    }
  };

  // انتقال به زباله‌دان
  const moveToTrash = async (id: number) => {
    try {
      await axios.put(`http://localhost:3000/api/messages/${id}/trash`, null, {
        withCredentials: true,
      });
      if (folder !== "trash") {
        setMessages((prev) => prev.filter((m) => m.ID !== id));
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.ID === id ? { ...m, is_trashed: true } : m)),
        );
      }
    } catch (err) {
      console.error("Trash failed", err);
    }
  };

  // نام فرستنده
  const senderName = (msg: Message) =>
    msg.sender
      ? `${msg.sender.first_name} ${msg.sender.last_name || ""}`
      : "Unknown";

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <Card className="p-4">
      {/* نوار جستجو و دکمه‌ها */}
      <div className="flex justify-between items-center">
        <div className="relative hidden md:block">
          <Input
            className="w-full p-5 rounded-full"
            placeholder="Search mail"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex">
          <Button className="rounded-r-none">
            <Download />
          </Button>
          <Button className="m-0 p-0 rounded-none">
            <Info />
          </Button>
          <Button className="rounded-l-none">
            <Trash />
          </Button>
        </div>
      </div>

      {/* لیست پیام‌ها دقیقاً با همان grid و کلاس‌های نسخهٔ دوم */}
      <div>
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.ID}
              className="grid grid-cols-[2.5rem_2.5rem_1fr_7.5rem_2fr_1fr] items-center gap-4 py-2"
            >
              {/* چک‌باکس */}
              <Checkbox />

              {/* ستاره */}
              <button onClick={() => toggleStar(msg.ID)}>
                <Star
                  className={`h-5 w-5 ${
                    msg.is_starred
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-current text-gray-400"
                  }`}
                />
              </button>

              {/* نام فرستنده */}
              <span className="font-medium">{senderName(msg)}</span>

              {/* برچسب (فقط اولی) */}
              <span className="text-sm">{msg.labels?.[0]?.name}</span>

              {/* خلاصه پیام */}
              <span className="text-sm truncate">
                {msg.subject || msg.snippet}
              </span>

              {/* زمان و دکمهٔ زباله */}
              <span className="text-sm truncate flex items-center justify-between gap-1">
                <span>{new Date(msg.CreatedAt).toLocaleTimeString()}</span>
                <button
                  className="cursor-pointer"
                  onClick={() => moveToTrash(msg.ID)}
                >
                  <Trash className="h-4 w-4 text-red-500" />
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default BoxMessage;
