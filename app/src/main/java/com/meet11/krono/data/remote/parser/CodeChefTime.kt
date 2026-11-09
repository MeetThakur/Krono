package com.meet11.krono.data.remote.parser

import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset

/**
 * CodeChef returns contest times as ISO strings with an explicit offset
 * (e.g. `2026-11-11T20:00:00+05:30`). Parsing them as UTC, as the app used to, shifted every
 * contest by 5.5 hours, so the offset has to be honoured. Offset-less values are IST.
 */
object CodeChefTime {
    private val IST: ZoneId = ZoneOffset.ofHoursMinutes(5, 30)

    fun parseMillis(iso: String?): Long? {
        val text = iso?.trim().orEmpty()
        if (text.isEmpty()) return null
        return runCatching { OffsetDateTime.parse(text).toInstant().toEpochMilli() }.getOrNull()
            ?: runCatching { LocalDateTime.parse(text).atZone(IST).toInstant().toEpochMilli() }.getOrNull()
    }
}
