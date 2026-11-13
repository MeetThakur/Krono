package com.meet11.krono.worker

import org.junit.Assert.*
import org.junit.Test

class ReminderTimingTest {
    private val now = 1_800_000_000_000L

    @Test fun `future lead time is respected`() {
        assertEquals(now + 45 * 60_000L, ReminderTiming.triggerAt(now + 60 * 60_000L, 15, now))
    }

    @Test fun `increasing lead beyond time remaining still schedules immediately`() {
        assertEquals(now + 1000L, ReminderTiming.triggerAt(now + 5 * 60_000L, 60, now))
    }

    @Test fun `started contests cannot schedule a misleading reminder`() {
        assertNull(ReminderTiming.triggerAt(now, 15, now))
        assertNull(ReminderTiming.triggerAt(now - 1, 15, now))
    }

    @Test fun `immediate trigger never passes contest start`() {
        assertEquals(now + 500L, ReminderTiming.triggerAt(now + 500L, 15, now))
    }

    @Test fun `out of range preferences are bounded`() {
        assertEquals(now + 59 * 60_000L, ReminderTiming.triggerAt(now + 60 * 60_000L, -1, now))
    }
}
