package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.RivalDao
import com.meet11.krono.data.local.entity.RivalEntity
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Rival
import com.meet11.krono.domain.repository.RivalRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RivalRepositoryImpl @Inject constructor(
    private val rivalDao: RivalDao,
    private val codeforcesApi: CodeforcesApi,
    private val leetCodeApi: LeetCodeApi
) : RivalRepository {

    override fun getRivals(): Flow<List<Rival>> {
        return rivalDao.getAllRivals().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override fun getRivalsByPlatform(platform: Platform): Flow<List<Rival>> {
        return rivalDao.getRivalsByPlatform(platform.id).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun addRival(platform: Platform, handle: String): Result<Rival> = runCatching {
        val trimmedHandle = handle.trim()
        val id = "${platform.id}-${trimmedHandle.lowercase()}"

        val rival = when (platform) {
            Platform.CODEFORCES -> fetchCodeforcesRival(id, trimmedHandle)
            Platform.LEETCODE -> fetchLeetCodeRival(id, trimmedHandle)
            else -> RivalEntity(
                id = id,
                platformId = platform.id,
                username = trimmedHandle,
                displayName = trimmedHandle,
                lastUpdated = System.currentTimeMillis()
            )
        }

        rivalDao.upsertRival(rival)
        rival.toDomain()
    }

    override suspend fun deleteRival(id: String) {
        rivalDao.deleteRival(id)
    }

    private suspend fun fetchCodeforcesRival(id: String, handle: String): RivalEntity {
        val infoResponse = codeforcesApi.getUserInfo(handle)
        val user = infoResponse.result?.firstOrNull() ?: throw IllegalArgumentException("User not found on Codeforces")

        val subsResponse = runCatching { codeforcesApi.getUserSubmissions(handle, 1, 1000) }.getOrNull()
        val solvedCount = subsResponse?.result?.filter { it.verdict == "OK" }?.distinctBy { it.contestId }?.size ?: 0

        val ratingHistory = runCatching { codeforcesApi.getUserRating(handle) }.getOrNull()
        val contestCount = ratingHistory?.result?.size ?: 0

        return RivalEntity(
            id = id,
            platformId = Platform.CODEFORCES.id,
            username = user.handle,
            displayName = listOfNotNull(user.firstName, user.lastName).joinToString(" ").ifBlank { user.handle },
            avatar = user.titlePhoto ?: user.avatar,
            rating = user.rating,
            maxRating = user.maxRating,
            rank = user.rank,
            problemsSolved = solvedCount,
            totalContests = contestCount,
            lastUpdated = System.currentTimeMillis()
        )
    }

    private suspend fun fetchLeetCodeRival(id: String, handle: String): RivalEntity {
        val userQuery = """
            query getUserProfile(${'$'}username: String!) {
              matchedUser(username: ${'$'}username) {
                username
                profile {
                  realName
                  userAvatar
                  ranking
                }
                submitStats {
                  acSubmissionNum {
                    difficulty
                    count
                  }
                }
              }
            }
        """.trimIndent()

        val variables = buildJsonObject { put("username", handle) }
        val userResponse = leetCodeApi.getUserProfile(GraphQLRequest(userQuery, variables))
        val matchedUser = userResponse.data?.matchedUser ?: throw IllegalArgumentException("User not found on LeetCode")

        val solvedTotal = matchedUser.submitStats?.acSubmissionNum?.firstOrNull { it.difficulty == "All" }?.count
            ?: matchedUser.submitStats?.acSubmissionNum?.sumOf { it.count } ?: 0

        val contestQuery = """
            query userContestRankingInfo(${'$'}username: String!) {
              userContestRanking(username: ${'$'}username) {
                attendedContestsCount
                rating
                globalRanking
              }
            }
        """.trimIndent()

        val contestResponse = runCatching {
            leetCodeApi.getContestData(GraphQLRequest(contestQuery, variables))
        }.getOrNull()

        val contestRanking = contestResponse?.data?.userContestRanking
        val ratingInt = contestRanking?.rating?.toInt()

        return RivalEntity(
            id = id,
            platformId = Platform.LEETCODE.id,
            username = matchedUser.username,
            displayName = matchedUser.profile?.realName?.ifBlank { matchedUser.username } ?: matchedUser.username,
            avatar = matchedUser.profile?.userAvatar,
            rating = ratingInt,
            maxRating = ratingInt,
            rank = contestRanking?.globalRanking?.let { "#$it" } ?: matchedUser.profile?.ranking?.let { "#$it" },
            problemsSolved = solvedTotal,
            totalContests = contestRanking?.attendedContestsCount ?: 0,
            lastUpdated = System.currentTimeMillis()
        )
    }

    private fun RivalEntity.toDomain(): Rival {
        return Rival(
            id = id,
            platform = Platform.fromId(platformId),
            username = username,
            displayName = displayName,
            avatar = avatar,
            rating = rating,
            maxRating = maxRating,
            rank = rank,
            problemsSolved = problemsSolved,
            totalSubmissions = totalSubmissions,
            totalContests = totalContests,
            badges = badges?.split(",")?.filter { it.isNotBlank() } ?: emptyList(),
            lastUpdated = lastUpdated,
            isStale = isStale
        )
    }
}
