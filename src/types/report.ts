export type ReportReason = 'offensive' | 'personal_data' | 'spam' | 'false_info' | 'other';

export type ReportTarget = 'review' | 'comment';

export const REPORT_REASONS: ReportReason[] = [
  'offensive',
  'personal_data',
  'spam',
  'false_info',
  'other',
];

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  offensive: 'Ofensa ou discurso de ódio',
  personal_data: 'Dado pessoal de outra pessoa',
  spam: 'Propaganda ou spam',
  false_info: 'Informação falsa',
  other: 'Outro motivo',
};

export interface Report {
  id: string;
  reporterId: string;
  target: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details: string;
  createdAt: string;
}
