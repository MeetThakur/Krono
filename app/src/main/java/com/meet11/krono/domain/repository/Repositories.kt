package com.meet11.krono.domain.repository

import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.model.Rival
import kotlinx.coroutines.flow.Flow

interface ContestRepository {
    fun getContests(): Flow<List<Contest>>
    suspend fun syncContests(): Result<Unit>
    suspend fun toggleReminder(contestId: String, enable: Boolean, minutesBefore: Int = 15)
    suspend fun getActiveReminders(): List<Contest>
}

interface ProfileRepository {
    fun getProfiles(): Flow<List<Profile>>
    suspend fun addProfile(platform: Platform, handle: String): Result<Profile>
    suspend fun refreshProfiles(): Result<Unit>
    suspend fun deleteProfile(id: String)
    suspend fun updateProfileOrder(profiles: List<Profile>)
    suspend fun getLeetCodePotd(): Result<Potd?>
}

interface RivalRepository {
    fun getRivals(): Flow<List<Rival>>
    fun getRivalsByPlatform(platform: Platform): Flow<List<Rival>>
    suspend fun addRival(platform: Platform, handle: String): Result<Rival>
    suspend fun deleteRival(id: String)
}

interface StreakRepository {
    fun getDailyGoal(): Flow<DailyGoal>
    suspend fun recordManualSolve(dateKey: String? = null)
    suspend fun setDailyGoalTarget(target: Int)
    suspend fun syncStreakWithProfiles(profiles: List<Profile>)
}
