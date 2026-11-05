package com.meet11.krono.domain.model

data class RatingPoint(
    val timestamp: Long,
    val rating: Int,
    val contestName: String? = null
)
