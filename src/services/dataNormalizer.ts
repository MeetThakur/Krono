import { Contest, ContestPhase } from '../types/contest';
import { Submission, SubmissionVerdict } from '../types/submission';
import { UnifiedProfile } from '../types/user';

export const normalizeCodeforcesProfile = (
  userInfo: any, 
  ratingHistory: any[], 
  submissions: any[]
): UnifiedProfile => {
  const user = userInfo[0]; // Codeforces API returns an array
  
  // Calculate problems solved (unique accepted problems)
  const solvedProblems = new Set();
  submissions.forEach(sub => {
    if (sub.verdict === 'OK') {
      solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
    }
  });

  return {
    id: `codeforces:${user.handle}`,
    platformId: 'codeforces',
    username: user.handle,
    displayName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.handle,
    avatar: user.avatar,
    
    rating: user.rating || 0,
    maxRating: user.maxRating || 0,
    rank: user.rank,
    
    problemsSolved: solvedProblems.size,
    totalSubmissions: submissions.length,
    totalContests: ratingHistory.length,
    
    badges: [], // Codeforces doesn't have badges in API
    
    lastUpdated: new Date(),
    isStale: false
  };
};

export const normalizeCodeforcesContest = (cfContest: any): Contest => {
  const startTime = new Date(cfContest.startTimeSeconds * 1000);
  const duration = cfContest.durationSeconds;
  const endTime = new Date(startTime.getTime() + duration * 1000);
  const now = new Date();

  let phase: ContestPhase = 'upcoming';
  if (cfContest.phase === 'FINISHED') phase = 'finished';
  else if (cfContest.phase === 'CODING') phase = 'running';

  return {
    id: `codeforces:${cfContest.id}`,
    externalId: cfContest.id.toString(),
    platformId: 'codeforces',
    name: cfContest.name,
    startTime,
    endTime,
    durationSeconds: duration,
    url: `https://codeforces.com/contest/${cfContest.id}`,
    isRated: true, // Most CF contests are rated, simplifying assumption
    phase,
    reminderSet: false,
    scheduledReminders: []
  };
};

export const normalizeCodeforcesSubmission = (submission: any): Submission => {
  let verdict: SubmissionVerdict = 'OTHER';
  switch (submission.verdict) {
    case 'OK': verdict = 'AC'; break;
    case 'WRONG_ANSWER': verdict = 'WA'; break;
    case 'TIME_LIMIT_EXCEEDED': verdict = 'TLE'; break;
    case 'MEMORY_LIMIT_EXCEEDED': verdict = 'MLE'; break;
    case 'RUNTIME_ERROR': verdict = 'RTE'; break;
    case 'COMPILATION_ERROR': verdict = 'CE'; break;
  }

  return {
    id: `codeforces:${submission.id}`,
    platformId: 'codeforces',
    problemName: `${submission.problem.index} - ${submission.problem.name}`,
    problemUrl: `https://codeforces.com/contest/${submission.contestId}/problem/${submission.problem.index}`,
    verdict,
    language: submission.programmingLanguage,
    submittedAt: new Date(submission.creationTimeSeconds * 1000),
    timeConsumedMillis: submission.timeConsumedMillis,
    memoryConsumedBytes: submission.memoryConsumedBytes,
  };
};

// ==================== LEETCODE NORMALIZERS ====================

export const normalizeLeetCodeProfile = (
  userData: any,
  contestData: any
): UnifiedProfile => {
  // Calculate total problems solved from acSubmissionNum
  const acStats = userData?.submitStats?.acSubmissionNum || [];
  const totalSolved = acStats.find((s: any) => s.difficulty === 'All')?.count || 0;
  
  // Get total submissions
  const totalStats = userData?.submitStats?.totalSubmissionNum || [];
  const totalSubmissions = totalStats.find((s: any) => s.difficulty === 'All')?.count || 0;

  // Contest rating info
  const contestRating = contestData?.ranking?.rating || 0;
  const globalRanking = contestData?.ranking?.globalRanking;

  return {
    id: `leetcode:${userData.username}`,
    platformId: 'leetcode',
    username: userData.username,
    displayName: userData.profile?.realName || userData.username,
    avatar: userData.profile?.userAvatar,
    
    rating: Math.round(contestRating),
    maxRating: Math.round(contestRating), // LeetCode doesn't expose max rating easily
    rank: globalRanking ? `#${globalRanking}` : undefined,
    
    problemsSolved: totalSolved,
    totalSubmissions: totalSubmissions,
    totalContests: contestData?.ranking?.attendedContestsCount || 0,
    
    badges: [], // Could parse from profile if needed
    
    lastUpdated: new Date(),
    isStale: false
  };
};

export const normalizeLeetCodeContest = (lcContest: any): Contest => {
  const startTime = new Date(lcContest.startTime * 1000);
  const durationSeconds = lcContest.duration;
  const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
  const now = new Date();

  let phase: ContestPhase = 'upcoming';
  if (now > endTime) phase = 'finished';
  else if (now >= startTime && now <= endTime) phase = 'running';

  return {
    id: `leetcode:${lcContest.titleSlug}`,
    externalId: lcContest.titleSlug,
    platformId: 'leetcode',
    name: lcContest.title,
    startTime,
    endTime,
    durationSeconds,
    url: `https://leetcode.com/contest/${lcContest.titleSlug}`,
    isRated: true,
    phase,
    reminderSet: false,
    scheduledReminders: []
  };
};

// ==================== CODECHEF NORMALIZERS ====================

export const normalizeCodeChefProfile = (userData: any): UnifiedProfile => {
  return {
    id: `codechef:${userData.handle}`,
    platformId: 'codechef',
    username: userData.handle,
    displayName: userData.name || userData.handle,
    avatar: userData.avatar,
    
    rating: userData.rating,
    maxRating: userData.maxRating,
    rank: userData.rank, // Removed hardcoded '#' as rank is now "3 Star"
    
    problemsSolved: userData.problemsSolved,
    // Since we scrape, we might not have total submissions, use solved count as fallback or 0
    totalSubmissions: userData.problemsSolved, 
    totalContests: userData.totalContests || 0,
    
    badges: [],
    
    lastUpdated: new Date(),
    isStale: false
  };
};

export const normalizeCodeChefContest = (ccContest: any): Contest => {
  // ccContest.contest_start_date_iso is "2026-01-05T18:00:00+05:30"
  // ccContest.contest_end_date_iso is "2026-01-05T21:00:00+05:30"
  const startTime = new Date(ccContest.contest_start_date_iso);
  const endTime = new Date(ccContest.contest_end_date_iso);
  
  // duration is in minutes in the JSON string "180", convert to seconds
  const durationSeconds = parseInt(ccContest.contest_duration, 10) * 60;
  const now = new Date();

  let phase: ContestPhase = 'upcoming';
  if (now > endTime) phase = 'finished';
  else if (now >= startTime && now <= endTime) phase = 'running';

  return {
    id: `codechef:${ccContest.contest_code}`,
    externalId: ccContest.contest_code,
    platformId: 'codechef',
    name: ccContest.contest_name,
    startTime,
    endTime,
    durationSeconds,
    url: `https://www.codechef.com/${ccContest.contest_code}`,
    isRated: true, // Internal API implies distinct users > 0 usually rated, assuming true
    phase,
    reminderSet: false,
    scheduledReminders: []
  };
};

// ==================== ATCODER NORMALIZERS ====================

export const normalizeAtCoderProfile = (userData: any): UnifiedProfile => {
  const rating = userData.rating || 0;
  // Use scraped rank if available, otherwise default to Unrated/Calculated
  let rankTitle = userData.rank || 'Unrated';

  // Only calculate if NO scraped rank gave us a value
  if (!userData.rank && rating > 0) {
      if (rating >= 3200) rankTitle = '7 Dan+';
      else if (rating >= 2800) rankTitle = '5-6 Dan';
      else if (rating >= 2600) rankTitle = '4 Dan'; // Inferred from image gap
      else if (rating >= 2400) rankTitle = '3 Dan';
      else if (rating >= 2200) rankTitle = '2 Dan';
      else if (rating >= 2000) rankTitle = '1 Dan';
      else if (rating >= 1800) rankTitle = '1 Kyu';
      else if (rating >= 1600) rankTitle = '2 Kyu';
      else if (rating >= 1400) rankTitle = '3 Kyu';
      else if (rating >= 1200) rankTitle = '4 Kyu';
      else if (rating >= 1000) rankTitle = '5 Kyu';
      else if (rating >= 800) rankTitle = '6 Kyu';
      else if (rating >= 600) rankTitle = '7 Kyu';
      else if (rating >= 400) rankTitle = '8 Kyu';
      else rankTitle = '9 Kyu';
  }

  return {
    id: `atcoder:${userData.handle}`,
    platformId: 'atcoder',
    username: userData.handle,
    displayName: userData.handle,
    avatar: userData.avatar,
    
    rating: rating,
    maxRating: userData.maxRating,
    rank: rankTitle,
    
    problemsSolved: userData.problemsSolved,
    totalSubmissions: 0,
    totalContests: userData.totalContests || 0,
    
    badges: [],
    
    lastUpdated: new Date(),
    isStale: false
  };
};

export const normalizeAtCoderContest = (acContest: any): Contest => {
  const startTime = new Date(acContest.start_epoch_second * 1000);
  const durationSeconds = acContest.duration_second;
  const endTime = new Date(startTime.getTime() + durationSeconds * 1000);
  const now = new Date();

  let phase: ContestPhase = 'upcoming';
  if (now > endTime) phase = 'finished';
  else if (now >= startTime && now <= endTime) phase = 'running';

  return {
    id: `atcoder:${acContest.id}`,
    externalId: acContest.id,
    platformId: 'atcoder',
    name: acContest.title,
    startTime,
    endTime,
    durationSeconds,
    url: `https://atcoder.jp/contests/${acContest.id}`,
    isRated: acContest.rate_change !== '-', // heuristic based on rate_change field
    phase,
    reminderSet: false,
    scheduledReminders: []
  };
};
