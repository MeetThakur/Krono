package com.meet11.krono.domain.repository

import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.model.RatingPoint
import com.meet11.krono.domain.model.Rival
import kotlinx.coroutines.flow.Flow

interface ContestRepository {
    fun getContests(): Flow<List<Contest>>
    suspend fun syncContests(): Result<Unit>
    /** Persists the reminder and arms/cancels its alarm. Returns false if it's too late to remind. */
    suspend fun setReminder(contestId: String, enable: Boolean): Boolean
    suspend fun getActiveReminders(): List<Contest>
    /** Applies a new lead time to every pending reminder and re-arms the alarms. */
    suspend fun updateReminderLeadTime(minutesBefore: Int)
}

interface ProfileRepository {
    fun getProfiles(): Flow<List<Profile>>
    suspend fun addProfile(platform: Platform, handle: String): Result<Profile>
    suspend fun refreshProfiles(): Result<Unit>
    suspend fun deleteProfile(id: String)
    suspend fun updateProfileOrder(profiles: List<Profile>)
    suspend fun getLeetCodePotd(): Result<Potd?>
    suspend fun getRatingHistory(profile: Profile): Result<List<RatingPoint>?>
}

interface RivalRepository {
    fun getRivals(): Flow<List<Rival>>
    fun getRivalsByPlatform(platform: Platform): Flow<List<Rival>>
    suspend fun addRival(platform: Platform, handle: String): Result<Rival>
    suspend fun deleteRival(id: String)
    suspend fun refreshRivals(): Result<Unit>
}

interface StreakRepository {
    fun getDailyGoal(): Flow<DailyGoal>
    suspend fun recordManualSolve(dateKey: String? = null)
    suspend fun undoManualSolve(dateKey: String? = null)
    suspend fun setDailyGoalTarget(target: Int)
    suspend fun syncStreakWithProfiles(profiles: List<Profile>)
}
