package com.meet11.krono.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import com.meet11.krono.data.local.entity.ContestEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface ContestDao {
    @Query("SELECT * FROM contests ORDER BY startTime ASC")
    fun getAllContests(): Flow<List<ContestEntity>>

    @Query("SELECT * FROM contests WHERE endTime > :nowMillis ORDER BY startTime ASC")
    fun getActiveAndUpcomingContests(nowMillis: Long): Flow<List<ContestEntity>>

    @Query("SELECT * FROM contests WHERE platformId = :platformId AND endTime > :nowMillis ORDER BY startTime ASC")
    fun getContestsByPlatform(platformId: String, nowMillis: Long): Flow<List<ContestEntity>>

    @Query("SELECT * FROM contests WHERE id = :id LIMIT 1")
    suspend fun getContestById(id: String): ContestEntity?

    @Query("SELECT * FROM contests WHERE reminderSet = 1 AND startTime > :nowMillis")
    suspend fun getActiveReminders(nowMillis: Long): List<ContestEntity>

    @Query("""
        INSERT INTO contests (id, externalId, platformId, name, startTime, endTime, durationSeconds, url, isRated, phase, reminderSet, reminderMinutesBefore)
        VALUES (:id, :externalId, :platformId, :name, :startTime, :endTime, :durationSeconds, :url, :isRated, :phase, :reminderSet, :reminderMinutesBefore)
        ON CONFLICT(id) DO UPDATE SET
            externalId = excluded.externalId,
            platformId = excluded.platformId,
            name = excluded.name,
            startTime = excluded.startTime,
            endTime = excluded.endTime,
            durationSeconds = excluded.durationSeconds,
            url = excluded.url,
            isRated = excluded.isRated,
            phase = excluded.phase
    """)
    suspend fun upsertPreservingReminder(
        id: String,
        externalId: String?,
        platformId: String,
        name: String,
        startTime: Long,
        endTime: Long,
        durationSeconds: Long?,
        url: String?,
        isRated: Boolean,
        phase: String,
        reminderSet: Boolean = false,
        reminderMinutesBefore: Int = 15
    )

    @Transaction
    suspend fun upsertContestsPreservingReminders(contests: List<ContestEntity>) {
        for (c in contests) {
            upsertPreservingReminder(
                id = c.id,
                externalId = c.externalId,
                platformId = c.platformId,
                name = c.name,
                startTime = c.startTime,
                endTime = c.endTime,
                durationSeconds = c.durationSeconds,
                url = c.url,
                isRated = c.isRated,
                phase = c.phase,
                reminderSet = c.reminderSet,
                reminderMinutesBefore = c.reminderMinutesBefore
            )
        }
    }

    @Query("UPDATE contests SET reminderSet = :reminderSet, reminderMinutesBefore = :minutesBefore WHERE id = :id")
    suspend fun updateReminder(id: String, reminderSet: Boolean, minutesBefore: Int)

    @Query("DELETE FROM contests WHERE endTime < :cutoffMillis AND reminderSet = 0")
    suspend fun deleteOldUnstarredContests(cutoffMillis: Long)
}
