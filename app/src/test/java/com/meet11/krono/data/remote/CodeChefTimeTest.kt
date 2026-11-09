package com.meet11.krono.data.remote

import com.meet11.krono.data.remote.parser.CodeChefTime
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.time.Instant

class CodeChefTimeTest {
    @Test
    fun honoursTheOffset() {
        // 20:00 IST is 14:30 UTC.
        assertEquals(Instant.parse("2026-11-11T14:30:00Z").toEpochMilli(), CodeChefTime.parseMillis("2026-11-11T20:00:00+05:30"))
    }

    @Test
    fun offsetlessValuesAreIst() {
        assertEquals(Instant.parse("2026-11-11T14:30:00Z").toEpochMilli(), CodeChefTime.parseMillis("2026-11-11T20:00:00"))
    }

    @Test
    fun blankOrGarbageGivesNull() {
        assertNull(CodeChefTime.parseMillis(null))
        assertNull(CodeChefTime.parseMillis(" "))
        assertNull(CodeChefTime.parseMillis("soon"))
    }
}
