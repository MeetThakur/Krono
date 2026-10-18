package com.meet11.krono.core.designsystem

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.FlameGold
import com.meet11.krono.core.theme.FlameOrange
import com.meet11.krono.core.theme.PillShape

@Composable
fun FlameStreakBadge(
    streak: Int,
    modifier: Modifier = Modifier,
    isLarge: Boolean = false
) {
    val isActive = streak > 0

    val infiniteTransition = rememberInfiniteTransition(label = "flame_pulse")
    val flameScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isActive) 1.15f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "flame_scale"
    )

    val bgColor = if (isActive) {
        FlameOrange.copy(alpha = 0.16f)
    } else {
        MaterialTheme.colorScheme.surfaceContainerHigh
    }

    val contentColor = if (isActive) FlameOrange else MaterialTheme.colorScheme.onSurfaceVariant

    Row(
        modifier = modifier
            .clip(PillShape)
            .background(bgColor)
            .padding(
                horizontal = if (isLarge) 14.dp else 10.dp,
                vertical = if (isLarge) 8.dp else 5.dp
            ),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = Icons.Rounded.LocalFireDepartment,
            contentDescription = "Streak flame",
            tint = if (isActive) FlameGold else contentColor,
            modifier = Modifier
                .size(if (isLarge) 22.dp else 16.dp)
                .scale(flameScale)
        )
        Spacer(modifier = Modifier.width(if (isLarge) 6.dp else 4.dp))
        Text(
            text = "$streak",
            color = contentColor,
            style = if (isLarge) {
                MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
            } else {
                MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.Bold)
            }
        )
    }
}
