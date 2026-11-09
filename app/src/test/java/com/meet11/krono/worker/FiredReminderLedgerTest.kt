package com.meet11.krono.worker

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class FiredReminderLedgerTest {

    private class MemoryStore : LedgerStore {
        val data = mutableMapOf<String, Long>()
        override fun all(): Map<String, Long> = data.toMap()
        override fun apply(put: Map<String, Long>, remove: Set<String>) {
            remove.forEach { data.remove(it) }
            data.putAll(put)
        }
    }

    private var now = 1_000_000L
    private val store = MemoryStore()
    private val ledger = FiredReminderLedger(store) { now }

    @Test
    fun secondDeliveryOfTheSameReminderIsBlocked() {
        assertFalse(ledger.hasFired("cf_1", 5_000L))
        ledger.markFired("cf_1", 5_000L)
        assertTrue(ledger.hasFired("cf_1", 5_000L))
        assertTrue("a third delivery is blocked too", ledger.hasFired("cf_1", 5_000L))
    }

    @Test
    fun otherContestsAreIndependent() {
        ledger.markFired("cf_1", 5_000L)
        assertFalse(ledger.hasFired("cf_2", 5_000L))
    }

    @Test
    fun aRescheduledContestCanRemindAgain() {
        ledger.markFired("cf_1", 5_000L)
        assertFalse(ledger.hasFired("cf_1", 9_000L))
    }

    @Test
    fun entriesOlderThanAWeekAreForgotten() {
        ledger.markFired("old", 1L)
        now += FiredReminderLedger.TTL_MS + 1
        ledger.markFired("new", 2L)
        assertEquals(setOf("new@2"), store.data.keys)
    }
}
