package com.meet11.krono.data.legacy

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class LegacyStreakParserTest {

    // Shape produced by zustand persist + createJSONStorage(AsyncStorage) in Krono 1.6.5.
    private val realisticPayload = """
        {"state":{"currentStreak":4,"bestStreak":11,"dailyGoal":3,
        "dailyHistory":{"2026-10-01":2,"2026-10-02":1,"2026-10-03":5},
        "baselineProblemsSolved":{"leetcode-x":1000},"lastActiveDate":"2026-10-03","isLoading":false},"version":0}
    """.trimIndent()

    @Test
    fun parsesRealisticPayload() {
        val result = LegacyStreakParser.parse(realisticPayload)
        assertNotNull(result)
        assertEquals(11, result!!.bestStreak)
        assertEquals(3, result.dailyGoal)
        assertEquals(mapOf("2026-10-01" to 2, "2026-10-02" to 1, "2026-10-03" to 5), result.history)
    }

    @Test
    fun dropsMalformedDatesAndNonPositiveCounts() {
        val raw = """{"state":{"bestStreak":2,"dailyHistory":{"2026-10-01":1,"yesterday":4,"2026-13-45":2,"2026-10-02":0,"2026-10-03":-3}}}"""
        assertEquals(mapOf("2026-10-01" to 1), LegacyStreakParser.parse(raw)!!.history)
    }

    @Test
    fun clampsAbsurdValues() {
        val raw = """{"state":{"bestStreak":999999,"dailyGoal":5000,"dailyHistory":{"2026-10-01":100000}}}"""
        val result = LegacyStreakParser.parse(raw)!!
        assertEquals(10_000, result.bestStreak)
        assertNull(result.dailyGoal)
        assertEquals(999, result.history["2026-10-01"])
    }

    @Test
    fun missingOptionalFieldsUseDefaults() {
        val result = LegacyStreakParser.parse("""{"state":{}}""")!!
        assertEquals(0, result.bestStreak)
        assertNull(result.dailyGoal)
        assertEquals(emptyMap<String, Int>(), result.history)
    }

    @Test
    fun rejectsGarbage() {
        assertNull(LegacyStreakParser.parse("not json"))
        assertNull(LegacyStreakParser.parse("""{"version":0}"""))
        assertNull(LegacyStreakParser.parse(""))
    }
}
