"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Star, Download, Info, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

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

      <div>
        <Link href="" className="contents">
          <div className="grid grid-cols-[2.5rem_2.5rem_1fr_7.5rem_2fr_1fr] items-center gap-4 py-2">
            <Checkbox onClick={(e) => e.stopPropagation()} />

            {/* ستاره */}
            <button>
              <Star />
            </button>

            {/* نام فرستنده */}
            <span className="font-medium">aa</span>

            {/* برچسب (فقط اولی) */}
            <span className="text-sm">aaa</span>

            {/* خلاصه پیام */}
            <span className="text-sm truncate">aaaaaa</span>

            {/* زمان و دکمهٔ زباله */}
            <span className="text-sm truncate flex items-center justify-between gap-1">
              <span>aaa</span>
              <button className="cursor-pointer">
                <Trash className="h-4 w-4 text-red-500" />
              </button>
            </span>
          </div>
        </Link>
      </div>
    </Card>
  );
};

export default BoxMessage;
