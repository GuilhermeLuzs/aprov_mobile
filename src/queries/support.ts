import { useQuery } from '@tanstack/react-query';
import { ApiError, apiMyTickets, apiOpenTicket, apiReplyTicket, apiTicket, type ApiTicket } from '../api';
import { queryClient } from './client';

const SUPPORT_KEY = ['support'] as const;

export const TICKET_TOPICS = [
  { value: 'account', label: 'Conta e acesso' },
  { value: 'coins', label: 'Moedas e pontos' },
  { value: 'coupons', label: 'Cupons' },
  { value: 'review', label: 'Avaliações' },
  { value: 'catalog', label: 'Itens e empresas' },
  { value: 'other', label: 'Outro assunto' },
] as const;

export const TICKET_STATUS_LABEL: Record<ApiTicket['status'], string> = {
  open: 'Com a equipe da APROV',
  waiting: 'Esperando sua resposta',
  resolved: 'Resolvido',
};

export function useMyTickets() {
  return useQuery({ queryKey: [...SUPPORT_KEY, 'list'], queryFn: apiMyTickets });
}

export function useTicket(id: string) {
  return useQuery({ queryKey: [...SUPPORT_KEY, 'ticket', id], queryFn: () => apiTicket(id) });
}

export type SupportResult = { ticket: ApiTicket } | { error: string; errors: Record<string, string> };

async function send(action: () => Promise<ApiTicket>): Promise<SupportResult> {
  try {
    const ticket = await action();
    queryClient.setQueryData([...SUPPORT_KEY, 'ticket', String(ticket.id)], ticket);
    void queryClient.invalidateQueries({ queryKey: [...SUPPORT_KEY, 'list'] });
    return { ticket };
  } catch (error) {
    if (!(error instanceof ApiError)) return { error: 'Não deu para enviar agora. Tente de novo.', errors: {} };
    const errors = Object.fromEntries(Object.entries(error.errors ?? {}).map(([field, list]) => [field, list[0] ?? '']));
    return { error: error.message, errors };
  }
}

export function openTicket(ticket: { subject: string; topic: string; message: string }): Promise<SupportResult> {
  return send(() => apiOpenTicket(ticket));
}

export function replyTicket(id: string, text: string): Promise<SupportResult> {
  return send(() => apiReplyTicket(id, text));
}
