"use client";

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import type { DayProps } from "react-day-picker";
import { DayButton } from "react-day-picker";

type Event = {
  id: number;
  image: string;
  title: string;
  date: string;
  address: string;
  attendees: string[];
  extraCount: number;
  color?: string;
  startDate?: string;
  endDate?: string;
};

type Props = {
  events: Event[];
};

const Calen = ({ events }: Props) => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getEventsForDate = (checkDate: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === checkDate.getDate() &&
        eventDate.getMonth() === checkDate.getMonth() &&
        eventDate.getFullYear() === checkDate.getFullYear()
      );
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }

    return `${start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  return (
    <div className="w-full p-4">
      <div className="w-full overflow-x-auto">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border min-w-[300px] w-full"
          components={{
            Day: (props: DayProps) => {
              const dayDate = props.day.date;
              const dayEvents = getEventsForDate(dayDate);
              const hasEvents = dayEvents.length > 0;

              return (
                <td
                  className={`relative align-top overflow-visible ${props.className ?? ""}`}
                  style={{ position: "relative", overflow: "visible" }}
                  {...props}
                >
                  <DayButton
                    day={props.day}
                    modifiers={props.modifiers}
                    className="w-full"
                  >
                    {dayDate.getDate()}
                  </DayButton>

                  {hasEvents && (
                    <div className="absolute bottom-0 left-0 right-0 h-5 flex flex-col z-10">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className="flex-1 flex items-center justify-center px-1"
                          style={{ backgroundColor: event.color || "#3b82f6" }}
                        >
                          <span className="text-[8px] leading-none text-white truncate w-full text-center">
                            {event.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              );
            },
          }}
        />
      </div>

      {date && (
        <div className="mt-4 space-y-2">
          <h3 className="font-semibold text-lg">
            Events on {date.toLocaleDateString("en-US")}
          </h3>
          {getEventsForDate(date).length > 0 ? (
            getEventsForDate(date).map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg border-l-4"
                style={{ borderLeftColor: event.color || "#3b82f6" }}
              >
                <div className="font-medium">{event.title}</div>
                {event.startDate && event.endDate && (
                  <div className="text-sm text-gray-600">
                    {formatDateRange(event.startDate, event.endDate)}
                  </div>
                )}
                <div className="text-sm text-gray-500 mt-1">
                  {event.address}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No events for this day</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Calen;
