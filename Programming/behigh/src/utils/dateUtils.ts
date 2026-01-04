import { format, isToday, differenceInMinutes, startOfDay, endOfDay } from 'date-fns';

export const formatPostTime = (date: Date | string): string => {
  const postDate = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(postDate)) {
    return format(postDate, 'h:mm a');
  }
  return format(postDate, 'MMM d, h:mm a');
};

export const isPostedLate = (momentTime: Date, postTime: Date): boolean => {
  const diff = differenceInMinutes(postTime, momentTime);
  return diff > 2; // Posted more than 2 minutes after notification
};

export const getTodayDateString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const getTodayStart = (): Date => {
  return startOfDay(new Date());
};

export const getTodayEnd = (): Date => {
  return endOfDay(new Date());
};

export const getTimeUntilExpiry = (momentTime: Date): number => {
  const expiryTime = new Date(momentTime.getTime() + 2 * 60 * 1000); // 2 minutes
  const now = new Date();
  const secondsLeft = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / 1000));
  return secondsLeft;
};

export const formatTimer = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

