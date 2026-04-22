"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
type Event = {
  id: number;
  title: string;
  date: string;
};

type Props = {
  events: Event[];
};

const Calen = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="w-full p-4">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border w-full"
      />
    </div>
  );
};

export default Calen;
