const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diff = now.getTime() - new Date(iso).getTime();
  if (diff < MINUTE) return 'agora';
  if (diff < HOUR) return `há ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `há ${Math.floor(diff / HOUR)} h`;
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return days <= 1 ? 'há 1 dia' : `há ${days} dias`;
  }
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return weeks <= 1 ? 'há 1 semana' : `há ${weeks} semanas`;
  }
  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return months <= 1 ? 'há 1 mês' : `há ${months} meses`;
  }
  const years = Math.floor(diff / YEAR);
  return years <= 1 ? 'há 1 ano' : `há ${years} anos`;
}
