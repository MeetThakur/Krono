package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.entity.ProfileEntity
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.repository.ProfileRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepositoryImpl @Inject constructor(
    private val profileDao: ProfileDao,
    private val codeforcesApi: CodeforcesApi,
    private val leetCodeApi: LeetCodeApi
) : ProfileRepository {

    override fun getProfiles(): Flow<List<Profile>> {
        return profileDao.getAllProfiles().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun addProfile(platform: Platform, handle: String): Result<Profile> = runCatching {
        val trimmedHandle = handle.trim()
        val id = "${platform.id}-${trimmedHandle.lowercase()}"

        val profile = when (platform) {
            Platform.CODEFORCES -> fetchCodeforcesProfile(id, trimmedHandle)
            Platform.LEETCODE -> fetchLeetCodeProfile(id, trimmedHandle)
            else -> ProfileEntity(
                id = id,
                platformId = platform.id,
                username = trimmedHandle,
                displayName = trimmedHandle,
                lastUpdated = System.currentTimeMillis()
            )
        }

        profileDao.upsertProfile(profile)
        profile.toDomain()
    }

    override suspend fun refreshProfiles(): Result<Unit> = runCatching {
        val currentProfiles = profileDao.getAllProfiles().first()
        for (p in currentProfiles) {
            val platform = Platform.fromId(p.platformId)
            val updated = when (platform) {
                Platform.CODEFORCES -> runCatching { fetchCodeforcesProfile(p.id, p.username) }.getOrDefault(p)
                Platform.LEETCODE -> runCatching { fetchLeetCodeProfile(p.id, p.username) }.getOrDefault(p)
                else -> p
            }
            profileDao.upsertProfile(updated)
        }
    }

    override suspend fun deleteProfile(id: String) {
        profileDao.deleteProfile(id)
    }

    override suspend fun updateProfileOrder(profiles: List<Profile>) {
        val entities = profiles.mapIndexed { index, profile ->
            profile.toEntity().copy(displayOrder = index)
        }
        profileDao.upsertProfiles(entities)
    }

    override suspend fun getLeetCodePotd(): Result<com.meet11.krono.domain.model.Potd?> = runCatching {
        val query = """
            query questionOfToday {
                activeDailyCodingChallengeQuestion {
                    date
                    link
                    question {
                        title
                        difficulty
                    }
                }
            }
        """.trimIndent()

        val response = leetCodeApi.getPotd(GraphQLRequest(query))
        val challenge = response.data?.activeDailyCodingChallengeQuestion ?: return@runCatching null
        val question = challenge.question ?: return@runCatching null

        com.meet11.krono.domain.model.Potd(
            title = question.title ?: "Daily Challenge",
            difficulty = question.difficulty ?: "Medium",
            url = "https://leetcode.com${challenge.link ?: ""}",
            date = challenge.date ?: ""
        )
    }

    private suspend fun fetchCodeforcesProfile(id: String, handle: String): ProfileEntity {
        val infoResponse = codeforcesApi.getUserInfo(handle)
        val user = infoResponse.result?.firstOrNull() ?: throw IllegalArgumentException("User not found on Codeforces")

        val subsResponse = runCatching { codeforcesApi.getUserSubmissions(handle, 1, 1000) }.getOrNull()
        val solvedCount = subsResponse?.result?.filter { it.verdict == "OK" }?.distinctBy { it.contestId }?.size ?: 0

        val ratingHistory = runCatching { codeforcesApi.getUserRating(handle) }.getOrNull()
        val contestCount = ratingHistory?.result?.size ?: 0

        return ProfileEntity(
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

    private suspend fun fetchLeetCodeProfile(id: String, handle: String): ProfileEntity {
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

        return ProfileEntity(
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

    private fun ProfileEntity.toDomain(): Profile {
        return Profile(
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
            displayOrder = displayOrder,
            lastUpdated = lastUpdated,
            isStale = isStale
        )
    }

    private fun Profile.toEntity(): ProfileEntity {
        return ProfileEntity(
            id = id,
            platformId = platform.id,
            username = username,
            displayName = displayName,
            avatar = avatar,
            rating = rating,
            maxRating = maxRating,
            rank = rank,
            problemsSolved = problemsSolved,
            totalSubmissions = totalSubmissions,
            totalContests = totalContests,
            badges = badges.joinToString(","),
            displayOrder = displayOrder,
            lastUpdated = lastUpdated,
            isStale = isStale
        )
    }
}
