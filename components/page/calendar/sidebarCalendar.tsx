"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { useState } from "react";

type Event = {
  id: number;
  image: string;
  title: string;
  date: string;
  address: string;
  attendees: string[];
  extraCount: number;
};

type Props = {
  events: Event[];
};

const SidebarCalendar = ({ events }: Props) => {
  const [showAll, setShowAll] = useState(false);

  const visibleEvents = showAll ? events : events.slice(0, 4);

  return (
    <Card className="lg:mx-6">
      <CardHeader className="gap-4 lg:items-start lg:justify-center">
        <CardTitle>
          <Button className="lg:py-5 md:py-4 py-2 px-4 md:px-6 lg:px-14 bg-[#4880FF] text-white font-medium">
            + Add New Event
          </Button>
        </CardTitle>
        <span className="font-medium">You are going to</span>
      </CardHeader>

      <CardContent className="space-y-4 ">
        {visibleEvents.map((event, index) => (
          <div
            key={event.id}
            className={`pt-4 ${index !== 0 ? "border-t" : ""} border-gray-200`}
          >
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={event.image} />
                <AvatarFallback>
                  <User size={16} />
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col gap-1">
                <span className="font-medium text-sm">{event.title}</span>
                <p className="text-xs text-muted-foreground">{event.date}</p>
                <p className="text-xs text-muted-foreground">{event.address}</p>

                <div className="mt-2 flex items-center gap-1">
                  {event.attendees.slice(0, 3).map((avatar, i) => (
                    <Avatar
                      key={i}
                      className="h-6 w-6 border-2 border-white -ml-1 first:ml-0"
                    >
                      <AvatarImage src={avatar} />
                      <AvatarFallback className="text-[10px]">
                        <User size={10} />
                      </AvatarFallback>
                    </Avatar>
                  ))}

                  <div className="h-6 w-6 -ml-1 flex items-center justify-center rounded-full bg-[#4880FF]/10 text-[10px] text-[#4880FF] border border-[#4880FF]/40">
                    +{event.extraCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!showAll && events.length > 4 && (
          <div className="pt-4 flex justify-center">
            <Button
              variant="outline"
              className="rounded-full px-6 text-xs font-medium"
              onClick={() => setShowAll(true)}
            >
              See More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SidebarCalendar;
