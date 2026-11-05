package com.meet11.krono.domain.model

import androidx.compose.ui.graphics.Color
import com.meet11.krono.core.theme.PlatformAtCoder
import com.meet11.krono.core.theme.PlatformCodeChef
import com.meet11.krono.core.theme.PlatformCodeforces
import com.meet11.krono.core.theme.PlatformCodingNinjas
import com.meet11.krono.core.theme.PlatformGeeksforGeeks
import com.meet11.krono.core.theme.PlatformHackerRank
import com.meet11.krono.core.theme.PlatformLeetCode
import com.meet11.krono.core.theme.PlatformTopCoder

enum class Platform(
    val id: String,
    val displayName: String,
    val shortCode: String,
    val brandColor: Color,
    val profileUrlPrefix: String? = null
) {
    CODEFORCES("codeforces", "Codeforces", "CF", PlatformCodeforces, "https://codeforces.com/profile/"),
    LEETCODE("leetcode", "LeetCode", "LC", PlatformLeetCode, "https://leetcode.com/u/"),
    CODECHEF("codechef", "CodeChef", "CC", PlatformCodeChef, "https://www.codechef.com/users/"),
    ATCODER("atcoder", "AtCoder", "AC", PlatformAtCoder, "https://atcoder.jp/users/"),
    GEEKSFORGEEKS("geeksforgeeks", "GeeksforGeeks", "GFG", PlatformGeeksforGeeks),
    HACKERRANK("hackerrank", "HackerRank", "HR", PlatformHackerRank),
    TOPCODER("topcoder", "TopCoder", "TC", PlatformTopCoder),
    CODINGNINJAS("codingninjas", "CodingNinjas", "CN", PlatformCodingNinjas);

    fun profileUrl(handle: String): String? = profileUrlPrefix?.let { it + handle }

    companion object {
        /** Platforms whose user profiles Krono can fetch. */
        val trackable = listOf(CODEFORCES, LEETCODE, CODECHEF)

        /** Platforms Krono pulls contest schedules from. */
        val contestSources = listOf(CODEFORCES, LEETCODE, CODECHEF, ATCODER)

        fun fromId(id: String): Platform {
            return entries.firstOrNull { it.id.equals(id, ignoreCase = true) } ?: CODEFORCES
        }
    }
}
