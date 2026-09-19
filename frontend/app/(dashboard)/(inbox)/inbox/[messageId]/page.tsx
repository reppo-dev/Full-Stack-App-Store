"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import TicketConversationThread from "../../../components/inbox/TicketConversationThread";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = parseInt(params.messageId as string, 10);

  if (isNaN(ticketId) || ticketId <= 0) {
    return (
      <div className="p-6 w-full flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground mb-4">Invalid Ticket ID specified.</p>
        <Link href="/inbox">
          <Button variant="outline">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      <div className="mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/inbox")}
          className="text-muted-foreground hover:text-foreground text-xs"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to all tickets
        </Button>
      </div>

      <div className="flex-1 min-h-0">
        <TicketConversationThread
          ticketId={ticketId}
          onClose={() => router.push("/inbox")}
        />
      </div>
    </div>
  );
}
