import { useRef, useState, type ReactNode } from 'react';
import { ReportSheet } from '../../components';
import type { ReportTarget } from '../../types';
import { submitReport } from '../../store/reports';
import { useCurrentUser } from '../../store/session';

type Pending = { target: ReportTarget; id: string };

const TITLE: Record<ReportTarget, string> = {
  review: 'Denunciar avaliação',
  comment: 'Denunciar comentário',
};

export type ReportFlow = {
  open: (target: ReportTarget, id: string) => void;
  canReport: (authorId: string) => boolean;
  sheet: ReactNode;
};

export function useReport(onReported?: (target: ReportTarget, id: string) => void): ReportFlow {
  const me = useCurrentUser();
  const [pending, setPending] = useState<Pending | null>(null);
  const sentRef = useRef(false);

  const close = () => {
    const finished = pending;
    setPending(null);
    if (finished && sentRef.current) onReported?.(finished.target, finished.id);
    sentRef.current = false;
  };

  return {
    open: (target, id) => {
      sentRef.current = false;
      setPending({ target, id });
    },
    canReport: (authorId) => authorId !== me.id,
    sheet: (
      <ReportSheet
        visible={pending !== null}
        title={pending ? TITLE[pending.target] : ''}
        onClose={close}
        onSubmit={(reason, details) => {
          if (!pending) return;
          submitReport(me.id, pending.target, pending.id, reason, details);
          sentRef.current = true;
        }}
      />
    ),
  };
}
