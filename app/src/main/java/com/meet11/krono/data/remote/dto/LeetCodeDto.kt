package com.meet11.krono.data.remote.dto

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

@Serializable
data class GraphQLRequest(
    val query: String,
    val variables: JsonObject? = null
)

@Serializable
data class GraphQLResponse<T>(
    val data: T? = null,
    val errors: List<GraphQLError>? = null
)

@Serializable
data class GraphQLError(
    val message: String
)

@Serializable
data class LeetCodeUserData(
    val matchedUser: LeetCodeMatchedUser? = null
)

@Serializable
data class LeetCodeMatchedUser(
    val username: String,
    val profile: LeetCodeUserProfileDto? = null,
    val submitStats: LeetCodeSubmitStatsDto? = null,
    val userCalendar: LeetCodeCalendarDto? = null
)

@Serializable
data class LeetCodeUserProfileDto(
    val realName: String? = null,
    val userAvatar: String? = null,
    val ranking: Int? = null
)

@Serializable
data class LeetCodeSubmitStatsDto(
    val acSubmissionNum: List<LeetCodeSubmissionCountDto>? = null
)

@Serializable
data class LeetCodeSubmissionCountDto(
    val difficulty: String,
    val count: Int
)

@Serializable
data class LeetCodeCalendarDto(
    val submissionCalendar: String? = null
)

@Serializable
data class LeetCodeContestData(
    val userContestRanking: LeetCodeContestRankingDto? = null,
    val userContestRankingHistory: List<LeetCodeContestHistoryDto>? = null,
    val topTwoContests: List<LeetCodeUpcomingContestDto>? = null
)

@Serializable
data class LeetCodeContestRankingDto(
    val attendedContestsCount: Int? = null,
    val rating: Double? = null,
    val globalRanking: Int? = null,
    val topPercentage: Double? = null
)

@Serializable
data class LeetCodeContestHistoryDto(
    val attended: Boolean,
    val rating: Double? = null,
    val ranking: Int? = null,
    val contest: LeetCodeContestInfoDto? = null
)

@Serializable
data class LeetCodeContestInfoDto(
    val title: String,
    val startTime: Long
)

@Serializable
data class LeetCodeUpcomingContestDto(
    val title: String,
    val titleSlug: String,
    val startTime: Long,
    val duration: Long
)

@Serializable
data class LeetCodePotdData(
    val activeDailyCodingChallengeQuestion: LeetCodeDailyQuestionDto? = null
)

@Serializable
data class LeetCodeDailyQuestionDto(
    val date: String? = null,
    val link: String? = null,
    val question: LeetCodeQuestionDetailDto? = null
)

@Serializable
data class LeetCodeQuestionDetailDto(
    val title: String? = null,
    val difficulty: String? = null
)
