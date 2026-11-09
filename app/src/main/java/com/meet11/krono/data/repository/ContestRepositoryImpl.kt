package com.meet11.krono.data.repository

import com.meet11.krono.data.local.dao.ContestDao
import com.meet11.krono.data.local.entity.ContestEntity
import com.meet11.krono.data.remote.api.CodeChefApi
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.KenkooooAtCoderApi
import com.meet11.krono.data.remote.parser.AtCoderContestsParser
import com.meet11.krono.data.remote.parser.AtCoderPageContest
import com.meet11.krono.data.remote.api.LeetCodeApi
import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.ContestPhase
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.repository.ContestRepository
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.flow.first
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.worker.ReminderScheduler
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
    private val kenkooooAtCoderApi: KenkooooAtCoderApi,
    private val preferencesManager: PreferencesManager,
    private val reminderScheduler: ReminderScheduler
) : ContestRepository {

    override fun getContests(): Flow<List<Contest>> {
        return contestDao.getAllContests().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    override suspend fun syncContests(): Result<Unit> = runCatching {
        val results = supervisorScope {
            listOf(
                async { runCatching { fetchCodeforcesContests() } },
                async { runCatching { fetchLeetCodeContests() } },
                async { runCatching { fetchCodeChefContests() } },
                async { runCatching { fetchAtCoderContests() } }
            ).awaitAll()
        }
        if (results.all { it.isFailure }) {
            throw results.first().exceptionOrNull() ?: IllegalStateException("Couldn't reach any contest source")
        }
        val fetched = results.flatMap { it.getOrDefault(emptyList()) }
        if (fetched.isNotEmpty()) contestDao.upsertContestsPreservingReminders(fetched)
        // Keep the table small: recent past contests stay visible, anything older than the window goes.
        contestDao.deleteOldUnstarredContests(System.currentTimeMillis() - PAST_WINDOW_MS)
    }

    override suspend fun setReminder(contestId: String, enable: Boolean): Boolean {
        val entity = contestDao.getContestById(contestId) ?: return false
        if (!enable) {
            contestDao.updateReminder(contestId, false, entity.reminderMinutesBefore)
            reminderScheduler.cancel(contestId)
            return true
        }
        val minutes = preferencesManager.reminderLeadMinutes.first()
        val scheduled = reminderScheduler.schedule(entity.toDomain(), minutes)
        if (scheduled) contestDao.updateReminder(contestId, true, minutes)
        return scheduled
    }

    override suspend fun getActiveReminders(): List<Contest> {
        val now = System.currentTimeMillis()
        return contestDao.getActiveReminders(now).map { it.toDomain() }
    }

    override suspend fun updateReminderLeadTime(minutesBefore: Int) {
        val now = System.currentTimeMillis()
        contestDao.getActiveReminders(now).forEach { entity ->
            contestDao.updateReminder(entity.id, true, minutesBefore)
            reminderScheduler.cancel(entity.id)
            reminderScheduler.schedule(entity.toDomain().copy(reminderMinutesBefore = minutesBefore), minutesBefore)
        }
    }

    private companion object {
        /** How far back finished contests are kept and shown. */
        const val PAST_WINDOW_MS = 14L * 24 * 60 * 60 * 1000
    }

    private suspend fun fetchCodeforcesContests(): List<ContestEntity> {
        val response = codeforcesApi.getContestList(gym = false)
        if (response.status != "OK" || response.result == null) return emptyList()

        // contest.list returns every contest ever held (~2k rows); keep live/upcoming plus the recent past.
        val pastCutoff = System.currentTimeMillis() - PAST_WINDOW_MS
        return response.result.asSequence().filter {
            it.phase == "BEFORE" || it.phase == "CODING" ||
                (it.phase == "FINISHED" && (it.startTimeSeconds ?: 0L) * 1000 > pastCutoff)
        }.mapNotNull { cf ->
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
        }.toList()
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
        val pastQuery = """
            query {
              pastContests(pageNo: 1, numPerPage: 8) {
                data { title titleSlug startTime duration }
              }
            }
        """.trimIndent()
        val past = runCatching {
            leetCodeApi.getContestData(GraphQLRequest(pastQuery)).data?.pastContests?.data.orEmpty()
        }.getOrDefault(emptyList())
        val pastCutoff = System.currentTimeMillis() - PAST_WINDOW_MS
        val contests = (response.data?.topTwoContests.orEmpty() + past.filter { it.startTime * 1000 > pastCutoff })
            .distinctBy { it.titleSlug }
        if (contests.isEmpty()) return emptyList()

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
        val pastCutoff = System.currentTimeMillis() - PAST_WINDOW_MS
        val allCc = (response.presentContests ?: emptyList()) + (response.futureContests ?: emptyList()) +
            (response.pastContests ?: emptyList()).take(15)
        val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }

        return allCc.distinctBy { it.contestCode }.mapNotNull { cc ->
            val startMs = runCatching {
                cc.contestStartDateIso?.let { isoFormat.parse(it)?.time }
            }.getOrNull() ?: return@mapNotNull null

            val endMs = runCatching {
                cc.contestEndDateIso?.let { isoFormat.parse(it)?.time }
            }.getOrNull() ?: (startMs + 7200000) // Default 2h

            if (endMs < pastCutoff) return@mapNotNull null
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
        val now = System.currentTimeMillis()
        // Recent and running contests come from the community API...
        val recent = runCatching { kenkooooAtCoderApi.getContests() }.getOrDefault(emptyList())
            .filter { (it.startEpochSecond * 1000) + (it.durationSecond * 1000) > now - PAST_WINDOW_MS }
            .map { ac ->
                AtCoderPageContest(
                    id = ac.id,
                    title = ac.title,
                    startMillis = ac.startEpochSecond * 1000,
                    durationSeconds = ac.durationSecond,
                    isRated = !ac.rateChange.isNullOrBlank() && ac.rateChange != "-"
                )
            }
        // ...and upcoming ones from atcoder.jp itself (the community list only knows contests that have started).
        val upcoming = runCatching {
            AtCoderContestsParser.parse(
                kenkooooAtCoderApi.getContestsPage("https://atcoder.jp/contests/").use { it.string() }
            )
        }.getOrDefault(emptyList())
        if (recent.isEmpty() && upcoming.isEmpty()) throw IllegalStateException("Couldn't reach AtCoder")

        return (upcoming + recent).distinctBy { it.id }.map { ac ->
            val startMs = ac.startMillis
            val endMs = startMs + ac.durationSeconds * 1000
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
                durationSeconds = ac.durationSeconds,
                url = "https://atcoder.jp/contests/${ac.id}",
                isRated = ac.isRated,
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
