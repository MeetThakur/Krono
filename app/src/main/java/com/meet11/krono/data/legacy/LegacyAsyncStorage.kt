package com.meet11.krono.data.legacy

import android.content.Context
import android.database.sqlite.SQLiteDatabase

/**
 * Reads values written by Krono 1.x through React Native's AsyncStorage. On Android that is a SQLite
 * file `databases/RKStorage` with a `catalystLocalStorage(key, value)` table. The file only exists
 * when 2.0 was installed over 1.x.
 */
object LegacyAsyncStorage {
    private const val DB_NAME = "RKStorage"

    /** Null when there's no 1.x storage file or no such key. Throws on genuine read errors. */
    fun get(context: Context, key: String): String? {
        val file = context.getDatabasePath(DB_NAME)
        if (!file.exists()) return null
        SQLiteDatabase.openDatabase(file.path, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            db.rawQuery("SELECT value FROM catalystLocalStorage WHERE key = ?", arrayOf(key)).use { c ->
                return if (c.moveToFirst()) c.getString(0) else null
            }
        }
    }
}
