package com.meet11.krono.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.FlameRed
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.domain.model.Profile

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileDetailSheet(
    profile: Profile?,
    onDismiss: () -> Unit,
    onDelete: (String) -> Unit
) {
    if (profile == null) return
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color(0xFF16181F),
        dragHandle = null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
                .navigationBarsPadding()
        ) {
            // Header with Close
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .clip(PillShape)
                        .background(profile.platform.cardBgColor.copy(alpha = 0.2f))
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(CircleShape)
                            .background(profile.platform.brandColor)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = profile.platform.displayName.uppercase(),
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }

                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0x14FFFFFF))
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Close",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Username + Rank
            Text(
                text = "@${profile.username}",
                fontSize = 28.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            if (!profile.rank.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = profile.rank.replaceFirstChar { it.uppercase() },
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = profile.platform.brandColor
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Rating Card
            val cardShape = RoundedCornerShape(24.dp)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(cardShape)
                    .background(Color(0xFF20232E))
                    .border(1.dp, Color(0x1FFFFFFF), cardShape)
                    .padding(20.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "CURRENT RATING",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0x99FFFFFF),
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = (profile.rating ?: profile.problemsSolved).toString(),
                        fontSize = 48.sp,
                        fontWeight = FontWeight.Black,
                        color = profile.platform.brandColor,
                        fontFamily = FontFamily.Monospace,
                        lineHeight = 52.sp
                    )

                    val peak = profile.maxRating ?: profile.rating
                    if (peak != null && peak > 0) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Box(
                            modifier = Modifier
                                .clip(PillShape)
                                .background(profile.platform.brandColor.copy(alpha = 0.15f))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Peak $peak",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = profile.platform.brandColor,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Secondary Stats Row (Solved + Contests)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(cardShape)
                        .background(Color(0xFF20232E))
                        .border(1.dp, Color(0x1FFFFFFF), cardShape)
                        .padding(16.dp)
                ) {
                    Column {
                        Text(
                            text = "SOLVED",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0x99FFFFFF)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${profile.problemsSolved}",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(cardShape)
                        .background(Color(0xFF20232E))
                        .border(1.dp, Color(0x1FFFFFFF), cardShape)
                        .padding(16.dp)
                ) {
                    Column {
                        Text(
                            text = "CONTESTS",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0x99FFFFFF)
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "${profile.totalContests}",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Rating Chart
            if (profile.rating != null && profile.rating > 0) {
                Text(
                    text = "RATING HISTORY",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0x99FFFFFF),
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                // Sample points ending at current rating
                val nowMs = System.currentTimeMillis()
                val mockPoints = listOf(
                    RatingPoint(nowMs - 90L * 86400000L, (profile.rating * 0.85).toInt()),
                    RatingPoint(nowMs - 60L * 86400000L, (profile.rating * 0.90).toInt()),
                    RatingPoint(nowMs - 30L * 86400000L, (profile.rating * 0.95).toInt()),
                    RatingPoint(nowMs, profile.rating)
                )
                RatingChart(
                    points = mockPoints,
                    lineColor = profile.platform.brandColor
                )
                Spacer(modifier = Modifier.height(24.dp))
            }

            // Remove Profile Button
            Button(
                onClick = {
                    onDelete(profile.id)
                    onDismiss()
                },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = FlameRed.copy(alpha = 0.15f)),
                shape = PillShape
            ) {
                Icon(
                    imageVector = Icons.Rounded.Delete,
                    contentDescription = null,
                    tint = FlameRed,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Disconnect Profile",
                    color = FlameRed,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        }
    }
}
