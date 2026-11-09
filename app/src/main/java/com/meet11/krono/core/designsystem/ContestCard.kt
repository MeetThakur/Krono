package com.meet11.krono.core.designsystem

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.CalendarContract
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.EventAvailable
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.NotificationsNone
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.util.Remaining
import com.meet11.krono.core.util.formatClock
import com.meet11.krono.core.util.formatCountdownShort
import com.meet11.krono.core.util.formatDuration
import com.meet11.krono.core.util.rememberNow
import com.meet11.krono.core.util.rememberTimeFormatter
import com.meet11.krono.domain.model.Contest

/** Full contest card used on the Contests tab. */
@Composable
fun ContestCard(
    contest: Contest,
    onToggleReminder: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val c = Krono.colors
    val fmt = rememberTimeFormatter()
    // Far-off contests only need a coarse tick; the last day counts down by the second.
    val tickMs = if (contest.startTime - System.currentTimeMillis() < 86_400_000L) 1_000L else 30_000L
    val now by rememberNow(tickMs)
    val live = contest.isLiveAt(now)

    KronoCard(
        modifier = modifier.fillMaxWidth(),
        color = if (live) tintFill(c.coral) else platformTint(contest.platform),
        onClick = { openUrl(context, contest.url) },
        borderColor = tintEdge(if (live) c.coral else platformPastel(contest.platform)),
        contentPadding = PaddingValues(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PlatformMark(contest.platform, size = 34.dp)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(contest.platform.displayName, style = MaterialTheme.typography.labelMedium, color = c.onTint.copy(alpha = 0.75f))
                Text(
                    text = if (live) "Ends ${fmt.time(contest.effectiveEndTime)}" else fmt.dayAndTime(contest.startTime),
                    style = Readout.tiny,
                    color = c.onTint.copy(alpha = 0.65f)
                )
            }
            if (live) {
                Tag("Live", tone = TagTone.Accent, pulse = true)
            } else {
                Tag(formatDuration(contest.durationMillis), uppercase = false)
            }
        }

        Spacer(Modifier.height(14.dp))
        Text(
            text = contest.name,
            style = MaterialTheme.typography.titleMedium,
            color = c.onTint,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(Modifier.height(14.dp))

        if (live) {
            val elapsed = (now - contest.startTime).toFloat() / contest.durationMillis.coerceAtLeast(1L)
            ProgressTrack(progress = elapsed, color = c.onTint)
            Spacer(Modifier.height(14.dp))
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Caption(if (live) "Time left" else "Starts in", color = c.onTint.copy(alpha = 0.65f))
                Spacer(Modifier.height(2.dp))
                val remaining = if (live) contest.effectiveEndTime - now else contest.startTime - now
                Text(
                    text = if (live || remaining < 86_400_000L) formatClock(remaining) else formatCountdownShort(remaining),
                    style = Readout.medium,
                    color = c.onTint
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (!live) {
                    IconAction(
                        icon = Icons.Rounded.EventAvailable,
                        contentDescription = "Add to calendar",
                        onClick = { exportToCalendar(context, contest) }
                    )
                    IconAction(
                        icon = if (contest.reminderSet) Icons.Rounded.Notifications else Icons.Rounded.NotificationsNone,
                        contentDescription = if (contest.reminderSet) "Cancel reminder" else "Set reminder",
                        active = contest.reminderSet,
                        onClick = onToggleReminder
                    )
                }
                IconAction(
                    icon = Icons.AutoMirrored.Rounded.OpenInNew,
                    contentDescription = "Open contest page",
                    onClick = { openUrl(context, contest.url) }
                )
            }
        }
    }
}

/** Compact row used in lists on Home. */
@Composable
fun ContestRow(
    contest: Contest,
    onToggleReminder: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val c = Krono.colors
    val fmt = rememberTimeFormatter()

    Row(
        modifier = modifier
            .fillMaxWidth()
            .pressable(pressedScale = 0.99f, shape = com.meet11.krono.core.theme.TileShape) { openUrl(context, contest.url) }
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        PlatformMark(contest.platform, size = 36.dp)
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            // Two lines: names like "Round 1133 (Div. 1)" vs "(Div. 2)" differ only at the end.
            Text(
                contest.name,
                style = MaterialTheme.typography.titleSmall,
                color = c.textPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.height(2.dp))
            Text(fmt.dayAndTime(contest.startTime), style = Readout.tiny, color = c.textTertiary, maxLines = 1)
        }
        Spacer(Modifier.width(10.dp))
        CountdownText(targetMs = contest.startTime)
        Spacer(Modifier.width(10.dp))
        IconAction(
            icon = if (contest.reminderSet) Icons.Rounded.Notifications else Icons.Rounded.NotificationsNone,
            contentDescription = if (contest.reminderSet) "Cancel reminder" else "Set reminder",
            active = contest.reminderSet,
            onClick = onToggleReminder,
            size = 34.dp,
            iconSize = 16.dp
        )
    }
}

/** Self-ticking short countdown. Only this Text recomposes each tick. */
@Composable
fun CountdownText(targetMs: Long, modifier: Modifier = Modifier) {
    val now by rememberNow(if (targetMs - System.currentTimeMillis() < 3_600_000L) 1_000L else 30_000L)
    Text(
        text = formatCountdownShort(targetMs - now),
        style = Readout.small,
        color = Krono.colors.textSecondary,
        modifier = modifier,
        maxLines = 1
    )
}

/**
 * The signature element: a chronograph readout counting down to the next contest
 * (or to the end of a running one).
 */
@Composable
fun NextContestHero(
    contest: Contest,
    onToggleReminder: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val c = Krono.colors
    val fmt = rememberTimeFormatter()
    val now by rememberNow(1_000L)
    val live = contest.isLiveAt(now)
    val remaining = Remaining.of(if (live) contest.effectiveEndTime - now else contest.startTime - now)

    KronoCard(
        modifier = modifier.fillMaxWidth(),
        color = tintFill(if (live) c.coral else c.butter),
        onClick = { openUrl(context, contest.url) },
        borderColor = tintEdge(if (live) c.coral else c.butter),
        contentPadding = PaddingValues(20.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (live) Tag("Live now", tone = TagTone.Accent, pulse = true)
            else Tag("Next contest", tone = TagTone.Accent)
            Spacer(Modifier.weight(1f))
            Text(contest.platform.displayName, style = MaterialTheme.typography.labelMedium, color = c.onTint.copy(alpha = 0.75f))
            Spacer(Modifier.width(6.dp))
            Dot(contest.platform.brandColor, 7.dp)
        }

        Spacer(Modifier.height(16.dp))
        Text(
            text = contest.name,
            style = MaterialTheme.typography.titleLarge,
            color = c.onTint,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(Modifier.height(4.dp))
        Text(
            text = if (live) "Ends ${fmt.dayAndTime(contest.effectiveEndTime)}"
            else "${fmt.dayAndTime(contest.startTime)} · ${formatDuration(contest.durationMillis)}",
            style = Readout.tiny,
            color = c.onTint.copy(alpha = 0.65f)
        )

        Spacer(Modifier.height(20.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            val digitColor = c.onTint
            ClockUnit(remaining.days, "days", digitColor, dim = remaining.days == 0L)
            ClockSeparator()
            ClockUnit(remaining.hours, "hrs", digitColor, dim = remaining.days == 0L && remaining.hours == 0L)
            ClockSeparator()
            ClockUnit(remaining.minutes, "min", digitColor)
            ClockSeparator()
            ClockUnit(remaining.seconds, "sec", c.onTint, animate = true)
        }

        if (live) {
            Spacer(Modifier.height(16.dp))
            val elapsed = (now - contest.startTime).toFloat() / contest.durationMillis.coerceAtLeast(1L)
            ProgressTrack(progress = elapsed, color = c.onTint)
        }

        Spacer(Modifier.height(18.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            KronoButton(
                text = if (live) "Enter contest" else "Open",
                onClick = { openUrl(context, contest.url) },
                style = if (live) ButtonStyle.Inverse else ButtonStyle.Inverse,
                trailingIcon = Icons.AutoMirrored.Rounded.OpenInNew,
                modifier = Modifier.weight(1f),
                height = 44.dp
            )
            if (!live) {
                IconAction(
                    icon = Icons.Rounded.EventAvailable,
                    contentDescription = "Add to calendar",
                    onClick = { exportToCalendar(context, contest) },
                    size = 44.dp
                )
                IconAction(
                    icon = if (contest.reminderSet) Icons.Rounded.Notifications else Icons.Rounded.NotificationsNone,
                    contentDescription = if (contest.reminderSet) "Cancel reminder" else "Set reminder",
                    active = contest.reminderSet,
                    onClick = onToggleReminder,
                    size = 44.dp
                )
            }
        }
    }
}

@Composable
private fun ClockUnit(
    value: Long,
    label: String,
    color: androidx.compose.ui.graphics.Color,
    dim: Boolean = false,
    animate: Boolean = false
) {
    val c = Krono.colors
    Column(horizontalAlignment = Alignment.Start) {
        val text = value.toString().padStart(2, '0')
        val tint = if (dim) c.onTint.copy(alpha = 0.4f) else color
        if (animate) {
            AnimatedContent(
                targetState = text,
                transitionSpec = {
                    (slideInVertically(tween(220)) { -it / 2 } + fadeIn(tween(220))) togetherWith
                        (slideOutVertically(tween(220)) { it / 2 } + fadeOut(tween(160)))
                },
                label = "sec"
            ) { t -> Text(t, style = Readout.hero, color = tint) }
        } else {
            Text(text, style = Readout.hero, color = tint)
        }
        Text(label.uppercase(), style = Readout.caption, color = c.onTint.copy(alpha = 0.65f))
    }
}

@Composable
private fun ClockSeparator() {
    Text(
        ":",
        style = Readout.hero,
        color = Krono.colors.ink.copy(alpha = 0.5f),
        modifier = Modifier.padding(horizontal = 4.dp).padding(bottom = 14.dp)
    )
}

fun openUrl(context: Context, url: String?) {
    if (url.isNullOrBlank()) return
    runCatching {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }
}

fun exportToCalendar(context: Context, contest: Contest) {
    runCatching {
        val intent = Intent(Intent.ACTION_INSERT).apply {
            data = CalendarContract.Events.CONTENT_URI
            putExtra(CalendarContract.Events.TITLE, contest.name)
            putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, contest.startTime)
            putExtra(CalendarContract.EXTRA_EVENT_END_TIME, contest.effectiveEndTime)
            putExtra(CalendarContract.Events.EVENT_LOCATION, contest.url ?: contest.platform.displayName)
            putExtra(CalendarContract.Events.DESCRIPTION, "${contest.platform.displayName} contest · ${contest.url.orEmpty()}")
        }
        context.startActivity(intent)
    }
}
