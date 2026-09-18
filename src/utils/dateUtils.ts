/**
 * Utilidades de fecha libres de desfase de zona horaria (UTC vs Local)
 */

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isValidDateFormat(dateStr?: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const match = dateStr.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  return year >= 2000 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

export function normalizeDateInput(rawDate?: string | null, fallbackDate: string = getLocalDateString()): string {
  if (!rawDate || typeof rawDate !== 'string') return fallbackDate;
  const clean = rawDate.trim();

  if (isValidDateFormat(clean)) return clean;

  const dmyMatch = clean.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    const candidate = `${year}-${month}-${day}`;
    if (isValidDateFormat(candidate)) return candidate;
  }

  if (clean.includes('T')) {
    const isoDatePart = clean.split('T')[0];
    if (isValidDateFormat(isoDatePart)) return isoDatePart;
  }

  return fallbackDate;
}
