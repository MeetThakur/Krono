package com.meet11.krono.data.legacy

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import com.meet11.krono.data.preferences.PreferencesManager
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.time.LocalDate
import javax.inject.Inject
import javax.inject.Singleton

/** Streak data recovered from Krono 1.x (the React Native app). */
data class LegacyStreak(
    val history: Map<String, Int>,
    val bestStreak: Int,
    val dailyGoal: Int?
)

/**
 * Krono 1.x persisted its streak with zustand's `persist` middleware on top of AsyncStorage under the
 * key `krono-streak-storage`. AsyncStorage's Android backend is a SQLite file `RKStorage` with a
 * `catalystLocalStorage(key, value)` table, and zustand wraps the state as `{"state":{…},"version":N}`.
 *
 * That file only exists if 2.0 was installed *over* 1.x (same package and signing key). On a fresh
 * install it's absent and this is a no-op.
 */
object LegacyStreakParser {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true; coerceInputValues = true }

    @Serializable
    private data class Envelope(val state: State? = null)

    @Serializable
    private data class State(
        val bestStreak: Int = 0,
        val dailyGoal: Int? = null,
        val dailyHistory: Map<String, Int> = emptyMap()
    )

    /** Returns null if [raw] isn't a recognisable streak payload. Drops malformed dates and counts. */
    fun parse(raw: String): LegacyStreak? {
        val state = runCatching { json.decodeFromString<Envelope>(raw).state }.getOrNull() ?: return null
        val history = state.dailyHistory.entries
            .mapNotNull { (day, count) ->
                val valid = runCatching { LocalDate.parse(day) }.isSuccess
                if (valid && count > 0) day to count.coerceAtMost(MAX_PER_DAY) else null
            }
            .toMap()
        return LegacyStreak(
            history = history,
            bestStreak = state.bestStreak.coerceIn(0, MAX_STREAK),
            dailyGoal = state.dailyGoal?.takeIf { it in 1..999 }
        )
    }

    private const val MAX_PER_DAY = 999
    private const val MAX_STREAK = 10_000
}

@Singleton
class LegacyStreakImporter @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesManager: PreferencesManager
) {
    private sealed interface Read {
        data object NothingToImport : Read
        data class Found(val data: LegacyStreak) : Read
    }

    /**
     * Runs once. Marked done when there was nothing to import or the import succeeded; a read error
     * (e.g. a transient SQLite failure) leaves it unmarked so the next launch retries instead of
     * silently dropping the user's history.
     */
    suspend fun importIfNeeded() = withContext(Dispatchers.IO) {
        if (preferencesManager.isLegacyImportDone()) return@withContext
        val read = runCatching { readLegacy() }.getOrElse { return@withContext }
        preferencesManager.importLegacyStreak((read as? Read.Found)?.data)
    }

    private fun readLegacy(): Read {
        val file = context.getDatabasePath(LEGACY_DB)
        if (!file.exists()) return Read.NothingToImport
        SQLiteDatabase.openDatabase(file.path, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            db.rawQuery("SELECT value FROM catalystLocalStorage WHERE key = ?", arrayOf(STREAK_KEY)).use { c ->
                if (!c.moveToFirst()) return Read.NothingToImport
                val parsed = LegacyStreakParser.parse(c.getString(0)) ?: return Read.NothingToImport
                return Read.Found(parsed)
            }
        }
    }

    private companion object {
        const val LEGACY_DB = "RKStorage"
        const val STREAK_KEY = "krono-streak-storage"
    }
}
