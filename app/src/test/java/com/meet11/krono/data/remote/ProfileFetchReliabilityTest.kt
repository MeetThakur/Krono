package com.meet11.krono.data.remote

import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.entity.ProfileEntity
import com.meet11.krono.data.remote.api.*
import com.meet11.krono.data.repository.ProfileRepositoryImpl
import com.meet11.krono.domain.model.Platform
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory

class ProfileFetchReliabilityTest {
    private val server = MockWebServer()
    private lateinit var fetcher: ProfileFetcher
    private lateinit var leetcode: LeetCodeApi
    private var failHandle: String? = null
    private var codeChefStatus = 200
    private var graphQlError = false
    private var missingSolved = false
    private var failAtCoder = false

    @Before fun setup() {
        server.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse {
                val path = request.requestUrl!!.encodedPath
                fun json(body: String) = MockResponse().setHeader("Content-Type", "application/json").setBody(body)
                return when {
                    path.endsWith("user.info") -> {
                        val handle = request.requestUrl!!.queryParameter("handles")!!
                        when (handle) {
                            "missing" -> json("""{"status":"FAILED","comment":"handles: User with handle missing not found"}""").setResponseCode(400)
                            "limited" -> json("""{"status":"FAILED","comment":"Call limit exceeded"}""").setResponseCode(400)
                            else -> json("""{"status":"OK","result":[{"handle":"$handle","rating":1700}]}""")
                        }
                    }
                    path.endsWith("user.status") -> if (request.requestUrl!!.queryParameter("handle") == failHandle) {
                        MockResponse().setResponseCode(503)
                    } else json("""{"status":"OK","result":[{"id":1,"creationTimeSeconds":1,"verdict":"OK","problem":{"contestId":1,"index":"A","name":"Test"}}]}""")
                    path.endsWith("user.rating") -> json("""{"status":"OK","result":[]}""")
                    path.endsWith("history/json") -> json("[]")
                    path.endsWith("ac_rank") -> if (failAtCoder) MockResponse().setResponseCode(503) else json("""{"count":12}""")
                    path.startsWith("/users/") -> MockResponse().setResponseCode(codeChefStatus).setBody("<html>Temporary upstream error</html>")
                    path == "/graphql" -> {
                        val body = request.body.readUtf8()
                        if (body.contains("matchedUser")) {
                            val stats = if (missingSolved) "" else """, "submitStats":{"acSubmissionNum":[{"difficulty":"All","count":42}]}"""
                            json("""{"data":{"matchedUser":{"username":"sample"$stats}}}""")
                        } else if (graphQlError) json("""{"data":{"userContestRanking":null},"errors":[{"message":"unavailable"}]}""")
                        else json("""{"data":{"userContestRanking":null,"userContestRankingHistory":[]}}""")
                    }
                    else -> MockResponse().setResponseCode(404)
                }
            }
        }
        server.start()
        // Route absolute AtCoder URLs to this server as well; no test contacts a live service.
        val client = OkHttpClient.Builder().addInterceptor { chain ->
            val url = chain.request().url.newBuilder().scheme("http").host(server.hostName).port(server.port).build()
            chain.proceed(chain.request().newBuilder().url(url).build())
        }.build()
        val retrofit = Retrofit.Builder().baseUrl(server.url("/" )).client(client)
            .addConverterFactory(Json { ignoreUnknownKeys = true }.asConverterFactory("application/json".toMediaType())).build()
        leetcode = retrofit.create(LeetCodeApi::class.java)
        fetcher = ProfileFetcher(retrofit.create(CodeforcesApi::class.java), leetcode,
            retrofit.create(CodeChefApi::class.java), retrofit.create(KenkooooAtCoderApi::class.java))
    }

    @After fun teardown() = server.shutdown()

    @Test fun `Codeforces successful snapshot counts distinct solved problems`() = runBlocking {
        val profile = fetcher.fetch(Platform.CODEFORCES, "sample")
        assertEquals(1700, profile.rating)
        assertEquals(1, profile.problemsSolved)
    }

    @Test fun `Codeforces rate limit is not confused with an unknown handle`() = runBlocking {
        assertTrue(runCatching { fetcher.fetch(Platform.CODEFORCES, "limited") }.exceptionOrNull() is HttpException)
        assertTrue(runCatching { fetcher.fetch(Platform.CODEFORCES, "missing") }.exceptionOrNull() is UserNotFoundException)
    }

    @Test fun `partial HTTP failure does not erase cached counts or metadata`() = runBlocking {
        val old = ProfileEntity("codeforces-failing", "codeforces", "failing", rating = 1600,
            problemsSolved = 500, totalContests = 25, totalSubmissions = 900, badges = "imported", displayOrder = 3)
        val good = old.copy(id = "codeforces-good", username = "good", displayOrder = 1)
        val dao = MemoryProfiles(listOf(old, good))
        failHandle = "failing"
        val result = ProfileRepositoryImpl(dao, fetcher, leetcode).refreshProfiles()
        assertTrue(result.isFailure)
        assertEquals(old, dao.rows[old.id])
        val updated = dao.rows.getValue(good.id)
        assertEquals(1700, updated.rating)
        assertEquals(1, updated.problemsSolved)
        assertEquals(1, updated.displayOrder)
        assertEquals(900, updated.totalSubmissions)
        assertEquals("imported", updated.badges)
    }

    @Test fun `unrated LeetCode profile remains valid`() = runBlocking {
        val profile = fetcher.fetch(Platform.LEETCODE, "sample")
        assertNull(profile.rating)
        assertEquals(42, profile.problemsSolved)
    }

    @Test fun `GraphQL partial errors fail instead of resetting rating`() = runBlocking {
        graphQlError = true
        assertTrue(runCatching { fetcher.fetch(Platform.LEETCODE, "sample") }.isFailure)
    }

    @Test fun `missing LeetCode solved fields fail instead of resetting counts`() = runBlocking {
        missingSolved = true
        assertTrue(runCatching { fetcher.fetch(Platform.LEETCODE, "sample") }.isFailure)
    }

    @Test fun `AtCoder count outage is not a zero solved snapshot`() = runBlocking {
        failAtCoder = true
        assertTrue(runCatching { fetcher.fetch(Platform.ATCODER, "sample") }.exceptionOrNull() is HttpException)
    }

    @Test fun `CodeChef outage is not reported as missing user`() = runBlocking {
        for (status in listOf(403, 429, 503)) {
            codeChefStatus = status
            val error = runCatching { fetcher.fetch(Platform.CODECHEF, "sample") }.exceptionOrNull()
            assertTrue("HTTP $status", error is HttpException)
            assertFalse(error is UserNotFoundException)
        }
        codeChefStatus = 404
        assertTrue(runCatching { fetcher.fetch(Platform.CODECHEF, "sample") }.exceptionOrNull() is UserNotFoundException)
    }

    @Test fun `CodeChef challenge HTML is a temporary failure`() = runBlocking {
        val error = runCatching { fetcher.fetch(Platform.CODECHEF, "sample") }.exceptionOrNull()
        assertTrue(error is IllegalStateException)
        assertFalse(error is UserNotFoundException)
    }

    private class MemoryProfiles(initial: List<ProfileEntity>) : ProfileDao {
        val rows = initial.associateBy { it.id }.toMutableMap()
        override fun getAllProfiles() = flowOf(rows.values.toList())
        override suspend fun getProfileById(id: String) = rows[id]
        override suspend fun upsertProfile(profile: ProfileEntity) { rows[profile.id] = profile }
        override suspend fun upsertProfiles(profiles: List<ProfileEntity>) { profiles.forEach { upsertProfile(it) } }
        override suspend fun deleteProfile(id: String) { rows.remove(id) }
        override suspend fun updateProfiles(profiles: List<ProfileEntity>) = upsertProfiles(profiles)
        override suspend fun insertIfAbsent(profiles: List<ProfileEntity>) { profiles.forEach { rows.putIfAbsent(it.id, it) } }
    }
}
