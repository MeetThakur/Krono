package com.meet11.krono.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "profiles")
data class ProfileEntity(
    @PrimaryKey
    val id: String, // e.g., "codeforces-tourist"
    val platformId: String,
    val username: String,
    val displayName: String? = null,
    val avatar: String? = null,
    val rating: Int? = null,
    val maxRating: Int? = null,
    val rank: String? = null,
    val problemsSolved: Int = 0,
    val totalSubmissions: Int = 0,
    val totalContests: Int = 0,
    val badges: String? = null,
    val displayOrder: Int = 0,
    val lastUpdated: Long = System.currentTimeMillis(),
    val isStale: Boolean = false
)
