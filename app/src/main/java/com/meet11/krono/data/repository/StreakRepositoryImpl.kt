package com.meet11.krono.data.repository

import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.repository.StreakRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class StreakRepositoryImpl @Inject constructor(
    private val preferencesManager: PreferencesManager
) : StreakRepository {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)

    private fun getTodayKey(): String = dateFormat.format(Date())

    private fun getYesterdayKey(): String {
        val cal = Calendar.getInstance()
        cal.add(Calendar.DAY_OF_YEAR, -1)
        return dateFormat.format(cal.time)
    }

    override fun getDailyGoal(): Flow<DailyGoal> {
        return preferencesManager.streakSettings.map { streakSettings ->
            val todayKey = getTodayKey()
            val solvedToday = streakSettings.dailyHistory[todayKey] ?: 0
            val target = streakSettings.dailyGoal.coerceAtLeast(1)
            val isCompleted = solvedToday >= target
            val ratio = (solvedToday.toFloat() / target.toFloat()).coerceIn(0f, 1f)

            DailyGoal(
                currentStreak = streakSettings.currentStreak,
                bestStreak = streakSettings.bestStreak,
                targetProblems = target,
                solvedToday = solvedToday,
                isCompleted = isCompleted,
                progressRatio = ratio
            )
        }
    }

    override suspend fun recordManualSolve(dateKey: String?) {
        val key = dateKey ?: getTodayKey()
        val settings = preferencesManager.streakSettings.first()
        val mutableHistory = settings.dailyHistory.toMutableMap()
        val currentCount = mutableHistory[key] ?: 0
        mutableHistory[key] = currentCount + 1

        val (currentStreak, bestStreak) = computeStreak(mutableHistory, settings.bestStreak)
        preferencesManager.updateStreak(currentStreak, bestStreak, mutableHistory, key)
    }

    override suspend fun setDailyGoalTarget(target: Int) {
        preferencesManager.setDailyGoal(target)
    }

    override suspend fun syncStreakWithProfiles(profiles: List<Profile>) {
        // Automatically calculate solves from profile deltas or LeetCode activity
        val settings = preferencesManager.streakSettings.first()
        val (currentStreak, bestStreak) = computeStreak(settings.dailyHistory, settings.bestStreak)
        preferencesManager.updateStreak(currentStreak, bestStreak, settings.dailyHistory, settings.lastActiveDate)
    }

    private fun computeStreak(history: Map<String, Int>, prevBest: Int): Pair<Int, Int> {
        val todayStr = getTodayKey()
        val yesterdayStr = getYesterdayKey()

        val todayCount = history[todayStr] ?: 0
        val yesterdayCount = history[yesterdayStr] ?: 0

        // If no activity today and no activity yesterday, streak is broken
        if (todayCount == 0 && yesterdayCount == 0) {
            return Pair(0, prevBest)
        }

        var streak = 0
        val cal = Calendar.getInstance()

        // If today has activity, start checking backwards from today; otherwise start from yesterday
        if (todayCount > 0) {
            streak++
            cal.add(Calendar.DAY_OF_YEAR, -1)
        } else {
            // Grace window: yesterday was active
            cal.add(Calendar.DAY_OF_YEAR, -1)
        }

        while (true) {
            val key = dateFormat.format(cal.time)
            val count = history[key] ?: 0
            if (count > 0) {
                streak++
                cal.add(Calendar.DAY_OF_YEAR, -1)
            } else {
                break
            }
        }

        val bestStreak = maxOf(streak, prevBest)
        return Pair(streak, bestStreak)
    }
}
