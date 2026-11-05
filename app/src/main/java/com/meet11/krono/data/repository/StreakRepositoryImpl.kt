package com.meet11.krono.data.repository

import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.repository.StreakRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StreakRepositoryImpl @Inject constructor(
    private val preferencesManager: PreferencesManager
) : StreakRepository {

    // java.time formatters are immutable/thread-safe (SimpleDateFormat in a singleton was not).
    private val keyFormat = DateTimeFormatter.ISO_LOCAL_DATE
    private val writeLock = Mutex()

    private fun keyOf(date: LocalDate): String = keyFormat.format(date)

    override fun getDailyGoal(): Flow<DailyGoal> {
        return preferencesManager.streakSettings.map { settings ->
            val today = LocalDate.now()
            val solvedToday = settings.dailyHistory[keyOf(today)] ?: 0
            val target = settings.dailyGoal.coerceAtLeast(1)
            // Derive the streak from history on every read so a missed day breaks it
            // immediately, instead of showing the value cached at the last solve.
            val current = computeStreak(settings.dailyHistory, today)
            DailyGoal(
                currentStreak = current,
                bestStreak = maxOf(settings.bestStreak, current),
                targetProblems = target,
                solvedToday = solvedToday,
                isCompleted = solvedToday >= target,
                progressRatio = (solvedToday.toFloat() / target).coerceIn(0f, 1f)
            )
        }.distinctUntilChanged()
    }

    override suspend fun recordManualSolve(dateKey: String?) = adjustToday(dateKey, +1)

    override suspend fun undoManualSolve() = adjustToday(null, -1)

    private suspend fun adjustToday(dateKey: String?, delta: Int) = writeLock.withLock {
        val key = dateKey ?: keyOf(LocalDate.now())
        val settings = preferencesManager.streakSettings.first()
        val history = settings.dailyHistory.toMutableMap()
        val next = ((history[key] ?: 0) + delta).coerceAtLeast(0)
        if (next == 0) history.remove(key) else history[key] = next

        // Prune entries older than a year so the JSON blob doesn't grow forever.
        val cutoff = keyOf(LocalDate.now().minusDays(400))
        history.keys.removeAll { it < cutoff }

        val streak = computeStreak(history, LocalDate.now())
        val best = if (delta > 0) maxOf(settings.bestStreak, streak) else settings.bestStreak
        preferencesManager.updateStreak(streak, best, history, key)
    }

    override suspend fun setDailyGoalTarget(target: Int) {
        preferencesManager.setDailyGoal(target.coerceIn(1, 999))
    }

    override suspend fun syncStreakWithProfiles(profiles: List<Profile>) = writeLock.withLock {
        val settings = preferencesManager.streakSettings.first()
        val streak = computeStreak(settings.dailyHistory, LocalDate.now())
        preferencesManager.updateStreak(streak, maxOf(settings.bestStreak, streak), settings.dailyHistory, settings.lastActiveDate)
    }

    /** Consecutive active days ending today — or yesterday, as a grace window before today's solve. */
    private fun computeStreak(history: Map<String, Int>, today: LocalDate): Int {
        var day = if ((history[keyOf(today)] ?: 0) > 0) today else today.minusDays(1)
        var streak = 0
        while ((history[keyOf(day)] ?: 0) > 0) {
            streak++
            day = day.minusDays(1)
        }
        return streak
    }
}
