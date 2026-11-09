package com.meet11.krono.data.remote

import com.meet11.krono.data.remote.parser.CodeChefProfileParser
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class CodeChefHistoryParserTest {

    private val page = """
        <script>jQuery.extend(Drupal.settings, {"date_versus_rating":{"all":[
          {"code":"START1","getyear":"2023","getmonth":"3","getday":"5","rating":"1423","rank":"410","name":"Starters 1 [Rated]","end_date":"2023-03-05 22:00:00","color":"#666"},
          {"code":"START2","getyear":"2023","getmonth":"3","getday":"12","rating":"1511","rank":"120","name":"Starters, \"two\" [Rated]","end_date":"2023-03-12 22:00:00","color":"#666"}
        ],"1":[]},"other":1});</script>
    """.trimIndent()

    @Test
    fun parsesEntriesInOrder() {
        val history = CodeChefProfileParser.parseRatingHistory(page)
        assertEquals(listOf(1423, 1511), history.map { it.rating })
        assertEquals("Starters, \"two\" [Rated]", history[1].contestName)
        assertTrue(history[0].timestampMillis < history[1].timestampMillis)
    }

    @Test
    fun fallsBackToYearMonthDay() {
        val html = """"date_versus_rating":{"all":[{"getyear":"2022","getmonth":"1","getday":"2","rating":"1600","name":"X"}]}"""
        assertEquals(1, CodeChefProfileParser.parseRatingHistory(html).size)
    }

    @Test
    fun missingDataGivesEmptyList() {
        assertTrue(CodeChefProfileParser.parseRatingHistory("<html>nothing here</html>").isEmpty())
        assertTrue(CodeChefProfileParser.parseRatingHistory("\"date_versus_rating\":{\"all\":[{\"rating\":").isEmpty())
    }
}
