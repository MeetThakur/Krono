package com.meet11.krono.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class CodeforcesResponse<T>(
    val status: String,
    val result: T? = null,
    val comment: String? = null
)

@Serializable
data class CodeforcesUserDto(
    val handle: String,
    val rating: Int? = null,
    val maxRating: Int? = null,
    val rank: String? = null,
    val maxRank: String? = null,
    val titlePhoto: String? = null,
    val avatar: String? = null,
    val firstName: String? = null,
    val lastName: String? = null
)

@Serializable
data class CodeforcesRatingChangeDto(
    val contestId: Int,
    val contestName: String,
    val handle: String,
    val rank: Int,
    val ratingUpdateTimeSeconds: Long,
    val oldRating: Int,
    val newRating: Int
)

@Serializable
data class CodeforcesSubmissionDto(
    val id: Long,
    val contestId: Int? = null,
    val creationTimeSeconds: Long,
    val verdict: String? = null
)

@Serializable
data class CodeforcesContestDto(
    val id: Int,
    val name: String,
    val type: String? = null,
    val phase: String, // "BEFORE", "CODING", "FINISHED"
    val frozen: Boolean? = null,
    val durationSeconds: Long,
    val startTimeSeconds: Long? = null,
    val relativeTimeSeconds: Long? = null
)
