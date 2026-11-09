package com.meet11.krono.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.meet11.krono.core.theme.ThemePaletteSeed
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.distinctUntilChanged
import androidx.datastore.preferences.core.emptyPreferences
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "krono_preferences")

enum class ThemeMode {
    SYSTEM, LIGHT, DARK
}

data class ThemeSettings(
    val mode: ThemeMode = ThemeMode.SYSTEM,
    val palette: ThemePaletteSeed = ThemePaletteSeed.VOLT,
    val dynamicColor: Boolean = false
)

data class StreakSettings(
    val currentStreak: Int = 0,
    val bestStreak: Int = 0,
    val dailyGoal: Int = 2,
    val dailyHistory: Map<String, Int> = emptyMap(),
    val lastActiveDate: String? = null
)

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val json = Json { ignoreUnknownKeys = true }

    companion object {
        val KEY_THEME_MODE = stringPreferencesKey("theme_mode")
        val KEY_THEME_PALETTE = stringPreferencesKey("theme_palette")
        val KEY_DYNAMIC_COLOR = booleanPreferencesKey("dynamic_color")
        val KEY_ONBOARDING_COMPLETED = booleanPreferencesKey("onboarding_completed")
        val KEY_REMINDER_LEAD_MINUTES = intPreferencesKey("reminder_lead_minutes")

        val KEY_DAILY_GOAL = intPreferencesKey("daily_goal")
        val KEY_CURRENT_STREAK = intPreferencesKey("current_streak")
        val KEY_BEST_STREAK = intPreferencesKey("best_streak")
        val KEY_DAILY_HISTORY = stringPreferencesKey("daily_history_json")
        val KEY_LAST_ACTIVE_DATE = stringPreferencesKey("last_active_date")
        val KEY_LEGACY_IMPORTED = booleanPreferencesKey("legacy_1x_import_done")
    }

    val themeSettings: Flow<ThemeSettings> = context.dataStore.data.catchIo().map { prefs ->
        val modeStr = prefs[KEY_THEME_MODE] ?: ThemeMode.SYSTEM.name
        val mode = runCatching { ThemeMode.valueOf(modeStr) }.getOrDefault(ThemeMode.SYSTEM)
        val paletteStr = prefs[KEY_THEME_PALETTE] ?: ThemePaletteSeed.VOLT.name
        val palette = runCatching { ThemePaletteSeed.valueOf(paletteStr) }.getOrDefault(ThemePaletteSeed.VOLT)
        val dynamicColor = prefs[KEY_DYNAMIC_COLOR] ?: false
        ThemeSettings(mode, palette, dynamicColor)
    }

    val streakSettings: Flow<StreakSettings> = context.dataStore.data.catchIo().map { prefs ->
        val currentStreak = prefs[KEY_CURRENT_STREAK] ?: 0
        val bestStreak = prefs[KEY_BEST_STREAK] ?: 0
        val dailyGoal = prefs[KEY_DAILY_GOAL] ?: 2
        val lastActiveDate = prefs[KEY_LAST_ACTIVE_DATE]
        val historyJson = prefs[KEY_DAILY_HISTORY]
        val dailyHistory: Map<String, Int> = if (!historyJson.isNullOrBlank()) {
            runCatching { json.decodeFromString<Map<String, Int>>(historyJson) }.getOrDefault(emptyMap())
        } else {
            emptyMap()
        }
        StreakSettings(currentStreak, bestStreak, dailyGoal, dailyHistory, lastActiveDate)
    }

    val isOnboardingCompleted: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[KEY_ONBOARDING_COMPLETED] ?: false
    }

    val reminderLeadMinutes: Flow<Int> = context.dataStore.data.catchIo().map { prefs ->
        prefs[KEY_REMINDER_LEAD_MINUTES] ?: 15
    }.distinctUntilChanged()

    /** A corrupted/unreadable prefs file must not crash the app — fall back to defaults. */
    private fun Flow<Preferences>.catchIo(): Flow<Preferences> = catch { e ->
        if (e is java.io.IOException) emit(emptyPreferences()) else throw e
    }

    suspend fun setThemeMode(mode: ThemeMode) {
        context.dataStore.edit { it[KEY_THEME_MODE] = mode.name }
    }

    suspend fun setThemePalette(palette: ThemePaletteSeed) {
        context.dataStore.edit { it[KEY_THEME_PALETTE] = palette.name }
    }

    suspend fun setDynamicColor(enabled: Boolean) {
        context.dataStore.edit { it[KEY_DYNAMIC_COLOR] = enabled }
    }

    suspend fun setOnboardingCompleted(completed: Boolean) {
        context.dataStore.edit { it[KEY_ONBOARDING_COMPLETED] = completed }
    }

    suspend fun setReminderLeadMinutes(minutes: Int) {
        context.dataStore.edit { it[KEY_REMINDER_LEAD_MINUTES] = minutes }
    }

    suspend fun setDailyGoal(goal: Int) {
        context.dataStore.edit { it[KEY_DAILY_GOAL] = goal.coerceAtLeast(1) }
    }

    suspend fun updateStreak(currentStreak: Int, bestStreak: Int, history: Map<String, Int>, lastActiveDate: String?) {
        val historyJson = json.encodeToString(history)
        context.dataStore.edit { prefs ->
            prefs[KEY_CURRENT_STREAK] = currentStreak
            prefs[KEY_BEST_STREAK] = bestStreak
            prefs[KEY_DAILY_HISTORY] = historyJson
            if (lastActiveDate != null) {
                prefs[KEY_LAST_ACTIVE_DATE] = lastActiveDate
            }
        }
    }

    suspend fun isLegacyImportDone(): Boolean =
        context.dataStore.data.catchIo().first()[KEY_LEGACY_IMPORTED] ?: false

    /**
     * Merges streak data recovered from Krono 1.x and flags the import as done, atomically.
     * Never lowers anything: per-day counts and best streak take the larger value, and the goal is
     * only taken from 1.x if the user hasn't set one yet. [legacy] == null just sets the flag.
     * The current streak is derived from history on read, so it isn't stored here.
     */
    suspend fun importLegacyStreak(legacy: com.meet11.krono.data.legacy.LegacyStreak?) {
        context.dataStore.edit { prefs ->
            if (legacy != null) {
                val existing: Map<String, Int> = prefs[KEY_DAILY_HISTORY]
                    ?.let { runCatching { json.decodeFromString<Map<String, Int>>(it) }.getOrNull() }
                    .orEmpty()
                val merged = (existing.keys + legacy.history.keys).associateWith { day ->
                    maxOf(existing[day] ?: 0, legacy.history[day] ?: 0)
                }
                prefs[KEY_DAILY_HISTORY] = json.encodeToString(merged)
                prefs[KEY_BEST_STREAK] = maxOf(prefs[KEY_BEST_STREAK] ?: 0, legacy.bestStreak)
                if (KEY_DAILY_GOAL !in prefs && legacy.dailyGoal != null) {
                    prefs[KEY_DAILY_GOAL] = legacy.dailyGoal
                }
            }
            prefs[KEY_LEGACY_IMPORTED] = true
        }
    }
}
