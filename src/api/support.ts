import { apiRequest } from './client';

export type ApiTicketMessage = { id: number; fromSupport: boolean; text: string; createdAt: string };

export type ApiTicket = {
  id: number;
  subject: string;
  topic: string;
  status: 'open' | 'waiting' | 'resolved';
  createdAt: string;
  updatedAt: string;
  messages: ApiTicketMessage[];
};

export async function apiMyTickets(): Promise<ApiTicket[]> {
  return apiRequest('me/tickets');
}

export async function apiTicket(id: string): Promise<ApiTicket> {
  return apiRequest(`me/tickets/${id}`);
}

export async function apiOpenTicket(ticket: { subject: string; topic: string; message: string }): Promise<ApiTicket> {
  return apiRequest('me/tickets', { method: 'POST', body: ticket });
}

export async function apiReplyTicket(id: string, text: string): Promise<ApiTicket> {
  return apiRequest(`me/tickets/${id}/messages`, { method: 'POST', body: { text } });
}
