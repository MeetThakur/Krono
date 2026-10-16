package com.meet11.krono.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.meet11.krono.data.local.entity.RivalEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RivalDao {
    @Query("SELECT * FROM rivals ORDER BY rating DESC, problemsSolved DESC")
    fun getAllRivals(): Flow<List<RivalEntity>>

    @Query("SELECT * FROM rivals WHERE platformId = :platformId ORDER BY rating DESC, problemsSolved DESC")
    fun getRivalsByPlatform(platformId: String): Flow<List<RivalEntity>>

    @Query("SELECT * FROM rivals WHERE id = :id LIMIT 1")
    suspend fun getRivalById(id: String): RivalEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRival(rival: RivalEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertRivals(rivals: List<RivalEntity>)

    @Query("DELETE FROM rivals WHERE id = :id")
    suspend fun deleteRival(id: String)
}
