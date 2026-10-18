package com.meet11.krono.core.designsystem

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.material.icons.rounded.AddCircleOutline
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.TrackChanges
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.FlameGold
import com.meet11.krono.core.theme.FlameOrange
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.core.theme.StatusSuccess
import com.meet11.krono.domain.model.DailyGoal

@Composable
fun DailyGoalCard(
    dailyGoal: DailyGoal,
    onLogSolve: () -> Unit,
    onOpenTargetDialog: () -> Unit,
    modifier: Modifier = Modifier
) {
    val view = LocalView.current
    val cardShape = RoundedCornerShape(24.dp)
    val progressAnimated by animateFloatAsState(
        targetValue = dailyGoal.progressRatio,
        label = "daily_goal_progress"
    )

    val borderColor = if (dailyGoal.isCompleted) {
        Color(0x66F59E0B)
    } else {
        Color(0x1FFFFFFF)
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .clip(cardShape)
            .background(Color(0xFF16181F))
            .border(1.dp, borderColor, cardShape)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth()
        ) {
            // Top Section (Header + Progress)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp)
            ) {
                // 1. Streak Info + Target Goal Pill
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(
                                    if (dailyGoal.currentStreak > 0) Color(0x33F59E0B) else Color(0x14FFFFFF)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "🔥",
                                fontSize = 20.sp
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Row(verticalAlignment = Alignment.Bottom) {
                                Text(
                                    text = "${dailyGoal.currentStreak} ",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = if (dailyGoal.currentStreak > 0) FlameGold else Color.White,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = if (dailyGoal.currentStreak == 1) "day streak" else "days streak",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            Text(
                                text = "Best: ${dailyGoal.bestStreak} ${if (dailyGoal.bestStreak == 1) "day" else "days"}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0x80FFFFFF)
                            )
                        }
                    }

                    // Target Pill: Goal X/day
                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(Color(0x14FFFFFF))
                            .border(1.dp, Color(0x24FFFFFF), PillShape)
                            .clickable {
                                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                onOpenTargetDialog()
                            }
                            .padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.TrackChanges,
                            contentDescription = "Target",
                            tint = Color.White,
                            modifier = Modifier.size(13.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Goal ${dailyGoal.targetProblems}/day",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // 2. Solves Counter + Goal Met Badge
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Today: ",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                        Text(
                            text = "${dailyGoal.solvedToday}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Black,
                            color = if (dailyGoal.isCompleted) StatusSuccess else Color.White,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            text = " / ${dailyGoal.targetProblems} solved",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xB3FFFFFF)
                        )
                    }

                    if (dailyGoal.isCompleted) {
                        Row(
                            modifier = Modifier
                                .clip(PillShape)
                                .background(StatusSuccess.copy(alpha = 0.16f))
                                .padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.CheckCircle,
                                contentDescription = null,
                                tint = StatusSuccess,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Goal Met!",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = StatusSuccess
                            )
                        }
                    } else {
                        val leftCount = (dailyGoal.targetProblems - dailyGoal.solvedToday).coerceAtLeast(0)
                        Text(
                            text = "$leftCount left",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0x80FFFFFF)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // 3. Sleek Progress Bar
                LinearProgressIndicator(
                    progress = { progressAnimated },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(5.dp)
                        .clip(PillShape),
                    color = if (dailyGoal.isCompleted) StatusSuccess else (if (dailyGoal.currentStreak > 0) FlameOrange else Color.White),
                    trackColor = Color(0x1AFFFFFF)
                )
            }

            // Bottom Full-Width Action: +1 Log Practice Solve
            HorizontalDivider(color = Color(0x14FFFFFF), thickness = 1.dp)

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable {
                        view.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                        onLogSolve()
                    }
                    .padding(vertical = 14.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Rounded.AddCircleOutline,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "+1 Log Practice Solve",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    }
}
