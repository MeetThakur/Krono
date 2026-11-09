package com.meet11.krono.data.remote.parser

data class AtCoderPageContest(
    val id: String,
    val title: String,
    val startMillis: Long,
    val durationSeconds: Long,
    val isRated: Boolean
)

/**
 * Parses the Active and Upcoming tables of https://atcoder.jp/contests/. The community
 * API only lists contests that have already started, so this page is the only source for
 * upcoming rounds.
 */
object AtCoderContestsParser {
    private val ROW = Regex("<tr>(.*?)</tr>", RegexOption.DOT_MATCHES_ALL)
    private val TIME = Regex("""<time class='fixtime fixtime-full'>([^<]+)</time>""")
    private val LINK = Regex("""<a href="/contests/([^"/]+)">([^<]+)</a>""")
    private val CELLS = Regex("""<td class="text-center">\s*([^<]*?)\s*</td>""")
    private val FORMAT = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ssZ")

    fun parse(html: String): List<AtCoderPageContest> {
        val sections = listOf("contest-table-action", "contest-table-upcoming")
        return sections.flatMap { sectionId ->
            val start = html.indexOf("id=\"$sectionId\"")
            if (start < 0) return@flatMap emptyList()
            val end = html.indexOf("</table>", start).let { if (it < 0) html.length else it }
            ROW.findAll(html.substring(start, end)).mapNotNull { row ->
                val body = row.groupValues[1]
                val time = TIME.find(body)?.groupValues?.get(1)?.trim() ?: return@mapNotNull null
                val link = LINK.find(body) ?: return@mapNotNull null
                val startMs = runCatching { java.time.OffsetDateTime.parse(time, FORMAT).toInstant().toEpochMilli() }
                    .getOrNull() ?: return@mapNotNull null
                val cells = CELLS.findAll(body).map { it.groupValues[1] }.toList()
                val duration = cells.firstOrNull { Regex("""\d+:\d{2}""").matches(it) }
                    ?.split(":")?.let { it[0].toLong() * 3600 + it[1].toLong() * 60 }
                    ?: return@mapNotNull null
                val rated = cells.lastOrNull()?.let { it != "-" && it.isNotBlank() } ?: false
                AtCoderPageContest(link.groupValues[1], link.groupValues[2].trim(), startMs, duration, rated)
            }.toList()
        }.distinctBy { it.id }
    }
}
