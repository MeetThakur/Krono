package com.meet11.krono.worker

/** A lead time that has passed still permits an immediate reminder before a future contest. */
object ReminderTiming {
    fun triggerAt(startTime: Long, minutesBefore: Int, now: Long): Long? {
        if (startTime <= now) return null
        return maxOf(startTime - minutesBefore.coerceIn(1, 60) * 60_000L, now + 1_000L)
            .coerceAtMost(startTime)
    }
}
