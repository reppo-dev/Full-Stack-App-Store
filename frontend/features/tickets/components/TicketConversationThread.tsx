"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Ticket,
  TicketMessage,
  TicketStatus,
  ticketsApi,
} from "@/features/tickets/api/tickets.client";
import { authApi } from "@/features/auth/api/auth.client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Send,
  Lock,
  MessageSquare,
  Clock,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface TicketConversationThreadProps {
  ticketId: number;
  onClose?: () => void;
  onTicketUpdated?: () => void;
}

export default function TicketConversationThread({
  ticketId,
  onClose,
  onTicketUpdated,
}: TicketConversationThreadProps) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState<string>("");
  const [isInternal, setIsInternal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  const [currentRole, setCurrentRole] = useState<string>("customer");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    authApi
      .getMe()
      .then((res) => {
        if (!mounted) return;
        const user = res.data || res.user || res;
        const role = user.role || (user.role_id === 1 ? "admin" : "customer");
        setCurrentRole(role);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const loadTicket = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketsApi.getTicketById(ticketId);
      setTicket(data);
    } catch (err) {
      setError((err as Error)?.message || "Failed to load ticket details");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await ticketsApi.addMessage(ticketId, {
        message: replyText.trim(),
        is_internal: isInternal,
      });
      setReplyText("");
      setIsInternal(false);
      await loadTicket();
      onTicketUpdated?.();
    } catch (err) {
      alert((err as Error)?.message || "Failed to send reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await ticketsApi.updateStatus(ticket.id, newStatus);
      setTicket((prev) => (prev ? { ...prev, status: updated.status } : updated));
      onTicketUpdated?.();
    } catch (err) {
      alert((err as Error)?.message || "Failed to update ticket status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary" className="opacity-70">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <Badge className="bg-rose-500 text-white font-semibold animate-pulse border-none">
            Urgent
          </Badge>
        );
      case "high":
        return (
          <Badge className="bg-amber-500 text-white font-medium border-none">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-blue-500 text-white font-medium border-none">
            Medium
          </Badge>
        );
      case "low":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Low
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
        <p className="text-sm">Loading ticket conversation...</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-destructive">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="text-base font-semibold">Error loading ticket</p>
        <p className="text-sm opacity-80 mb-4">{error || "Ticket not found"}</p>
        <Button variant="outline" size="sm" onClick={loadTicket}>
          Try Again
        </Button>
      </div>
    );
  }

  const isAdmin = currentRole === "admin";
  const messages = ticket.messages || [];

  return (
    <div className="flex flex-col h-full bg-background border rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b bg-muted/20 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                #{ticket.id}
              </span>
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              <Badge variant="outline" className="text-xs">
                {ticket.category || "General"}
              </Badge>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate mt-1">
              {ticket.subject}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Status switcher */}
            <Select
              value={ticket.status}
              onValueChange={(val) => handleStatusChange(val as TicketStatus)}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger className="h-8 text-xs w-[125px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Customer & Timestamp info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-2 truncate">
            <User className="w-3.5 h-3.5 shrink-0" />
            <span className="font-medium text-foreground">
              {ticket.user_first_name
                ? `${ticket.user_first_name} ${ticket.user_last_name || ""}`.trim()
                : ticket.user_email || `User #${ticket.user_id}`}
            </span>
            {ticket.user_email && (
              <span className="opacity-70 truncate">({ticket.user_email})</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {ticket.created_at
                ? format(new Date(ticket.created_at), "MMM d, yyyy h:mm a")
                : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No messages in this ticket yet.</p>
          </div>
        ) : (
          messages.map((msg: TicketMessage) => {
            const isInternalMsg = msg.is_internal;
            const senderName =
              msg.sender_first_name
                ? `${msg.sender_first_name} ${msg.sender_last_name || ""}`.trim()
                : msg.sender_email || `User #${msg.sender_id}`;
            const isStaff =
              msg.sender_role === "admin" ||
              msg.sender_role === "staff" ||
              msg.sender_role === "support";

            return (
              <div
                key={msg.id}
                className={`p-4 rounded-xl transition-all ${
                  isInternalMsg
                    ? "bg-amber-500/10 border border-amber-500/30 dark:bg-amber-950/20"
                    : isStaff
                    ? "bg-primary/5 border border-primary/15 ml-4 sm:ml-8"
                    : "bg-muted/40 border border-border/60 mr-4 sm:mr-8"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {senderName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-foreground">
                      {senderName}
                    </span>
                    {isStaff ? (
                      <Badge className="bg-primary/20 text-primary hover:bg-primary/20 text-[10px] py-0 px-1.5 border-none">
                        <Shield className="w-2.5 h-2.5 mr-1" />
                        Staff
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 opacity-70">
                        Customer
                      </Badge>
                    )}
                    {isInternalMsg && (
                      <Badge className="bg-amber-500 text-white font-medium text-[10px] py-0 px-1.5 border-none">
                        <Lock className="w-2.5 h-2.5 mr-1" />
                        Internal Note
                      </Badge>
                    )}
                  </div>

                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {msg.created_at
                      ? formatDistanceToNow(new Date(msg.created_at), {
                          addSuffix: true,
                        })
                      : ""}
                  </span>
                </div>

                {/* Message Body */}
                <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 pl-9">
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input Area */}
      <div className="p-4 border-t bg-muted/10">
        <form onSubmit={handleSendReply} className="space-y-3">
          <Textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isInternal
                ? "Add an internal staff note (only visible to team members)..."
                : "Type your response to this ticket..."
            }
            rows={3}
            className={`resize-none focus-visible:ring-primary ${
              isInternal ? "border-amber-500/50 bg-amber-500/5" : ""
            }`}
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              {isAdmin && (
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer text-amber-600 dark:text-amber-400">
                  <Checkbox
                    checked={isInternal}
                    onCheckedChange={(checked) => setIsInternal(!!checked)}
                  />
                  <Lock className="w-3 h-3" />
                  <span>Internal note (staff only)</span>
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              {ticket.status !== "resolved" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange("resolved")}
                  className="text-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                  Mark Resolved
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={!replyText.trim() || isSubmitting}
                className={isInternal ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                ) : (
                  <Send className="w-4 h-4 mr-1.5" />
                )}
                {isInternal ? "Post Note" : "Send Reply"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
