import type { ReportReason, ReportTarget } from '../types';
import { apiRequest } from './client';

export type ReportPayload = {
  targetType: ReportTarget;
  targetId: number;
  reason: ReportReason;
  description: string;
};

export async function apiReport(payload: ReportPayload): Promise<void> {
  await apiRequest('reports', {
    method: 'POST',
    body: { ...payload, description: payload.description.trim() || null },
    auth: true,
  });
}
