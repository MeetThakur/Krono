import { UnifiedProfile } from '../../types/user';
import { dateToTimestamp, timestampToDate } from '../../utils/dateUtils';
import { openDatabase } from '../db';

export const saveRival = async (profile: UnifiedProfile) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO rivals (
      id, platformId, username, displayName, avatar, rating, maxRating, rank, 
      problemsSolved, totalSubmissions, totalContests, badges, lastUpdated, isStale
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.platformId,
      profile.username,
      profile.displayName ?? null,
      profile.avatar ?? null,
      profile.rating ?? null,
      profile.maxRating ?? null,
      profile.rank ?? null,
      profile.problemsSolved,
      profile.totalSubmissions,
      profile.totalContests || 0,
      JSON.stringify(profile.badges),
      dateToTimestamp(profile.lastUpdated),
      profile.isStale ? 1 : 0
    ]
  );
};

export const getAllRivals = async (): Promise<UnifiedProfile[]> => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM rivals');
  
  return rows.map(result => ({
    id: result.id,
    platformId: result.platformId,
    username: result.username,
    displayName: result.displayName || undefined,
    avatar: result.avatar || undefined,
    rating: result.rating,
    maxRating: result.maxRating,
    rank: result.rank || undefined,
    problemsSolved: result.problemsSolved,
    totalSubmissions: result.totalSubmissions,
    totalContests: result.totalContests || 0,
    badges: JSON.parse(result.badges || '[]'),
    lastUpdated: timestampToDate(result.lastUpdated),
    isStale: !!result.isStale
  }));
};

export const deleteRival = async (id: string): Promise<void> => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM rivals WHERE id = ?', [id]);
  });
};

export const deleteAllRivals = async (): Promise<void> => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM rivals');
  });
};
