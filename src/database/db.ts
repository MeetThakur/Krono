import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) return dbInstance;
  
  if (!dbPromise) {
    dbPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync('krono.db');
        await initDatabase(db);
        dbInstance = db;
        return db;
      } catch (error) {
        console.error('Failed to open database:', error);
        dbPromise = null; // Allow retrying if it fails
        throw error;
      }
    })();
  }
  
  return dbPromise;
};

const initDatabase = async (database: SQLite.SQLiteDatabase) => {
  try {
    // Execute statements separately to avoid issues
    await database.execAsync('PRAGMA journal_mode = WAL;');
    await database.execAsync('PRAGMA busy_timeout = 5000;'); // Wait up to 5s for lock
    
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        platformId TEXT NOT NULL,
        username TEXT NOT NULL,
        displayName TEXT,
        avatar TEXT,
        rating INTEGER,
        maxRating INTEGER,
        rank TEXT,
        problemsSolved INTEGER DEFAULT 0,
        totalSubmissions INTEGER DEFAULT 0,
        totalContests INTEGER DEFAULT 0,
        badges TEXT,
        lastUpdated INTEGER,
        isStale INTEGER DEFAULT 0
      );
    `);

    // Migration for adding totalContests to existing tables
    try {
      await database.execAsync('ALTER TABLE profiles ADD COLUMN totalContests INTEGER DEFAULT 0;');
    } catch (e) {
      // Column likely already exists
    }

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS rivals (
        id TEXT PRIMARY KEY,
        platformId TEXT NOT NULL,
        username TEXT NOT NULL,
        displayName TEXT,
        avatar TEXT,
        rating INTEGER,
        maxRating INTEGER,
        rank TEXT,
        problemsSolved INTEGER DEFAULT 0,
        totalSubmissions INTEGER DEFAULT 0,
        totalContests INTEGER DEFAULT 0,
        badges TEXT,
        lastUpdated INTEGER,
        isStale INTEGER DEFAULT 0
      );
    `);

    // Migration for adding totalContests to rivals
    try {
      await database.execAsync('ALTER TABLE rivals ADD COLUMN totalContests INTEGER DEFAULT 0;');
    } catch (e) {
      // Column likely already exists
    }

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS contests (
        id TEXT PRIMARY KEY,
        externalId TEXT,
        platformId TEXT NOT NULL,
        name TEXT NOT NULL,
        startTime INTEGER NOT NULL,
        endTime INTEGER NOT NULL,
        durationSeconds INTEGER,
        url TEXT,
        isRated INTEGER DEFAULT 0,
        phase TEXT,
        reminderSet INTEGER DEFAULT 0,
        scheduledReminders TEXT
      );
    `);

    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    throw error;
  }
};

