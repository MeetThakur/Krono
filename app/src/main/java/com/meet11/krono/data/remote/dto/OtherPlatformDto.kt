package com.meet11.krono.data.remote.dto

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class CodeChefContestListResponse(
    val status: String? = null,
    @SerialName("present_contests") val presentContests: List<CodeChefContestDto>? = null,
    @SerialName("future_contests") val futureContests: List<CodeChefContestDto>? = null
)

@Serializable
data class CodeChefContestDto(
    @SerialName("contest_code") val contestCode: String,
    @SerialName("contest_name") val contestName: String,
    @SerialName("contest_start_date") val contestStartDate: String? = null,
    @SerialName("contest_end_date") val contestEndDate: String? = null,
    @SerialName("contest_start_date_iso") val contestStartDateIso: String? = null,
    @SerialName("contest_end_date_iso") val contestEndDateIso: String? = null,
    @SerialName("contest_duration") val contestDuration: String? = null
)

@Serializable
data class AtCoderContestDto(
    val id: String,
    @SerialName("start_epoch_second") val startEpochSecond: Long,
    @SerialName("duration_second") val durationSecond: Long,
    val title: String,
    @SerialName("rate_change") val rateChange: String? = null
)
