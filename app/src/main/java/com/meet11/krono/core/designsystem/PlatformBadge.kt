package com.meet11.krono.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.domain.model.Platform

@Composable
fun PlatformBadge(
    platform: Platform,
    modifier: Modifier = Modifier,
    showFullName: Boolean = false
) {
    val brandColor = platform.brandColor

    Row(
        modifier = modifier
            .clip(PillShape)
            .background(brandColor.copy(alpha = 0.16f))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(6.dp)
                .clip(CircleShape)
                .background(brandColor)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = if (showFullName) platform.displayName else platform.shortCode,
            color = brandColor,
            style = MaterialTheme.typography.labelSmall.copy(
                fontWeight = FontWeight.Bold,
                fontSize = 11.sp
            )
        )
    }
}
