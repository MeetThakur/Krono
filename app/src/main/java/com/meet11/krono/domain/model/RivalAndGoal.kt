package com.meet11.krono.domain.model

data class Rival(
    val id: String,
    val platform: Platform,
    val username: String,
    val displayName: String? = null,
    val avatar: String? = null,
    val rating: Int? = null,
    val maxRating: Int? = null,
    val rank: String? = null,
    val problemsSolved: Int = 0,
    val totalSubmissions: Int = 0,
    val totalContests: Int = 0,
    val badges: List<String> = emptyList(),
    val lastUpdated: Long = System.currentTimeMillis(),
    val isStale: Boolean = false
)

data class DailyGoal(
    val currentStreak: Int,
    val bestStreak: Int,
    val targetProblems: Int,
    val solvedToday: Int,
    val isCompleted: Boolean,
    val progressRatio: Float
)
