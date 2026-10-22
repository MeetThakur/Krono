package com.meet11.krono.data.remote.parser

data class CodeChefParsedProfile(
    val username: String,
    val displayName: String,
    val avatar: String?,
    val rating: Int?,
    val maxRating: Int?,
    val rank: String?,
    val problemsSolved: Int,
    val totalContests: Int
)

object CodeChefProfileParser {
    private val NAME_REGEX = Regex("""<h1 class="h2-style">\s*([^<]+)\s*</h1>""")
    private val AVATAR_REGEX = Regex("""<img[^>]*class=['"]profileImage['"][^>]*src=['"]([^'"]+)['"]""")
    private val RATING_REGEX = Regex("""<div class="rating-number">\s*(\d+)\s*</div>""")
    private val MAX_RATING_REGEX = Regex("""Highest Rating\s*(\d+)""")
    private val STARS_REGEX = Regex("""<span[^>]*>(\d+&#9733;|\d+★)</span>""")
    private val GLOBAL_RANK_REGEX = Regex("""<a href="/ratings/all">\s*<strong>\s*([^<]+)\s*</strong>\s*</a>\s*Global Rank""")
    private val SOLVED_REGEX = Regex("""Total Problems Solved:\s*(\d+)""")
    private val FULLY_SOLVED_REGEX = Regex("""Fully Solved\s*\((\d+)\)""")
    private val CONTESTS_REGEX = Regex("""Contests\s*\((\d+)\)""")

    fun parse(html: String, handle: String): CodeChefParsedProfile {
        if (!html.contains("user-details-container") && !html.contains("h2-style")) {
            throw IllegalArgumentException("User not found on CodeChef")
        }

        val name = NAME_REGEX.find(html)?.groupValues?.getOrNull(1)?.trim()?.ifBlank { handle } ?: handle
        val avatar = AVATAR_REGEX.find(html)?.groupValues?.getOrNull(1)
        val rating = RATING_REGEX.find(html)?.groupValues?.getOrNull(1)?.toIntOrNull()
        val maxRating = MAX_RATING_REGEX.find(html)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: rating

        var starRank = STARS_REGEX.find(html)?.groupValues?.getOrNull(1)?.replace("&#9733;", "★")
        if (starRank == null && rating != null && rating > 0) {
            starRank = when {
                rating >= 2500 -> "7★"
                rating >= 2200 -> "6★"
                rating >= 2000 -> "5★"
                rating >= 1800 -> "4★"
                rating >= 1600 -> "3★"
                rating >= 1400 -> "2★"
                else -> "1★"
            }
        }

        val globalRankVal = GLOBAL_RANK_REGEX.find(html)?.groupValues?.getOrNull(1)?.trim()
        val rank = when {
            globalRankVal?.all { it.isDigit() } == true -> "#$globalRankVal"
            !globalRankVal.isNullOrBlank() && !globalRankVal.equals("inactive", ignoreCase = true) -> globalRankVal
            else -> starRank
        }

        val solved = SOLVED_REGEX.find(html)?.groupValues?.getOrNull(1)?.toIntOrNull()
            ?: FULLY_SOLVED_REGEX.find(html)?.groupValues?.getOrNull(1)?.toIntOrNull()
            ?: 0

        val contests = CONTESTS_REGEX.find(html)?.groupValues?.getOrNull(1)?.toIntOrNull() ?: 0

        return CodeChefParsedProfile(
            username = handle,
            displayName = name,
            avatar = avatar,
            rating = rating,
            maxRating = maxRating,
            rank = rank,
            problemsSolved = solved,
            totalContests = contests
        )
    }
}
