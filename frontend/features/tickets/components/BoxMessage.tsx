"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  TicketPriority,
  TicketStatus,
  ticketsApi,
} from "@/features/tickets/api/tickets.client";
import TicketConversationThread from "./TicketConversationThread";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Star,
  Plus,
  RefreshCw,
  MessageSquare,
  Clock,
  User,
  Filter,
  Inbox as InboxIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export type FolderType =
  | "inbox"
  | "starred"
  | "sent"
  | "draft"
  | "important"
  | "trash"
  | "spam";

interface BoxMessageProps {
  folder?: FolderType;
}

const CATEGORIES = [
  "General Support",
  "Billing & Payments",
  "Order Issues",
  "Account & Security",
  "Technical",
];

export default function BoxMessage({ folder = "inbox" }: BoxMessageProps) {
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  // Starred state tracked locally for smooth UX
  const [starredIds, setStarredIds] = useState<Set<number>>(new Set());

  // New ticket modal state
  const [isNewTicketOpen, setIsNewTicketOpen] = useState<boolean>(false);
  const [newSubject, setNewSubject] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("General Support");
  const [newPriority, setNewPriority] = useState<TicketPriority>("medium");
  const [newInitialMessage, setNewInitialMessage] = useState<string>("");
  const [isCreatingTicket, setIsCreatingTicket] = useState<boolean>(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await ticketsApi.getTickets({
        limit: 50,
      });
      setTickets(res.data || []);
      // If we don't have a selection and have tickets on desktop, select the first one
      if (!selectedTicketId && res.data && res.data.length > 0 && window.innerWidth >= 1024) {
        setSelectedTicketId(res.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const toggleStar = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMessage.trim() || isCreatingTicket) return;

    setIsCreatingTicket(true);
    try {
      const created = await ticketsApi.createTicket({
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        initial_message: newInitialMessage.trim(),
      });

      setIsNewTicketOpen(false);
      setNewSubject("");
      setNewInitialMessage("");
      setNewPriority("medium");
      setNewCategory("General Support");

      await fetchTickets();
      setSelectedTicketId(created.id);
    } catch (err) {
      alert((err as Error)?.message || "Failed to create support ticket");
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // Filter tickets by folder, status, priority, and search
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      // Folder-based filtering
      if (folder === "starred" && !starredIds.has(t.id)) return false;
      if (folder === "important" && t.priority !== "urgent" && t.priority !== "high") return false;
      if (folder === "trash" && t.status !== "closed") return false;

      // Status filter
      if (statusFilter !== "all" && t.status !== statusFilter) return false;

      // Priority filter
      if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSubject = t.subject.toLowerCase().includes(q);
        const matchCat = (t.category || "").toLowerCase().includes(q);
        const matchUser =
          (t.user_first_name || "").toLowerCase().includes(q) ||
          (t.user_last_name || "").toLowerCase().includes(q) ||
          (t.user_email || "").toLowerCase().includes(q);
        return matchSubject || matchCat || matchUser;
      }

      return true;
    });
  }, [tickets, folder, starredIds, statusFilter, priorityFilter, searchQuery]);

  const handleTicketClick = (ticketId: number) => {
    // If small screen, route directly to detail page
    if (window.innerWidth < 1024) {
      router.push(`/inbox/${ticketId}`);
    } else {
      setSelectedTicketId(ticketId);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] py-0 px-1.5">Open</Badge>;
      case "in_progress":
        return <Badge className="bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] py-0 px-1.5">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] py-0 px-1.5">Resolved</Badge>;
      case "closed":
        return <Badge variant="secondary" className="opacity-70 text-[10px] py-0 px-1.5">Closed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px] py-0 px-1.5">{status}</Badge>;
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" title="Urgent" />;
      case "high":
        return <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="High" />;
      case "medium":
        return <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" title="Medium" />;
      case "low":
      default:
        return <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0" title="Low" />;
    }
  };

  return (
    <Card className="p-4 sm:p-5 w-full flex flex-col h-[calc(100vh-140px)] min-h-[620px] shadow-sm">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets by subject, user, email..."
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="h-9 w-[110px] text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTickets}
            disabled={isLoading}
            className="h-9"
            title="Refresh tickets"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            onClick={() => setIsNewTicketOpen(true)}
            size="sm"
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Ticket
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto border-b text-xs scrollbar-none">
        <span className="text-muted-foreground mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {["all", "open", "in_progress", "resolved", "closed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-full capitalize font-medium transition-all ${
              statusFilter === st
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {st.replace("_", " ")}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground shrink-0 pr-1">
          {filteredTickets.length} {filteredTickets.length === 1 ? "ticket" : "tickets"}
        </span>
      </div>

      {/* Two-Pane Ticket Content */}
      <div className="flex-1 flex gap-4 min-h-0 pt-4 overflow-hidden">
        {/* Left Pane: Ticket List */}
        <div
          className={`flex flex-col min-h-0 overflow-y-auto divide-y divide-border/60 ${
            selectedTicketId ? "w-full lg:w-[380px] xl:w-[440px] shrink-0" : "w-full"
          }`}
        >
          {isLoading && tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
              <p className="text-sm">Loading tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-muted-foreground">
              <InboxIcon className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-base font-medium">No tickets found</p>
              <p className="text-xs opacity-75 mt-1 max-w-xs">
                {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                  ? "Try clearing your filters or search terms."
                  : "No support tickets have been opened yet."}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewTicketOpen(true)}
                className="mt-4 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Open First Ticket
              </Button>
            </div>
          ) : (
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicketId === ticket.id;
              const isStarred = starredIds.has(ticket.id);
              const customerName =
                ticket.user_first_name
                  ? `${ticket.user_first_name} ${ticket.user_last_name || ""}`.trim()
                  : ticket.user_email || `User #${ticket.user_id}`;

              return (
                <div
                  key={ticket.id}
                  onClick={() => handleTicketClick(ticket.id)}
                  className={`p-3.5 sm:p-4 rounded-lg cursor-pointer transition-colors flex flex-col gap-2 ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 dark:bg-primary/15"
                      : "hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {getPriorityIndicator(ticket.priority)}
                      <span className="font-semibold text-xs text-foreground truncate">
                        {customerName}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                      <button
                        onClick={(e) => toggleStar(e, ticket.id)}
                        className="p-1 hover:text-amber-500 transition-colors"
                        title={isStarred ? "Starred" : "Star ticket"}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isStarred
                              ? "fill-amber-500 text-amber-500"
                              : "opacity-40 hover:opacity-100"
                          }`}
                        />
                      </button>
                      <span className="text-[11px]">
                        {ticket.created_at
                          ? formatDistanceToNow(new Date(ticket.created_at), {
                              addSuffix: false,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {ticket.subject}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="px-2 py-0.5 rounded bg-muted text-[10px] truncate max-w-[150px]">
                        {ticket.category || "General"}
                      </span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <MessageSquare className="w-3 h-3 opacity-70" />
                        <span>{ticket.message_count || 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Pane: Conversation Thread (Visible on lg screens) */}
        <div className="hidden lg:flex flex-1 min-h-0">
          {selectedTicketId ? (
            <TicketConversationThread
              ticketId={selectedTicketId}
              onClose={() => setSelectedTicketId(null)}
              onTicketUpdated={fetchTickets}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center h-full border border-dashed rounded-xl p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mb-3 opacity-30 text-primary" />
              <h3 className="font-semibold text-base text-foreground">
                Select a Ticket
              </h3>
              <p className="text-xs opacity-75 max-w-sm mt-1">
                Choose any support request from the list to view its real-time
                conversation, reply as staff or customer, and manage resolution.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewTicketOpen(true)}
                className="mt-4 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create New Ticket
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Ticket Conversation Sheet */}
      <Sheet
        open={Boolean(selectedTicketId)}
        onOpenChange={(open) => {
          if (!open) setSelectedTicketId(null);
        }}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl p-0 flex flex-col lg:hidden z-50">
          <SheetHeader className="sr-only">
            <SheetTitle>Ticket Discussion</SheetTitle>
          </SheetHeader>
          {selectedTicketId && (
            <div className="flex-1 min-h-0 h-full">
              <TicketConversationThread
                ticketId={selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                onTicketUpdated={fetchTickets}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* New Ticket Modal */}
      <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Submit a support ticket to our team. Please provide as much context as possible.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTicket} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Subject <span className="text-destructive">*</span>
              </label>
              <Input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Issue with order #123 payment status"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Category
                </label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Priority
                </label>
                <Select
                  value={newPriority}
                  onValueChange={(val) => setNewPriority(val as TicketPriority)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Initial Message / Description <span className="text-destructive">*</span>
              </label>
              <Textarea
                value={newInitialMessage}
                onChange={(e) => setNewInitialMessage(e.target.value)}
                placeholder="Explain the problem, steps to reproduce, or your inquiry..."
                rows={4}
                required
                className="resize-none"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewTicketOpen(false)}
                disabled={isCreatingTicket}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !newSubject.trim() || !newInitialMessage.trim() || isCreatingTicket
                }
              >
                {isCreatingTicket ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    Submitting...
                  </>
                ) : (
                  "Create Ticket"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
