import { PlatformId } from './platform';

export type ContestPhase = 'upcoming' | 'running' | 'finished';

export interface ReminderTime {
  minutesBefore: number; // e.g., 1440 (1 day), 60 (1 hour), 15
  notificationId?: string; // ID of the scheduled notification
}

export interface Contest {
  id: string; // internal unique id
  externalId: string; // Platform specific id
  platformId: PlatformId;
  name: string;
  
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  
  url: string;
  isRated: boolean;
  phase: ContestPhase;
  
  // User specific
  reminderSet: boolean;
  scheduledReminders: ReminderTime[];
}
