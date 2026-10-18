package com.meet11.krono.data.remote.api

import com.meet11.krono.data.remote.dto.CodeforcesContestDto
import com.meet11.krono.data.remote.dto.CodeforcesRatingChangeDto
import com.meet11.krono.data.remote.dto.CodeforcesResponse
import com.meet11.krono.data.remote.dto.CodeforcesSubmissionDto
import com.meet11.krono.data.remote.dto.CodeforcesUserDto
import retrofit2.http.GET
import retrofit2.http.Query

interface CodeforcesApi {
    @GET("user.info")
    suspend fun getUserInfo(@Query("handles") handles: String): CodeforcesResponse<List<CodeforcesUserDto>>

    @GET("user.rating")
    suspend fun getUserRating(@Query("handle") handle: String): CodeforcesResponse<List<CodeforcesRatingChangeDto>>

    @GET("user.status")
    suspend fun getUserSubmissions(
        @Query("handle") handle: String,
        @Query("from") from: Int = 1,
        @Query("count") count: Int = 50
    ): CodeforcesResponse<List<CodeforcesSubmissionDto>>

    @GET("contest.list")
    suspend fun getContestList(@Query("gym") gym: Boolean = false): CodeforcesResponse<List<CodeforcesContestDto>>
}
