package com.meet11.krono.data.remote

import com.meet11.krono.data.remote.api.CodeChefApi
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.KenkooooAtCoderApi
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.data.remote.parser.CodeChefProfileParser
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.RatingPoint
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

/** Platform-neutral snapshot of a user, shared by profiles and rivals. */
data class FetchedProfile(
    val platform: Platform,
    val username: String,
    val displayName: String?,
    val avatar: String?,
    val rating: Int?,
    val maxRating: Int?,
    val rank: String?,
    val problemsSolved: Int,
    val totalContests: Int
)

class UserNotFoundException(platform: Platform, handle: String) :
    Exception("Couldn't find \"$handle\" on ${platform.displayName}. Check the handle and try again.")

/**
 * Single source of truth for fetching a user from any supported platform.
 * Profiles and rivals used to carry two diverging copies of this logic.
 */
@Singleton
class ProfileFetcher @Inject constructor(
    private val codeforcesApi: CodeforcesApi,
    private val leetCodeApi: LeetCodeApi,
    private val codeChefApi: CodeChefApi,
    private val atCoderApi: KenkooooAtCoderApi
) {
    suspend fun fetch(platform: Platform, handle: String): FetchedProfile = when (platform) {
        Platform.CODEFORCES -> fetchCodeforces(handle)
        Platform.LEETCODE -> fetchLeetCode(handle)
        Platform.CODECHEF -> fetchCodeChef(handle)
        Platform.ATCODER -> fetchAtCoder(handle)
        else -> throw UnsupportedOperationException("${platform.displayName} profiles aren't supported yet")
    }

    suspend fun ratingHistory(platform: Platform, handle: String): List<RatingPoint>? = when (platform) {
        Platform.CODEFORCES -> {
            val res = codeforcesApi.getUserRating(handle)
            res.result.orEmpty().map {
                RatingPoint(it.ratingUpdateTimeSeconds * 1000L, it.newRating, it.contestName)
            }
        }
        Platform.LEETCODE -> {
            val query = """
                query userContestRankingHistory(${'$'}username: String!) {
                  userContestRankingHistory(username: ${'$'}username) {
                    attended
                    rating
                    contest { title startTime }
                  }
                }
            """.trimIndent()
            val res = leetCodeApi.getContestData(GraphQLRequest(query, buildJsonObject { put("username", handle) }))
            res.data?.userContestRankingHistory.orEmpty()
                .filter { it.attended && it.rating != null && it.contest != null }
                .map { RatingPoint(it.contest!!.startTime * 1000L, it.rating!!.toInt(), it.contest.title) }
        }
        Platform.CODECHEF -> {
            val html = codeChefApi.getUserProfilePage(handle).use { it.string() }
            CodeChefProfileParser.parseRatingHistory(html).map { RatingPoint(it.timestampMillis, it.rating, it.contestName) }
        }
        Platform.ATCODER -> atCoderRatedHistory(handle).map {
            RatingPoint(parseAtCoderTime(it.endTime), it.newRating, it.contestName)
        }
        else -> null
    }

    private suspend fun atCoderRatedHistory(handle: String) =
        atCoderApi.getHistory("https://atcoder.jp/users/$handle/history/json").filter { it.isRated }

    private fun parseAtCoderTime(iso: String): Long =
        runCatching { java.time.OffsetDateTime.parse(iso).toInstant().toEpochMilli() }.getOrDefault(0L)

    /** AtCoder's published colour bands, used as the rank label. */
    private fun atCoderRank(rating: Int): String = when {
        rating >= 2800 -> "Red"
        rating >= 2400 -> "Orange"
        rating >= 2000 -> "Yellow"
        rating >= 1600 -> "Blue"
        rating >= 1200 -> "Cyan"
        rating >= 800 -> "Green"
        rating >= 400 -> "Brown"
        else -> "Gray"
    }

    private suspend fun fetchAtCoder(handle: String): FetchedProfile = coroutineScope {
        val history = async {
            try {
                atCoderRatedHistory(handle)
            } catch (e: retrofit2.HttpException) {
                if (e.code() == 404) throw UserNotFoundException(Platform.ATCODER, handle)
                throw e
            }
        }
        val solved = async { atCoderApi.getAcRank(handle).count }
        val rated = history.await()
        val current = rated.lastOrNull()?.newRating
        FetchedProfile(
            platform = Platform.ATCODER,
            username = handle,
            displayName = handle,
            avatar = null,
            rating = current,
            maxRating = rated.maxOfOrNull { it.newRating },
            rank = current?.let(::atCoderRank),
            problemsSolved = solved.await(),
            totalContests = rated.size
        )
    }

    private suspend fun fetchCodeforces(handle: String): FetchedProfile = coroutineScope {
        // Codeforces also uses HTTP 400 for rate limits, so inspect its error before calling a user missing.
        val response = try {
            codeforcesApi.getUserInfo(handle)
        } catch (e: retrofit2.HttpException) {
            val error = e.response()?.errorBody()?.use { it.string() }.orEmpty()
            if (e.code() == 404 || (e.code() == 400 && error.contains("handle", true) && error.contains("not found", true))) {
                throw UserNotFoundException(Platform.CODEFORCES, handle)
            }
            throw e
        }
        check(response.status == "OK") { "Codeforces profile data unavailable" }
        val user = response.result?.firstOrNull() ?: throw UserNotFoundException(Platform.CODEFORCES, handle)
        // Incomplete snapshots must fail, so repositories retain the previous cached statistics.
        val subs = async {
            codeforcesApi.getUserSubmissions(handle, 1, 10_000).also {
                check(it.status == "OK" && it.result != null) { "Codeforces submissions unavailable" }
            }
        }
        val rating = async {
            codeforcesApi.getUserRating(handle).also {
                check(it.status == "OK" && it.result != null) { "Codeforces rating history unavailable" }
            }
        }

        // Count distinct *problems* with an accepted verdict (was distinct contests before).
        val solved = subs.await().result.orEmpty()
            .asSequence()
            .filter { it.verdict == "OK" }
            .mapNotNull { s ->
                val p = s.problem ?: return@mapNotNull null
                "${p.contestId ?: p.problemsetName}-${p.index ?: p.name}"
            }
            .distinct()
            .count()

        FetchedProfile(
            platform = Platform.CODEFORCES,
            username = user.handle,
            displayName = listOfNotNull(user.firstName, user.lastName).joinToString(" ").ifBlank { user.handle },
            avatar = user.titlePhoto ?: user.avatar,
            rating = user.rating,
            maxRating = user.maxRating,
            rank = user.rank,
            problemsSolved = solved,
            totalContests = rating.await().result.orEmpty().size
        )
    }

    private suspend fun fetchLeetCode(handle: String): FetchedProfile = coroutineScope {
        val variables = buildJsonObject { put("username", handle) }
        val userQuery = """
            query getUserProfile(${'$'}username: String!) {
              matchedUser(username: ${'$'}username) {
                username
                profile { realName userAvatar ranking }
                submitStats { acSubmissionNum { difficulty count } }
              }
            }
        """.trimIndent()
        val contestQuery = """
            query userContestRankingInfo(${'$'}username: String!) {
              userContestRanking(username: ${'$'}username) {
                attendedContestsCount
                rating
                globalRanking
              }
              userContestRankingHistory(username: ${'$'}username) { attended rating }
            }
        """.trimIndent()

        val userDeferred = async { leetCodeApi.getUserProfile(GraphQLRequest(userQuery, variables)) }
        val contestDeferred = async { leetCodeApi.getContestData(GraphQLRequest(contestQuery, variables)) }

        val userResponse = userDeferred.await()
        check(userResponse.errors.isNullOrEmpty()) { "LeetCode profile data unavailable" }
        val matched = userResponse.data?.matchedUser ?: throw UserNotFoundException(Platform.LEETCODE, handle)
        val counts = checkNotNull(matched.submitStats?.acSubmissionNum) { "LeetCode solved counts unavailable" }
        val solved = counts.firstOrNull { it.difficulty == "All" }?.count ?: counts.sumOf { it.count }

        val contestResponse = contestDeferred.await()
        check(contestResponse.errors.isNullOrEmpty()) { "LeetCode contest data unavailable" }
        val contestData = checkNotNull(contestResponse.data) { "LeetCode contest data unavailable" }
        val ranking = contestData.userContestRanking
        val current = ranking?.rating?.toInt()
        // LeetCode doesn't expose a peak rating directly — derive it from history.
        val peak = contestData.userContestRankingHistory
            ?.filter { it.attended }
            ?.mapNotNull { it.rating?.toInt() }
            ?.maxOrNull()
            ?: current

        FetchedProfile(
            platform = Platform.LEETCODE,
            username = matched.username,
            displayName = matched.profile?.realName?.ifBlank { null } ?: matched.username,
            avatar = matched.profile?.userAvatar,
            rating = current,
            maxRating = peak,
            rank = ranking?.globalRanking?.let { "Global #$it" } ?: matched.profile?.ranking?.let { "Rank #$it" },
            problemsSolved = solved,
            totalContests = ranking?.attendedContestsCount ?: 0
        )
    }

    private suspend fun fetchCodeChef(handle: String): FetchedProfile {
        val html = try {
            codeChefApi.getUserProfilePage(handle).use { it.string() }
        } catch (e: retrofit2.HttpException) {
            if (e.code() == 404) throw UserNotFoundException(Platform.CODECHEF, handle)
            throw e
        }
        if (html.contains("User does not exist", ignoreCase = true) || html.contains("Could not find page", ignoreCase = true)) {
            throw UserNotFoundException(Platform.CODECHEF, handle)
        }
        val parsed = runCatching { CodeChefProfileParser.parse(html, handle) }
            .getOrElse { throw IllegalStateException("CodeChef profile data is temporarily unavailable", it) }
        return FetchedProfile(
            platform = Platform.CODECHEF,
            username = parsed.username,
            displayName = parsed.displayName,
            avatar = parsed.avatar,
            rating = parsed.rating,
            maxRating = parsed.maxRating,
            rank = parsed.rank,
            problemsSolved = parsed.problemsSolved,
            totalContests = parsed.totalContests
        )
    }
}
