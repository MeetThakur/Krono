package com.meet11.krono.data.remote.api

import com.meet11.krono.data.remote.dto.AtCoderAcRankDto
import com.meet11.krono.data.remote.dto.AtCoderContestDto
import com.meet11.krono.data.remote.dto.AtCoderHistoryDto
import com.meet11.krono.data.remote.dto.CodeChefContestListResponse
import okhttp3.ResponseBody
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Url

interface CodeChefApi {
    @GET("api/list/contests/all")
    @Headers("User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    suspend fun getContests(
        @Query("sort_by") sortBy: String = "START",
        @Query("sorting_order") sortingOrder: String = "asc",
        @Query("offset") offset: Int = 0,
        @Query("mode") mode: String = "all"
    ): CodeChefContestListResponse

    @GET("users/{handle}")
    @Headers(
        "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept: text/html"
    )
    suspend fun getUserProfilePage(
        @Path("handle") handle: String
    ): ResponseBody
}

interface KenkooooAtCoderApi {
    @GET("resources/contests.json")
    suspend fun getContests(): List<AtCoderContestDto>

    /** Accepted-problem count for a user. */
    @GET("v3/user/ac_rank")
    suspend fun getAcRank(@Query("user") user: String): AtCoderAcRankDto

    /** AtCoder's own rating history JSON (absolute URL, so the base URL is ignored). 404 means no such user. */
    @GET
    suspend fun getHistory(@Url url: String): List<AtCoderHistoryDto>

    /** The official contests page, which is the only place upcoming rounds are listed. */
    @GET
    suspend fun getContestsPage(@Url url: String): ResponseBody
}
