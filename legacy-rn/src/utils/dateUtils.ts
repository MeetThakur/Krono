import { format, formatDistanceToNow } from 'date-fns';

export const formatContestTime = (date: Date): string => {
  return format(date, 'MMM d, HH:mm');
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const getRelativeTime = (date: Date): string => {
  return formatDistanceToNow(date, { addSuffix: true });
};

// SQLite stores dates as INTEGER (unix timestamp in milliseconds) or TEXT (ISO)
// We'll use INTEGER (timestamps) for easier sorting
export const dateToTimestamp = (date: Date): number => {
  return date.getTime();
};

export const timestampToDate = (timestamp: number): Date => {
  return new Date(timestamp);
};
