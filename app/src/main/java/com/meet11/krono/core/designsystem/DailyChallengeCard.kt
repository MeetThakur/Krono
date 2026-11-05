package com.meet11.krono.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import java.text.NumberFormat

@Composable
fun DailyChallengeCard(
    potd: Potd?,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val c = Krono.colors
    val url = potd?.url ?: "https://leetcode.com/problemset/"

    KronoCard(
        modifier = modifier.fillMaxWidth(),
        onClick = { openUrl(context, url) },
        contentPadding = PaddingValues(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PlatformMark(Platform.LEETCODE, size = 40.dp)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Caption("Problem of the day")
                    if (potd != null) {
                        Spacer(Modifier.width(8.dp))
                        val tone = when (potd.difficulty.lowercase()) {
                            "easy" -> TagTone.Success
                            "hard" -> TagTone.Live
                            else -> TagTone.Warning
                        }
                        Tag(potd.difficulty, tone = tone)
                    }
                }
                Spacer(Modifier.height(4.dp))
                Text(
                    text = when {
                        potd != null -> potd.title
                        isLoading -> "Fetching today's problem…"
                        else -> "Open the LeetCode problem set"
                    },
                    style = MaterialTheme.typography.titleSmall,
                    color = if (potd != null) c.textPrimary else c.textSecondary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
            Spacer(Modifier.width(8.dp))
            Icon(
                Icons.AutoMirrored.Rounded.ArrowForward,
                contentDescription = "Solve",
                tint = c.textSecondary,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}

data class StatItem(val label: String, val value: Int?)

/** Single card with evenly split, hairline-separated stats. */
@Composable
fun StatsStrip(items: List<StatItem>, modifier: Modifier = Modifier) {
    val c = Krono.colors
    val numbers = NumberFormat.getIntegerInstance()
    KronoCard(modifier = modifier.fillMaxWidth(), contentPadding = PaddingValues(vertical = 16.dp)) {
        Row(Modifier.fillMaxWidth().height(IntrinsicSize.Min), horizontalArrangement = Arrangement.SpaceEvenly) {
            items.forEachIndexed { index, item ->
                if (index > 0) VerticalHairline(Modifier.fillMaxHeight())
                Column(Modifier.weight(1f).padding(horizontal = 16.dp)) {
                    Text(
                        text = item.value?.let { numbers.format(it) } ?: "—",
                        style = Readout.medium,
                        color = c.textPrimary,
                        maxLines = 1
                    )
                    Spacer(Modifier.height(2.dp))
                    Caption(item.label)
                }
            }
        }
    }
}
