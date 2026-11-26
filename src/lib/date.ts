const MS_PER_DAY = 1000 * 60 * 60 * 24;
const ISO_DATE_PREFIX = /^(\d{4})-(\d{2})-(\d{2})$/;

function parseUTCDateMs(dateISO: string): number | null {
  const normalized = dateISO.trim().slice(0, 10);
  const match = ISO_DATE_PREFIX.exec(normalized);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utcMs = Date.UTC(year, month - 1, day);
  const check = new Date(utcMs);

  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    return null;
  }

  return utcMs;
}

/** Returns today's date in UTC as YYYY-MM-DD so SSR and client agree across timezones. */
export function getTodayUTCISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns a UTC date offset by `daysFromToday` in YYYY-MM-DD format. */
export function getFutureUTCDateISO(daysFromToday: number): string {
  const todayMs = parseUTCDateMs(getTodayUTCISO()) ?? Date.now();
  return new Date(todayMs + daysFromToday * MS_PER_DAY)
    .toISOString()
    .slice(0, 10);
}

/**
 * Returns whole days remaining until `examDateISO` relative to `referenceDateISO`
 * (defaults to UTC today). Returns NaN when either date string is invalid.
 */
export function getDaysRemaining(
  examDateISO: string,
  referenceDateISO?: string
): number {
  const examMs = parseUTCDateMs(examDateISO);
  const refMs = parseUTCDateMs(referenceDateISO ?? getTodayUTCISO());

  if (examMs === null || refMs === null) {
    return Number.NaN;
  }

  return Math.round((examMs - refMs) / MS_PER_DAY);
}

/** Returns days left clamped to [1, 7] for the Anti-Panic Daily Tracker sprint. */
export function getClampedDaysLeft(
  examDateISO: string,
  referenceDateISO?: string
): number {
  const diffDays = getDaysRemaining(examDateISO, referenceDateISO);
  if (!Number.isFinite(diffDays)) {
    return 3;
  }
  return Math.min(7, Math.max(1, diffDays));
}

/** Formats countdown pill text and urgency state from a subject exam date. */
export function formatCountdownBadge(
  examDateISO: string,
  referenceDateISO?: string
): { label: string; urgent: boolean } {
  const diffDays = getDaysRemaining(examDateISO, referenceDateISO);

  if (!Number.isFinite(diffDays)) {
    return { label: "Soon", urgent: true };
  }
  if (diffDays < 0) {
    return { label: "Done", urgent: false };
  }
  if (diffDays === 0) {
    return { label: "Today", urgent: true };
  }
  return { label: `${diffDays}d left`, urgent: diffDays <= 7 };
}
