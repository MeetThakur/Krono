package com.meet11.krono.data.remote

import com.meet11.krono.data.remote.api.CodeChefApi
import com.meet11.krono.data.remote.api.CodeforcesApi
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
    private val codeChefApi: CodeChefApi
) {
    suspend fun fetch(platform: Platform, handle: String): FetchedProfile = when (platform) {
        Platform.CODEFORCES -> fetchCodeforces(handle)
        Platform.LEETCODE -> fetchLeetCode(handle)
        Platform.CODECHEF -> fetchCodeChef(handle)
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
        else -> null
    }

    private suspend fun fetchCodeforces(handle: String): FetchedProfile = coroutineScope {
        val info = async { codeforcesApi.getUserInfo(handle) }
        val subs = async { runCatching { codeforcesApi.getUserSubmissions(handle, 1, 10_000) }.getOrNull() }
        val rating = async { runCatching { codeforcesApi.getUserRating(handle) }.getOrNull() }

        // Codeforces answers an unknown handle with HTTP 400; network errors propagate as-is.
        val user = try {
            info.await().result?.firstOrNull()
        } catch (e: retrofit2.HttpException) {
            null
        } ?: throw UserNotFoundException(Platform.CODEFORCES, handle)

        // Count distinct *problems* with an accepted verdict (was distinct contests before).
        val solved = subs.await()?.result.orEmpty()
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
            totalContests = rating.await()?.result?.size ?: 0
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
        val contestDeferred = async { runCatching { leetCodeApi.getContestData(GraphQLRequest(contestQuery, variables)) }.getOrNull() }

        val matched = userDeferred.await().data?.matchedUser ?: throw UserNotFoundException(Platform.LEETCODE, handle)
        val solved = matched.submitStats?.acSubmissionNum?.firstOrNull { it.difficulty == "All" }?.count
            ?: matched.submitStats?.acSubmissionNum?.sumOf { it.count } ?: 0

        val contestData = contestDeferred.await()?.data
        val ranking = contestData?.userContestRanking
        val current = ranking?.rating?.toInt()
        // LeetCode doesn't expose a peak rating directly — derive it from history.
        val peak = contestData?.userContestRankingHistory
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
            throw UserNotFoundException(Platform.CODECHEF, handle)
        }
        val parsed = runCatching { CodeChefProfileParser.parse(html, handle) }
            .getOrElse { throw UserNotFoundException(Platform.CODECHEF, handle) }
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
