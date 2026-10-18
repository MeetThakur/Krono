package com.meet11.krono.data.remote.api

import com.meet11.krono.data.remote.dto.GraphQLRequest
import com.meet11.krono.data.remote.dto.GraphQLResponse
import com.meet11.krono.data.remote.dto.LeetCodeContestData
import com.meet11.krono.data.remote.dto.LeetCodePotdData
import com.meet11.krono.data.remote.dto.LeetCodeUserData
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST

interface LeetCodeApi {
    @POST("graphql")
    @Headers("Content-Type: application/json")
    suspend fun getUserProfile(@Body request: GraphQLRequest): GraphQLResponse<LeetCodeUserData>

    @POST("graphql")
    @Headers("Content-Type: application/json")
    suspend fun getContestData(@Body request: GraphQLRequest): GraphQLResponse<LeetCodeContestData>

    @POST("graphql")
    @Headers("Content-Type: application/json")
    suspend fun getPotd(@Body request: GraphQLRequest): GraphQLResponse<LeetCodePotdData>
}
