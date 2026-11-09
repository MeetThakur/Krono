package com.meet11.krono.data.legacy

import com.meet11.krono.domain.model.Platform
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class LegacyAccountsTest {

    private fun row(
        id: String = "codeforces-tourist",
        platform: String? = "codeforces",
        username: String? = "tourist",
        badges: String? = null,
        problems: Int? = 10,
        updated: Long? = 100L
    ) = LegacyRow(
        id = id, platformId = platform, username = username, displayName = "Gennady", avatar = null,
        rating = 3500, maxRating = 3979, rank = "legendary grandmaster", problemsSolved = problems,
        totalSubmissions = 0, totalContests = 12, badges = badges, lastUpdated = updated
    )

    @Test
    fun mapsAValidRowAndRebuildsTheIdInTheNewScheme() {
        val a = LegacyAccounts.fromRow(row(id = "codeforces:Tourist", username = "Tourist"))!!
        assertEquals(Platform.CODEFORCES, a.platform)
        assertEquals("codeforces-tourist", a.id)
        assertEquals("codeforces:Tourist", a.oldId)
        assertEquals(3500, a.rating)
        assertEquals(12, a.totalContests)
    }

    @Test
    fun dropsUnsupportedPlatformsAndMissingHandles() {
        assertNull(LegacyAccounts.fromRow(row(platform = "geeksforgeeks")))
        assertNull(LegacyAccounts.fromRow(row(platform = "nonsense")))
        assertNull(LegacyAccounts.fromRow(row(platform = null)))
        assertNull(LegacyAccounts.fromRow(row(username = "   ")))
        assertNull(LegacyAccounts.fromRow(row(username = null)))
    }

    @Test
    fun cleansHandlesAndClampsCounts() {
        val a = LegacyAccounts.fromRow(row(username = "  @tourist ", problems = -5, platform = "CodeForces"))!!
        assertEquals("tourist", a.username)
        assertEquals(0, a.problemsSolved)
        assertEquals(Platform.CODEFORCES, a.platform)
    }

    @Test
    fun convertsJsonBadgesToCommaSeparated() {
        assertEquals("a,b", LegacyAccounts.badgesToCsv("""["a","b"]"""))
        assertNull(LegacyAccounts.badgesToCsv("[]"))
        assertNull(LegacyAccounts.badgesToCsv(null))
        assertNull(LegacyAccounts.badgesToCsv("not json"))
        assertEquals("ok", LegacyAccounts.badgesToCsv("""["ok","has,comma"]"""))
    }

    @Test
    fun sameAccountWithDifferentIdSpellingsKeepsTheNewestRow() {
        val older = LegacyAccounts.fromRow(row(id = "codeforces:tourist", updated = 100L))!!
        val newer = LegacyAccounts.fromRow(row(id = "codeforces-tourist", updated = 200L))!!
        val result = LegacyAccounts.dedupe(listOf(older, newer))
        assertEquals(1, result.size)
        assertEquals(200L, result.single().lastUpdated)
    }

    @Test
    fun savedOrderIsRespectedAndUnlistedAccountsGoLast() {
        val a = LegacyAccounts.fromRow(row(id = "a", username = "aa"))!!
        val b = LegacyAccounts.fromRow(row(id = "b", username = "bb"))!!
        val c = LegacyAccounts.fromRow(row(id = "c", username = "cc"))!!
        val order = LegacyAccounts.parseOrder("""["c","a"]""")
        val result = LegacyAccounts.displayOrder(order, listOf(a, b, c))
        assertEquals(mapOf(c.id to 0, a.id to 1, b.id to 2), result)
    }

    @Test
    fun badOrderPayloadMeansNoOrder() {
        assertEquals(emptyList<String>(), LegacyAccounts.parseOrder("oops"))
        assertEquals(emptyList<String>(), LegacyAccounts.parseOrder(null))
        assertNotNull(LegacyAccounts.parseOrder("""["x"]"""))
    }
}
