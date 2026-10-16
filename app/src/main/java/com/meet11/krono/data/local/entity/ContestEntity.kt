package com.meet11.krono.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "contests")
data class ContestEntity(
    @PrimaryKey
    val id: String,
    val externalId: String? = null,
    val platformId: String,
    val name: String,
    val startTime: Long, // Epoch millis
    val endTime: Long,   // Epoch millis
    val durationSeconds: Long? = null,
    val url: String? = null,
    val isRated: Boolean = true,
    val phase: String = "BEFORE", // "BEFORE", "CODING", "FINISHED"
    val reminderSet: Boolean = false,
    val reminderMinutesBefore: Int = 15
)
