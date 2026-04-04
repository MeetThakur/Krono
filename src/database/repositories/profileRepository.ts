import { UnifiedProfile } from '../../types/user';
import { dateToTimestamp, timestampToDate } from '../../utils/dateUtils';
import { openDatabase } from '../db';

export const saveProfile = async (profile: UnifiedProfile) => {
  const db = await openDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO profiles (
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

export const getProfile = async (id: string): Promise<UnifiedProfile | null> => {
  const db = await openDatabase();
  const result = await db.getFirstAsync<any>('SELECT * FROM profiles WHERE id = ?', [id]);
  
  if (!result) return null;
  
  return {
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
  };
};

export const getAllProfiles = async (): Promise<UnifiedProfile[]> => {
  const db = await openDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM profiles');
  
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

export const deleteProfile = async (id: string): Promise<void> => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM profiles WHERE id = ?', [id]);
  });
};

export const deleteAllProfiles = async (): Promise<void> => {
  const db = await openDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM profiles');
  });
};

