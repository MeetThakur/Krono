package com.meet11.krono.domain.model

enum class ContestPhase {
    BEFORE, CODING, FINISHED
}

data class Contest(
    val id: String,
    val externalId: String? = null,
    val platform: Platform,
    val name: String,
    val startTime: Long,
    val endTime: Long,
    val durationSeconds: Long? = null,
    val url: String? = null,
    val isRated: Boolean = true,
    val phase: ContestPhase = ContestPhase.BEFORE,
    val reminderSet: Boolean = false,
    val reminderMinutesBefore: Int = 15
) {
    /** End time, falling back to start + duration when the source omitted it. */
    val effectiveEndTime: Long
        get() = if (endTime > 0L) endTime else startTime + (durationSeconds ?: 0L) * 1000L

    val durationMillis: Long
        get() = (effectiveEndTime - startTime).coerceAtLeast(0L)

    /** Time-based only: a stored phase can be stale between syncs, so the clock is the source of truth. */
    fun isLiveAt(now: Long): Boolean = now in startTime..effectiveEndTime

    fun isUpcomingAt(now: Long): Boolean = now < startTime

    fun isFinishedAt(now: Long): Boolean = now > effectiveEndTime
}
