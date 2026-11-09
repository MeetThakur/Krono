package com.meet11.krono.data.remote

import com.meet11.krono.data.remote.parser.AtCoderContestsParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AtCoderContestsParserTest {

    private val page = """
        <div id="contest-table-upcoming">
          <table><tbody>
            <tr>
              <td class="text-center"><a href='x' target='blank'><time class='fixtime fixtime-full'>2026-11-14 21:00:00+0900</time></a></td>
              <td ><span title="Algorithm">A</span> <a href="/contests/abc484">AtCoder Beginner Contest 484</a></td>
              <td class="text-center">01:40</td>
              <td class="text-center"> - 1999</td>
            </tr>
            <tr>
              <td class="text-center"><a href='x' target='blank'><time class='fixtime fixtime-full'>2026-11-22 21:00:00+0900</time></a></td>
              <td ><a href="/contests/agc080">AtCoder Grand Contest 080</a></td>
              <td class="text-center">02:30</td>
              <td class="text-center">-</td>
            </tr>
          </tbody></table>
        </div>
    """.trimIndent()

    @Test
    fun parsesUpcomingRows() {
        val list = AtCoderContestsParser.parse(page)
        assertEquals(listOf("abc484", "agc080"), list.map { it.id })
        assertEquals("AtCoder Beginner Contest 484", list[0].title)
        assertEquals(6000L, list[0].durationSeconds)
        assertEquals(9000L, list[1].durationSeconds)
        // 2026-11-14 21:00 JST is 12:00 UTC.
        assertEquals(java.time.Instant.parse("2026-11-14T12:00:00Z").toEpochMilli(), list[0].startMillis)
        assertTrue(list[0].isRated)
        assertTrue(!list[1].isRated)
    }

    @Test
    fun emptyPageGivesNoContests() {
        assertTrue(AtCoderContestsParser.parse("<html></html>").isEmpty())
    }
}
