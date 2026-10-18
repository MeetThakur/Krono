import { PlatformId } from './platform';

export type SubmissionVerdict = 'AC' | 'WA' | 'TLE' | 'MLE' | 'RTE' | 'CE' | 'OTHER';

export interface Submission {
  id: string;
  platformId: PlatformId;
  problemName: string;
  problemUrl?: string;
  
  verdict: SubmissionVerdict;
  language: string;
  
  submittedAt: Date;
  
  // Optional details
  timeConsumedMillis?: number;
  memoryConsumedBytes?: number;
}
