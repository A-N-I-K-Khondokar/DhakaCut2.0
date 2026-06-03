/**
 * Merges class names into a single string, ignoring falsy values.
 */
export const cn = (...classes: unknown[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Generates a random alphanumeric ID.
 */
export const generateId = (length = 12): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates an array of Date objects starting from today up to `daysCount` days.
 */
export const getUpcomingDates = (daysCount = 14): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  // Reset time to midnight for clean comparison
  today.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < daysCount; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push(nextDate);
  }
  return dates;
};

/**
 * Formats a Date object to YYYY-MM-DD.
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
