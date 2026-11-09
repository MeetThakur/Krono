package com.meet11.krono.worker

import android.content.Context

/** Persistence for [FiredReminderLedger]; a SharedPreferences-backed one is used in the app. */
interface LedgerStore {
    fun all(): Map<String, Long>
    fun apply(put: Map<String, Long>, remove: Set<String>)
}

/**
 * Remembers which contest starts have already been reminded, so a reminder is shown at most once
 * per contest. Guards against duplicate deliveries (an exact and an inexact alarm both pending,
 * re-arming on reboot, OS redelivery). Keyed on contest id *and* start time, so a contest that gets
 * rescheduled to a new time can still remind again.
 */
class FiredReminderLedger(
    private val store: LedgerStore,
    private val clock: () -> Long = System::currentTimeMillis
) {
    fun hasFired(contestId: String, startTime: Long): Boolean = key(contestId, startTime) in store.all()

    fun markFired(contestId: String, startTime: Long) {
        val now = clock()
        val stale = store.all().filterValues { now - it > TTL_MS }.keys
        store.apply(put = mapOf(key(contestId, startTime) to now), remove = stale)
    }

    private fun key(contestId: String, startTime: Long) = "$contestId@$startTime"

    companion object {
        const val TTL_MS = 7L * 24 * 60 * 60 * 1000
        private const val PREFS = "fired_reminders"

        fun forContext(context: Context): FiredReminderLedger {
            val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
            return FiredReminderLedger(object : LedgerStore {
                override fun all(): Map<String, Long> =
                    prefs.all.mapNotNull { (k, v) -> (v as? Long)?.let { k to it } }.toMap()

                override fun apply(put: Map<String, Long>, remove: Set<String>) {
                    prefs.edit().apply {
                        remove.forEach { remove(it) }
                        put.forEach { (k, v) -> putLong(k, v) }
                    }.apply()
                }
            })
        }
    }
}
