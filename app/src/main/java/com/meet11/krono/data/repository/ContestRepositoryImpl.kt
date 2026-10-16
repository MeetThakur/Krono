package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.ContestDao
import com.meet11.krono.data.local.entity.ContestEntity
import com.meet11.krono.data.remote.api.CodeChefApi
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.KenkooooAtCoderApi
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.ContestPhase
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.repository.ContestRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.supervisorScope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ContestRepositoryImpl @Inject constructor(
    private val contestDao: ContestDao,
    private val codeforcesApi: CodeforcesApi,
    private val leetCodeApi: LeetCodeApi,
    private val codeChefApi: CodeChefApi,
    private val kenkooooAtCoderApi: KenkooooAtCoderApi
) : ContestRepository {

    override fun getContests(): Flow<List<Contest>> {
        return contestDao.getAllContests().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun syncContests(): Result<Unit> = runCatching {
        supervisorScope {
            val cfDeferred = async { runCatching { fetchCodeforcesContests() }.getOrDefault(emptyList()) }
            val lcDeferred = async { runCatching { fetchLeetCodeContests() }.getOrDefault(emptyList()) }
            val ccDeferred = async { runCatching { fetchCodeChefContests() }.getOrDefault(emptyList()) }
            val acDeferred = async { runCatching { fetchAtCoderContests() }.getOrDefault(emptyList()) }

            val allFetched = mutableListOf<ContestEntity>()
            allFetched.addAll(cfDeferred.await())
            allFetched.addAll(lcDeferred.await())
            allFetched.addAll(ccDeferred.await())
            allFetched.addAll(acDeferred.await())

            if (allFetched.isNotEmpty()) {
                contestDao.upsertContestsPreservingReminders(allFetched)
            }
        }
    }

    override suspend fun toggleReminder(contestId: String, enable: Boolean, minutesBefore: Int) {
        contestDao.updateReminder(contestId, enable, minutesBefore)
    }

    override suspend fun getActiveReminders(): List<Contest> {
        val now = System.currentTimeMillis()
        return contestDao.getActiveReminders(now).map { it.toDomain() }
    }

    private suspend fun fetchCodeforcesContests(): List<ContestEntity> {
        val response = codeforcesApi.getContestList(gym = false)
        if (response.status != "OK" || response.result == null) return emptyList()

        return response.result.mapNotNull { cf ->
            val startSec = cf.startTimeSeconds ?: return@mapNotNull null
            val startMs = startSec * 1000
            val durSec = cf.durationSeconds
            val endMs = startMs + (durSec * 1000)

            val phase = when (cf.phase) {
                "BEFORE" -> "BEFORE"
                "CODING" -> "CODING"
                else -> "FINISHED"
            }

            ContestEntity(
                id = "cf_${cf.id}",
                externalId = cf.id.toString(),
                platformId = Platform.CODEFORCES.id,
                name = cf.name,
                startTime = startMs,
                endTime = endMs,
                durationSeconds = durSec,
                url = "https://codeforces.com/contest/${cf.id}",
                isRated = true,
                phase = phase
            )
        }
    }

    private suspend fun fetchLeetCodeContests(): List<ContestEntity> {
        val query = """
            query {
              topTwoContests {
                title
                titleSlug
                startTime
                duration
              }
            }
        """.trimIndent()

        val response = leetCodeApi.getContestData(GraphQLRequest(query))
        val contests = response.data?.topTwoContests ?: return emptyList()

        return contests.map { lc ->
            val startMs = lc.startTime * 1000
            val durSec = lc.duration
            val endMs = startMs + (durSec * 1000)
            val now = System.currentTimeMillis()
            val phase = when {
                now < startMs -> "BEFORE"
                now in startMs..endMs -> "CODING"
                else -> "FINISHED"
            }

            ContestEntity(
                id = "lc_${lc.titleSlug}",
                externalId = lc.titleSlug,
                platformId = Platform.LEETCODE.id,
                name = lc.title,
                startTime = startMs,
                endTime = endMs,
                durationSeconds = durSec,
                url = "https://leetcode.com/contest/${lc.titleSlug}",
                isRated = true,
                phase = phase
            )
        }
    }

    private suspend fun fetchCodeChefContests(): List<ContestEntity> {
        val response = codeChefApi.getContests()
        val allCc = (response.presentContests ?: emptyList()) + (response.futureContests ?: emptyList())
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        return allCc.mapNotNull { cc ->
            val startMs = runCatching {
                cc.contestStartDateIso?.let { isoFormat.parse(it)?.time }
            }.getOrNull() ?: return@mapNotNull null

            val endMs = runCatching {
                cc.contestEndDateIso?.let { isoFormat.parse(it)?.time }
            }.getOrNull() ?: (startMs + 7200000) // Default 2h

            val now = System.currentTimeMillis()
            val phase = when {
                now < startMs -> "BEFORE"
                now in startMs..endMs -> "CODING"
                else -> "FINISHED"
            }

            ContestEntity(
                id = "cc_${cc.contestCode}",
                externalId = cc.contestCode,
                platformId = Platform.CODECHEF.id,
                name = cc.contestName,
                startTime = startMs,
                endTime = endMs,
                durationSeconds = (endMs - startMs) / 1000,
                url = "https://www.codechef.com/${cc.contestCode}",
                isRated = true,
                phase = phase
            )
        }
    }

    private suspend fun fetchAtCoderContests(): List<ContestEntity> {
        val response = kenkooooAtCoderApi.getContests()
        val now = System.currentTimeMillis()

        return response.filter { (it.startEpochSecond * 1000) + (it.durationSecond * 1000) > now - 86400000 }
            .map { ac ->
                val startMs = ac.startEpochSecond * 1000
                val endMs = startMs + (ac.durationSecond * 1000)
                val phase = when {
                    now < startMs -> "BEFORE"
                    now in startMs..endMs -> "CODING"
                    else -> "FINISHED"
                }

                ContestEntity(
                    id = "ac_${ac.id}",
                    externalId = ac.id,
                    platformId = Platform.ATCODER.id,
                    name = ac.title,
                    startTime = startMs,
                    endTime = endMs,
                    durationSeconds = ac.durationSecond,
                    url = "https://atcoder.jp/contests/${ac.id}",
                    isRated = !ac.rateChange.isNullOrBlank() && ac.rateChange != "-",
                    phase = phase
                )
            }
    }

    private fun ContestEntity.toDomain(): Contest {
        val phaseEnum = when (phase) {
            "CODING" -> ContestPhase.CODING
            "FINISHED" -> ContestPhase.FINISHED
            else -> ContestPhase.BEFORE
        }
        return Contest(
            id = id,
            externalId = externalId,
            platform = Platform.fromId(platformId),
            name = name,
            startTime = startTime,
            endTime = endTime,
            durationSeconds = durationSeconds,
            url = url,
            isRated = isRated,
            phase = phaseEnum,
            reminderSet = reminderSet,
            reminderMinutesBefore = reminderMinutesBefore
        )
    }
}
