package com.meet11.krono.core.util

import android.content.Context
import android.text.format.DateFormat
import androidx.compose.runtime.Composable
import androidx.compose.runtime.State
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.Locale

/**
 * A clock that ticks every [intervalMs], aligned to the interval boundary so all
 * countdowns on screen flip in sync. Read it only inside the composable that renders
 * the time so recomposition stays local to that text.
 */
@Composable
fun rememberNow(intervalMs: Long = 1_000L): State<Long> =
    produceState(initialValue = System.currentTimeMillis(), intervalMs) {
        while (true) {
            val now = System.currentTimeMillis()
            value = now
            delay(intervalMs - (now % intervalMs))
        }
    }

/** Split remaining milliseconds into d / h / m / s. */
data class Remaining(val days: Long, val hours: Long, val minutes: Long, val seconds: Long) {
    companion object {
        fun of(ms: Long): Remaining {
            val total = (ms.coerceAtLeast(0L)) / 1000L
            return Remaining(total / 86_400, (total % 86_400) / 3_600, (total % 3_600) / 60, total % 60)
        }
    }
}

/** Compact countdown: "3d 4h", "4h 12m", "12:04", "0:09". */
fun formatCountdownShort(ms: Long): String {
    val r = Remaining.of(ms)
    return when {
        r.days > 0 -> "${r.days}d ${r.hours}h"
        r.hours > 0 -> "${r.hours}h ${r.minutes.pad()}m"
        else -> "${r.minutes}:${r.seconds.pad()}"
    }
}

/** Clock-style countdown: "1:04:09" or "04:09". Days are folded into hours. */
fun formatClock(ms: Long): String {
    val r = Remaining.of(ms)
    val h = r.days * 24 + r.hours
    return if (h > 0) "$h:${r.minutes.pad()}:${r.seconds.pad()}" else "${r.minutes.pad()}:${r.seconds.pad()}"
}

fun formatDuration(ms: Long): String {
    val totalMin = ms / 60_000L
    val d = totalMin / (60 * 24)
    val h = (totalMin % (60 * 24)) / 60
    val m = totalMin % 60
    return when {
        d > 0 && h > 0 -> "${d}d ${h}h"
        d > 0 -> "${d}d"
        h > 0 && m > 0 -> "${h}h ${m}m"
        h > 0 -> "${h}h"
        else -> "${m}m"
    }
}

private fun Long.pad() = toString().padStart(2, '0')

/** Locale/zone-aware formatters, cached per composition (they're not cheap to build). */
class KronoTimeFormatter(context: Context) {
    private val zone: ZoneId = ZoneId.systemDefault()
    private val locale: Locale = Locale.getDefault()
    private val is24h = DateFormat.is24HourFormat(context)
    private val timeFmt = DateTimeFormatter.ofPattern(if (is24h) "HH:mm" else "h:mm a", locale)
    private val dateFmt = DateTimeFormatter.ofPattern("EEE d MMM", locale)
    private val headerFmt = DateTimeFormatter.ofPattern("EEEE, d MMMM", locale)
    private val monthYearFmt = DateTimeFormatter.ofPattern("MMM yyyy", locale)

    fun time(ms: Long): String = timeFmt.format(Instant.ofEpochMilli(ms).atZone(zone))

    /** "Today", "Tomorrow" or "Thu 6 Nov". */
    fun relativeDay(ms: Long): String {
        val day = Instant.ofEpochMilli(ms).atZone(zone).toLocalDate()
        return when (ChronoUnit.DAYS.between(LocalDate.now(zone), day)) {
            0L -> "Today"
            1L -> "Tomorrow"
            -1L -> "Yesterday"
            else -> dateFmt.format(day)
        }
    }

    fun dayAndTime(ms: Long): String = "${relativeDay(ms)} · ${time(ms)}"

    fun header(ms: Long = System.currentTimeMillis()): String =
        headerFmt.format(Instant.ofEpochMilli(ms).atZone(zone))

    fun monthYear(ms: Long): String = monthYearFmt.format(Instant.ofEpochMilli(ms).atZone(zone))

    fun shortDate(ms: Long): String = dateFmt.format(Instant.ofEpochMilli(ms).atZone(zone))
}

@Composable
fun rememberTimeFormatter(): KronoTimeFormatter {
    val context = LocalContext.current
    return remember(context) { KronoTimeFormatter(context) }
}
