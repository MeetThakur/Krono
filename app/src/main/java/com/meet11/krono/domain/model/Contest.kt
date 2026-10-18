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
    val isLive: Boolean
        get() {
            val now = System.currentTimeMillis()
            return now in startTime..endTime
        }

    val isUpcoming: Boolean
        get() = System.currentTimeMillis() < startTime

    val isPast: Boolean
        get() = System.currentTimeMillis() > endTime
}
