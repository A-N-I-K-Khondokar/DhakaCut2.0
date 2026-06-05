/**
 * Formats a number as a currency string (BDT - Bangladeshi Taka).
 */
export const formatCurrency = (amount: number): string => {
  return '৳' + new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formats a duration in minutes into a readable string (e.g., "45m" or "1h 30m").
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 
    ? `${hours} hr ${remainingMinutes} mins` 
    : `${hours} hr${hours > 1 ? 's' : ''}`;
};

/**
 * Formats an ISO date string or Date object into a readable date format.
 * E.g., "2026-06-03" -> "Jun 3, 2026"
 */
export const formatDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return String(dateString);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Returns a readable long date format.
 * E.g., "Wednesday, Jun 3, 2026"
 */
export const formatLongDate = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return String(dateString);
  
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
