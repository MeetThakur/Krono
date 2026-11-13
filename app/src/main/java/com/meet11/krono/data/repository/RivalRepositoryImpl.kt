package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.RivalDao
import com.meet11.krono.data.local.entity.RivalEntity
import com.meet11.krono.data.remote.FetchedProfile
import com.meet11.krono.data.remote.ProfileFetcher
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Rival
import com.meet11.krono.domain.repository.RivalRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.supervisorScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RivalRepositoryImpl @Inject constructor(
    private val rivalDao: RivalDao,
    private val fetcher: ProfileFetcher
) : RivalRepository {

    override fun getRivals(): Flow<List<Rival>> =
        rivalDao.getAllRivals().map { list -> list.map { it.toDomain() } }

    override fun getRivalsByPlatform(platform: Platform): Flow<List<Rival>> =
        rivalDao.getRivalsByPlatform(platform.id).map { list -> list.map { it.toDomain() } }

    override suspend fun addRival(platform: Platform, handle: String): Result<Rival> = runCatching {
        val trimmed = handle.trim().removePrefix("@")
        require(trimmed.isNotEmpty()) { "Enter a handle" }
        val fetched = fetcher.fetch(platform, trimmed)
        val entity = fetched.toEntity("${platform.id}-${fetched.username.lowercase()}")
        rivalDao.upsertRival(entity)
        entity.toDomain()
    }

    override suspend fun deleteRival(id: String) = rivalDao.deleteRival(id)

    override suspend fun refreshRivals(): Result<Unit> = runCatching {
        val current = rivalDao.getAllRivals().first()
        if (current.isEmpty()) return@runCatching
        val results = supervisorScope {
            current.map { r ->
                async { runCatching { fetcher.fetch(Platform.fromId(r.platformId), r.username).toEntity(r.id)
                    .copy(totalSubmissions = r.totalSubmissions, badges = r.badges) } }
            }.awaitAll()
        }
        val updated = results.mapNotNull { it.getOrNull() }
        if (updated.isNotEmpty()) rivalDao.upsertRivals(updated)
        results.firstOrNull { it.isFailure }?.exceptionOrNull()?.let { throw it }
    }

    private fun FetchedProfile.toEntity(id: String) = RivalEntity(
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
        lastUpdated = System.currentTimeMillis()
    )

    private fun RivalEntity.toDomain() = Rival(
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
