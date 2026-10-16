package com.meet11.krono.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Code
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.presentation.home.CumulativeStats
import java.text.NumberFormat
import java.util.Locale

@Composable
fun ActivityHubBento(
    stats: CumulativeStats,
    modifier: Modifier = Modifier
) {
    val formatter = NumberFormat.getNumberInstance(Locale.US)

    Row(
        modifier = modifier
            .fillMaxWidth()
            .height(144.dp),
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // 1. Left Big Bento Tile - Problems Solved
        val leftShape = RoundedCornerShape(24.dp)
        Box(
            modifier = Modifier
                .weight(1.15f)
                .fillMaxHeight()
                .clip(leftShape)
                .background(Color(0xFF132D20))
                .border(1.dp, Color(0x3334D399), leftShape)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF064E3B)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.CheckCircle,
                        contentDescription = null,
                        tint = Color(0xFF34D399),
                        modifier = Modifier.size(20.dp)
                    )
                }

                Column {
                    Text(
                        text = formatter.format(stats.totalSolved),
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFECFDF5),
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 36.sp
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Problems Solved",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF6EE7B7)
                    )
                }
            }
        }

        // 2. Right Stacked Bento Column - Contests & Submissions
        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxHeight(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Contests Tile
            val rightTopShape = RoundedCornerShape(20.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(rightTopShape)
                    .background(Color(0xFF2E2108))
                    .border(1.dp, Color(0x33FBBF24), rightTopShape)
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF451A03)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.EmojiEvents,
                        contentDescription = null,
                        tint = Color(0xFFFBBF24),
                        modifier = Modifier.size(16.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = formatter.format(stats.totalContests),
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFFFFBEB),
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "CONTESTS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFFCD34D),
                        letterSpacing = 0.5.sp
                    )
                }
            }

            // Submissions Tile
            val rightBottomShape = RoundedCornerShape(20.dp)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(rightBottomShape)
                    .background(Color(0xFF112240))
                    .border(1.dp, Color(0x3360A5FA), rightBottomShape)
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF1E3A8A)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Code,
                        contentDescription = null,
                        tint = Color(0xFF60A5FA),
                        modifier = Modifier.size(16.dp)
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = formatter.format(stats.totalSubmissions),
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFFEFF6FF),
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "SUBMISSIONS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF93C5FD),
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}
