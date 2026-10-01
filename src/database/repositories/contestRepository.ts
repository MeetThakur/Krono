import { Contest } from '../../types/contest';
import { dateToTimestamp, timestampToDate } from '../../utils/dateUtils';
import { openDatabase } from '../db';

export const saveContest = async (contest: Contest) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO contests (
      id, externalId, platformId, name, startTime, endTime, durationSeconds, 
      url, isRated, phase, reminderSet, scheduledReminders
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      contest.id,
      contest.externalId,
      contest.platformId,
      contest.name,
      dateToTimestamp(contest.startTime),
      dateToTimestamp(contest.endTime),
      contest.durationSeconds,
      contest.url,
      contest.isRated ? 1 : 0,
      contest.phase,
      contest.reminderSet ? 1 : 0,
      JSON.stringify(contest.scheduledReminders)
    ]
  );
};

export const saveContests = async (contests: Contest[]) => {
  const db = await openDatabase();
  // Using transaction for bulk insert
  await db.withTransactionAsync(async () => {
    for (const contest of contests) {
      await db.runAsync(
        `INSERT INTO contests (
          id, externalId, platformId, name, startTime, endTime, durationSeconds, 
          url, isRated, phase, reminderSet, scheduledReminders
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          externalId = excluded.externalId,
          platformId = excluded.platformId,
          name = excluded.name,
          startTime = excluded.startTime,
          endTime = excluded.endTime,
          durationSeconds = excluded.durationSeconds,
          url = excluded.url,
          isRated = excluded.isRated,
          phase = excluded.phase`,
        [
          contest.id,
          contest.externalId,
          contest.platformId,
          contest.name,
          dateToTimestamp(contest.startTime),
          dateToTimestamp(contest.endTime),
          contest.durationSeconds,
          contest.url,
          contest.isRated ? 1 : 0,
          contest.phase,
          contest.reminderSet ? 1 : 0,
          JSON.stringify(contest.scheduledReminders)
        ]
      );
    }
  });
};

export const getUpcomingContests = async (): Promise<Contest[]> => {
  const db = await openDatabase();
  const now = dateToTimestamp(new Date());
  
  // Fetch contests that haven't ended yet, ordered by start time
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM contests WHERE endTime > ? ORDER BY startTime ASC',
    [now]
  );
  
  return rows
    .map(mapRowToContest)
    .filter(c => {
        const title = c.name.toLowerCase();
        // Global filter to ensure no forecasts or jobs leak through
        return !title.includes('forecast') && !title.includes('job');
    });
};

export const getAllContests = async (): Promise<Contest[]> => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM contests ORDER BY startTime DESC');
  return rows.map(mapRowToContest);
};

const mapRowToContest = (result: any): Contest => ({
  id: result.id,
  externalId: result.externalId,
  platformId: result.platformId,
  name: result.name,
  startTime: timestampToDate(result.startTime),
  endTime: timestampToDate(result.endTime),
  durationSeconds: result.durationSeconds,
  url: result.url,
  isRated: !!result.isRated,
  phase: result.phase,
  reminderSet: !!result.reminderSet,
  scheduledReminders: JSON.parse(result.scheduledReminders || '[]')
});
