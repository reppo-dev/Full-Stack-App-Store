import { apiClient } from "./client";

export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export interface TicketMessage {
  id: number;
  created_at: string;
  ticket_id: number;
  sender_id: number;
  message: string;
  is_internal: boolean;
  sender_first_name?: string;
  sender_last_name?: string;
  sender_email?: string;
  sender_image?: string;
  sender_role?: string;
}

export interface Ticket {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  assigned_to?: number;
  user_first_name?: string;
  user_last_name?: string;
  user_email?: string;
  assigned_first_name?: string;
  assigned_last_name?: string;
  message_count: number;
  messages?: TicketMessage[];
}

export interface CreateTicketInput {
  subject: string;
  priority: TicketPriority;
  category: string;
  initial_message: string;
}

export interface CreateTicketMessageInput {
  message: string;
  is_internal?: boolean;
}

export interface TicketQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export const ticketsApi = {
  /**
   * Fetch paginated list of tickets.
   */
  async getTickets(params?: TicketQueryParams): Promise<PaginatedTicketsResponse> {
    const res = await apiClient.get("/api/v1/tickets", { params });
    const payload = res.data;
    const items = payload.data || [];
    const meta = payload.meta || {
      total: items.length,
      page: params?.page || 1,
      last_page: 1,
    };
    return { data: items, meta };
  },

  /**
   * Get single ticket by ID along with its messages.
   */
  async getTicketById(id: number): Promise<Ticket> {
    const res = await apiClient.get(`/api/v1/tickets/${id}`);
    return res.data.data || res.data;
  },

  /**
   * Create a new ticket.
   */
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const res = await apiClient.post("/api/v1/tickets", input);
    return res.data.data || res.data;
  },

  /**
   * Append a message to an existing ticket.
   */
  async addMessage(ticketId: number, input: CreateTicketMessageInput): Promise<TicketMessage> {
    const res = await apiClient.post(`/api/v1/tickets/${ticketId}/messages`, input);
    return res.data.data || res.data;
  },

  /**
   * Update the lifecycle status of a ticket.
   */
  async updateStatus(ticketId: number, status: TicketStatus): Promise<Ticket> {
    const res = await apiClient.put(`/api/v1/tickets/${ticketId}/status`, { status });
    return res.data.data || res.data;
  },

  /**
   * Assign a ticket to a support staff / admin user.
   */
  async assignTicket(ticketId: number, assignedTo: number): Promise<Ticket> {
    const res = await apiClient.put(`/api/v1/tickets/${ticketId}/assign`, { assigned_to: assignedTo });
    return res.data.data || res.data;
  },
};
