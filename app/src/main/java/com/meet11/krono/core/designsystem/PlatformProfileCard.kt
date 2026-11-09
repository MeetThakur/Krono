package com.meet11.krono.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.domain.model.Profile
import java.text.NumberFormat

private val CardWidth = 244.dp
private val CardHeight = 164.dp

@Composable
fun PlatformProfileCard(
    profile: Profile,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val c = Krono.colors
    val numbers = NumberFormat.getIntegerInstance()
    val hasRating = profile.rating != null && profile.rating > 0

    KronoCard(
        modifier = modifier
            .width(CardWidth)
            .height(CardHeight),
        onClick = onClick,
        color = platformTint(profile.platform),
        borderColor = tintEdge(platformPastel(profile.platform)),
        contentPadding = PaddingValues(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            PlatformMark(profile.platform, size = 30.dp)
            Spacer(Modifier.width(10.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    "@${profile.username}",
                    style = MaterialTheme.typography.titleSmall,
                    color = c.onTint,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    profile.rank?.replaceFirstChar { it.uppercase() } ?: profile.platform.displayName,
                    style = MaterialTheme.typography.labelSmall,
                    color = c.onTint.copy(alpha = 0.65f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }

        Spacer(Modifier.weight(1f))

        Caption(if (hasRating) "Rating" else "Solved", color = c.onTint.copy(alpha = 0.65f))
        Row(verticalAlignment = Alignment.Bottom) {
            Text(
                text = if (hasRating) profile.rating.toString() else numbers.format(profile.problemsSolved),
                style = Readout.large,
                color = c.onTint,
                maxLines = 1
            )
            val peak = profile.maxRating
            if (hasRating && peak != null && peak > 0) {
                Spacer(Modifier.width(8.dp))
                Text(
                    "peak $peak",
                    style = Readout.tiny,
                    color = c.onTint.copy(alpha = 0.65f),
                    modifier = Modifier.padding(bottom = 5.dp)
                )
            }
        }
        Spacer(Modifier.height(10.dp))
        Box(
            Modifier
                .width(36.dp)
                .height(5.dp)
                .clip(RoundedCornerShape(3.dp))
                .background(c.onTint)
        )
    }
}

/** Dashed-feel "add" tile appended to the profile carousel. */
@Composable
fun AddProfileTile(onClick: () -> Unit, modifier: Modifier = Modifier, compact: Boolean = true) {
    val c = Krono.colors
    KronoCard(
        modifier = modifier
            .width(if (compact) 120.dp else CardWidth)
            .height(CardHeight),
        onClick = onClick,
        color = c.surfaceSunken,
        contentPadding = PaddingValues(16.dp)
    ) {
        Box(Modifier.size(30.dp).clip(RoundedCornerShape(10.dp)).background(c.accent), contentAlignment = Alignment.Center) {
            Icon(Icons.Rounded.Add, contentDescription = null, tint = c.onAccent, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.weight(1f))
        Text("Add\nprofile", style = MaterialTheme.typography.titleSmall, color = c.textSecondary)
    }
}

