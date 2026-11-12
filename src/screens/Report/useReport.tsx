import { useRef, useState, type ReactNode } from 'react';
import { ReportSheet } from '../../components';
import { apiReport } from '../../api';
import type { ReportTarget } from '../../types';
import { queryClient, refreshReviewLists } from '../../queries/client';
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
    if (finished && sentRef.current) {
      refreshReviewLists();
      void queryClient.invalidateQueries({ queryKey: ['comments'] });
      onReported?.(finished.target, finished.id);
    }
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
        onSubmit={async (reason, details) => {
          if (!pending) return;
          await apiReport({ targetType: pending.target, targetId: Number(pending.id), reason, description: details });
          sentRef.current = true;
        }}
      />
    ),
  };
}
