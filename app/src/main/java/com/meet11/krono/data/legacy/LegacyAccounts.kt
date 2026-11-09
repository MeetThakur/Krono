package com.meet11.krono.data.legacy

import com.meet11.krono.domain.model.Platform
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.jsonPrimitive

/** A connected profile or rival recovered from Krono 1.x, already validated and normalised. */
data class LegacyAccount(
    val oldId: String,
    val platform: Platform,
    val username: String,
    val displayName: String?,
    val avatar: String?,
    val rating: Int?,
    val maxRating: Int?,
    val rank: String?,
    val problemsSolved: Int,
    val totalSubmissions: Int,
    val totalContests: Int,
    /** Comma-separated, the format Room stores. */
    val badges: String?,
    val lastUpdated: Long
) {
    /** Id in the 2.0 scheme: `<platform>-<lowercase handle>`. */
    val id: String get() = "${platform.id}-${username.lowercase()}"
}

/** One raw row of the 1.x `profiles` / `rivals` table. */
data class LegacyRow(
    val id: String,
    val platformId: String?,
    val username: String?,
    val displayName: String?,
    val avatar: String?,
    val rating: Int?,
    val maxRating: Int?,
    val rank: String?,
    val problemsSolved: Int?,
    val totalSubmissions: Int?,
    val totalContests: Int?,
    val badges: String?,
    val lastUpdated: Long?
)

object LegacyAccounts {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    /** Null for rows 2.0 can't use: unknown/unsupported platform or no handle. */
    fun fromRow(row: LegacyRow): LegacyAccount? {
        val platform = Platform.trackable.firstOrNull { it.id.equals(row.platformId?.trim(), ignoreCase = true) }
            ?: return null
        val username = row.username?.trim()?.removePrefix("@")?.trim().orEmpty()
        if (username.isEmpty()) return null
        return LegacyAccount(
            oldId = row.id,
            platform = platform,
            username = username,
            displayName = row.displayName?.takeIf { it.isNotBlank() },
            avatar = row.avatar?.takeIf { it.isNotBlank() },
            rating = row.rating,
            maxRating = row.maxRating,
            rank = row.rank?.takeIf { it.isNotBlank() },
            problemsSolved = (row.problemsSolved ?: 0).coerceAtLeast(0),
            totalSubmissions = (row.totalSubmissions ?: 0).coerceAtLeast(0),
            totalContests = (row.totalContests ?: 0).coerceAtLeast(0),
            badges = badgesToCsv(row.badges),
            lastUpdated = row.lastUpdated ?: 0L
        )
    }

    /** Same account listed twice (e.g. different id spellings): keep the most recently updated. */
    fun dedupe(accounts: List<LegacyAccount>): List<LegacyAccount> =
        accounts.groupBy { it.id }.values.map { group -> group.maxBy { it.lastUpdated } }

    /** 1.x stored badges as a JSON array string; 2.0 stores them comma-separated. */
    fun badgesToCsv(raw: String?): String? {
        if (raw.isNullOrBlank()) return null
        val items = runCatching {
            (json.parseToJsonElement(raw) as JsonArray).map { it.jsonPrimitive.content }
        }.getOrNull() ?: return null
        return items.filter { it.isNotBlank() && ',' !in it }.joinToString(",").ifEmpty { null }
    }

    /** `krono_profile_order` is a JSON array of 1.x profile ids. Garbage yields an empty list. */
    fun parseOrder(raw: String?): List<String> {
        if (raw.isNullOrBlank()) return emptyList()
        return runCatching {
            (json.parseToJsonElement(raw) as JsonArray).map { it.jsonPrimitive.content }
        }.getOrDefault(emptyList())
    }

    /** Position in the saved order; accounts missing from it go after, in their original order. */
    fun displayOrder(order: List<String>, accounts: List<LegacyAccount>): Map<String, Int> {
        val ranked = accounts.sortedBy { a ->
            order.indexOf(a.oldId).let { if (it == -1) Int.MAX_VALUE else it }
        }
        return ranked.mapIndexed { index, a -> a.id to index }.toMap()
    }
}
