package com.meet11.krono.domain.model

import androidx.compose.ui.graphics.Color
import com.meet11.krono.core.theme.PlatformAtCoderDark
import com.meet11.krono.core.theme.PlatformAtCoderLight
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
    val brandColor: Color
) {
    CODEFORCES("codeforces", "Codeforces", "CF", PlatformCodeforces),
    LEETCODE("leetcode", "LeetCode", "LC", PlatformLeetCode),
    CODECHEF("codechef", "CodeChef", "CC", PlatformCodeChef),
    ATCODER("atcoder", "AtCoder", "AC", PlatformAtCoderDark),
    GEEKSFORGEEKS("geeksforgeeks", "GeeksforGeeks", "GFG", PlatformGeeksforGeeks),
    HACKERRANK("hackerrank", "HackerRank", "HR", PlatformHackerRank),
    TOPCODER("topcoder", "TopCoder", "TC", PlatformTopCoder),
    CODINGNINJAS("codingninjas", "CodingNinjas", "CN", PlatformCodingNinjas);

    val cardBgColor: Color
        get() = when (this) {
            CODEFORCES -> Color(0xFF1D4ED8)
            LEETCODE -> Color(0xFFD97706)
            CODECHEF -> Color(0xFF9A3412)
            ATCODER -> Color(0xFF1E293B)
            GEEKSFORGEEKS -> Color(0xFF059669)
            HACKERRANK -> Color(0xFF0D9488)
            TOPCODER -> Color(0xFF0284C7)
            CODINGNINJAS -> Color(0xFFDC2626)
        }

    val cardSubBgColor: Color
        get() = when (this) {
            CODEFORCES -> Color(0xFF172554)
            LEETCODE -> Color(0xFF451A03)
            CODECHEF -> Color(0xFF431407)
            ATCODER -> Color(0xFF0F172A)
            GEEKSFORGEEKS -> Color(0xFF064E3B)
            HACKERRANK -> Color(0xFF134E4A)
            TOPCODER -> Color(0xFF0C4A6E)
            CODINGNINJAS -> Color(0xFF7F1D1D)
        }

    companion object {
        fun fromId(id: String): Platform {
            return entries.firstOrNull { it.id.equals(id, ignoreCase = true) } ?: CODEFORCES
        }
    }
}
