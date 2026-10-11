import { useSyncExternalStore } from 'react';
import type { Report, ReportReason, ReportTarget } from '../types';

let reports: Report[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function submitReport(
  reporterId: string,
  target: ReportTarget,
  targetId: string,
  reason: ReportReason,
  details: string,
): void {
  if (hasReported(reports, reporterId, target, targetId)) return;
  const report: Report = {
    id: `report-${Date.now()}`,
    reporterId,
    target,
    targetId,
    reason,
    details: details.trim(),
    createdAt: new Date().toISOString(),
  };
  reports = [...reports, report];
  emit();
}

export function hasReported(
  list: Report[],
  reporterId: string,
  target: ReportTarget,
  targetId: string,
): boolean {
  return list.some(
    (r) => r.reporterId === reporterId && r.target === target && r.targetId === targetId,
  );
}

export function reportedIds(list: Report[], reporterId: string, target: ReportTarget): string[] {
  return list.filter((r) => r.reporterId === reporterId && r.target === target).map((r) => r.targetId);
}

function getReports(): Report[] {
  return reports;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useReports(): Report[] {
  return useSyncExternalStore(subscribe, getReports, getReports);
}
