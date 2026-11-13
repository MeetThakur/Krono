package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.entity.ProfileEntity
import com.meet11.krono.data.remote.FetchedProfile
import com.meet11.krono.data.remote.ProfileFetcher
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.model.RatingPoint
import com.meet11.krono.domain.repository.ProfileRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.supervisorScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ProfileRepositoryImpl @Inject constructor(
    private val profileDao: ProfileDao,
    private val fetcher: ProfileFetcher,
    private val leetCodeApi: LeetCodeApi
) : ProfileRepository {

    override fun getProfiles(): Flow<List<Profile>> =
        profileDao.getAllProfiles().map { list -> list.map { it.toDomain() } }

    override suspend fun addProfile(platform: Platform, handle: String): Result<Profile> = runCatching {
        val trimmed = handle.trim().removePrefix("@")
        require(trimmed.isNotEmpty()) { "Enter a handle" }
        val fetched = fetcher.fetch(platform, trimmed)
        val id = idFor(platform, fetched.username)
        val existing = profileDao.getProfileById(id)
        val order = existing?.displayOrder ?: (profileDao.getAllProfiles().first().maxOfOrNull { it.displayOrder }?.plus(1) ?: 0)
        val entity = fetched.toEntity(id, order)
        profileDao.upsertProfile(entity)
        entity.toDomain()
    }

    override suspend fun refreshProfiles(): Result<Unit> = runCatching {
        val current = profileDao.getAllProfiles().first()
        if (current.isEmpty()) return@runCatching
        val results = supervisorScope {
            current.map { p ->
                async {
                    runCatching { fetcher.fetch(Platform.fromId(p.platformId), p.username) }
                        // Preserve id + user-chosen order; REPLACE used to reset order to 0.
                        .map { it.toEntity(p.id, p.displayOrder).copy(totalSubmissions = p.totalSubmissions, badges = p.badges) }
                }
            }.awaitAll()
        }
        val updated = results.mapNotNull { it.getOrNull() }
        if (updated.isNotEmpty()) profileDao.upsertProfiles(updated)
        results.firstOrNull { it.isFailure }?.exceptionOrNull()?.let { throw it }
    }

    override suspend fun deleteProfile(id: String) = profileDao.deleteProfile(id)

    override suspend fun updateProfileOrder(profiles: List<Profile>) {
        profileDao.upsertProfiles(profiles.mapIndexed { i, p -> p.toEntity().copy(displayOrder = i) })
    }

    override suspend fun getRatingHistory(profile: Profile): Result<List<RatingPoint>?> = runCatching {
        fetcher.ratingHistory(profile.platform, profile.username)
    }

    override suspend fun getLeetCodePotd(): Result<Potd?> = runCatching {
        val query = """
            query questionOfToday {
              activeDailyCodingChallengeQuestion {
                date
                link
                question { title difficulty }
              }
            }
        """.trimIndent()
        val challenge = leetCodeApi.getPotd(GraphQLRequest(query)).data?.activeDailyCodingChallengeQuestion
            ?: return@runCatching null
        val question = challenge.question ?: return@runCatching null
        Potd(
            title = question.title ?: "Daily Challenge",
            difficulty = question.difficulty ?: "Medium",
            url = "https://leetcode.com${challenge.link.orEmpty()}",
            date = challenge.date.orEmpty()
        )
    }

    private fun idFor(platform: Platform, handle: String) = "${platform.id}-${handle.lowercase()}"

    private fun FetchedProfile.toEntity(id: String, order: Int) = ProfileEntity(
        id = id,
        platformId = platform.id,
        username = username,
        displayName = displayName,
        avatar = avatar,
        rating = rating,
        maxRating = maxRating,
        rank = rank,
        problemsSolved = problemsSolved,
        totalContests = totalContests,
        displayOrder = order,
        lastUpdated = System.currentTimeMillis()
    )

    private fun ProfileEntity.toDomain() = Profile(
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

    private fun Profile.toEntity() = ProfileEntity(
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
