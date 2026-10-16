package com.meet11.krono.core.designsystem

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.CalendarContract
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.NotificationsNone
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.domain.model.Contest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun ContestCard(
    contest: Contest,
    onToggleReminder: (Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val cardShape = RoundedCornerShape(24.dp)

    val now = System.currentTimeMillis()
    val end = if (contest.endTime > 0L) contest.endTime else (contest.startTime + (contest.durationSeconds ?: 0L) * 1000L)
    val isLive = contest.phase == com.meet11.krono.domain.model.ContestPhase.CODING || contest.isLive || (contest.startTime <= now && now <= end)

    val borderColor = if (isLive) Color(0x73EF4444) else Color(0x1FFFFFFF)

    val dateFormat = SimpleDateFormat("MMM d, HH:mm", Locale.US)
    val dateStr = dateFormat.format(Date(contest.startTime))

    val durationSec = contest.durationSeconds ?: ((end - contest.startTime) / 1000L).coerceAtLeast(0L)
    val hours = durationSec / 3600
    val minutes = (durationSec % 3600) / 60
    val durationStr = if (hours > 0 && minutes > 0) "${hours}h ${minutes}m"
    else if (hours > 0) "${hours}h"
    else "${minutes}m"

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(cardShape)
            .background(Color(0xFF16181F))
            .border(1.dp, borderColor, cardShape)
            .clickable {
                if (!contest.url.isNullOrBlank()) {
                    runCatching {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(contest.url)))
                    }
                }
            }
            .padding(18.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 1. Top Row: Platform Badge + Date/Live Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Platform Badge: Dot + Name
                Row(
                    modifier = Modifier
                        .clip(PillShape)
                        .background(Color(0x14FFFFFF))
                        .padding(horizontal = 10.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(contest.platform.brandColor)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = contest.platform.displayName.uppercase(),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xB3FFFFFF),
                        letterSpacing = 0.5.sp
                    )
                }

                // Live Now or Date Chip
                if (isLive) {
                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(Color(0x26EF4444))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(Color(0xFFEF4444))
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "LIVE NOW",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFFEF4444),
                            letterSpacing = 0.5.sp
                        )
                    }
                } else {
                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(Color(0x14FFFFFF))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.CalendarMonth,
                            contentDescription = null,
                            tint = Color(0xB3FFFFFF),
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = dateStr,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xB3FFFFFF),
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            // 2. Contest Title
            Text(
                text = contest.name,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black,
                color = Color.White,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 22.sp
            )

            // 3. Footer Row: Duration + Calendar + Reminder + Open
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Duration Pill
                Row(
                    modifier = Modifier
                        .clip(PillShape)
                        .background(Color(0x0FFFFFFF))
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Schedule,
                        contentDescription = null,
                        tint = Color(0x99FFFFFF),
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = durationStr,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0x99FFFFFF)
                    )
                }

                // Action Buttons
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Calendar Export Icon Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(Color(0x14FFFFFF))
                            .border(1.dp, Color(0x1FFFFFFF), CircleShape)
                            .clickable { exportToCalendar(context, contest) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.CalendarMonth,
                            contentDescription = "Add to Calendar",
                            tint = Color(0xB3FFFFFF),
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    // Reminder Bell Icon Button
                    val bellBg = if (contest.reminderSet) Color(0x2EFFFFFF) else Color(0x14FFFFFF)
                    val bellBorder = if (contest.reminderSet) Color.White else Color(0x1FFFFFFF)
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(bellBg)
                            .border(1.dp, bellBorder, CircleShape)
                            .clickable { onToggleReminder(contest.reminderSet) },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (contest.reminderSet) Icons.Rounded.Notifications else Icons.Rounded.NotificationsNone,
                            contentDescription = "Toggle Reminder",
                            tint = if (contest.reminderSet) Color.White else Color(0xB3FFFFFF),
                            modifier = Modifier.size(16.dp)
                        )
                    }

                    // Open White Button
                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(Color.White)
                            .clickable {
                                if (!contest.url.isNullOrBlank()) {
                                    runCatching {
                                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(contest.url)))
                                    }
                                }
                            }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Open",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.OpenInNew,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(13.dp)
                        )
                    }
                }
            }
        }
    }
}

private fun exportToCalendar(context: Context, contest: Contest) {
    runCatching {
        val intent = Intent(Intent.ACTION_INSERT).apply {
            data = CalendarContract.Events.CONTENT_URI
            putExtra(CalendarContract.Events.TITLE, contest.name)
            putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, contest.startTime)
            val endTimeMs = if (contest.endTime > 0L) contest.endTime else (contest.startTime + (contest.durationSeconds ?: 0L) * 1000L)
            putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endTimeMs)
            putExtra(CalendarContract.Events.DESCRIPTION, "Competitive Programming Contest on ${contest.platform.displayName}: ${contest.url ?: ""}")
        }
        context.startActivity(intent)
    }
}
