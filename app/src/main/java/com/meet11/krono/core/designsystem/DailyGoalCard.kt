package com.meet11.krono.core.designsystem

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.domain.model.DailyGoal
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.min
import kotlin.math.sin

@Composable
fun DailyGoalCard(
    dailyGoal: DailyGoal,
    onLogSolve: () -> Unit,
    onOpenTargetDialog: () -> Unit,
    modifier: Modifier = Modifier
) {
    val view = LocalView.current
    val c = Krono.colors

    KronoCard(modifier = modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            GoalDial(
                solved = dailyGoal.solvedToday,
                target = dailyGoal.targetProblems,
                modifier = Modifier.size(104.dp)
            )
            Spacer(Modifier.width(18.dp))
            Column(Modifier.weight(1f)) {
                Caption("Streak")
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(dailyGoal.currentStreak.toString(), style = Readout.large, color = c.textPrimary)
                    Spacer(Modifier.width(6.dp))
                    Text(
                        if (dailyGoal.currentStreak == 1) "day" else "days",
                        style = MaterialTheme.typography.titleSmall,
                        color = c.textSecondary,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
                Spacer(Modifier.height(2.dp))
                Text(
                    text = "Best ${dailyGoal.bestStreak} · Goal ${dailyGoal.targetProblems}/day",
                    style = Readout.tiny,
                    color = c.textTertiary
                )
                Spacer(Modifier.height(10.dp))
                if (dailyGoal.isCompleted) {
                    Tag("Goal met", tone = TagTone.Success)
                } else {
                    val left = (dailyGoal.targetProblems - dailyGoal.solvedToday).coerceAtLeast(0)
                    Text(
                        "$left more to keep the streak",
                        style = MaterialTheme.typography.bodySmall,
                        color = c.textSecondary
                    )
                }
            }
        }

        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            KronoButton(
                text = "Log a solve",
                leadingIcon = Icons.Rounded.Add,
                onClick = {
                    view.performHapticFeedback(
                        if (android.os.Build.VERSION.SDK_INT >= 30) HapticFeedbackConstants.CONFIRM else HapticFeedbackConstants.VIRTUAL_KEY
                    )
                    onLogSolve()
                },
                modifier = Modifier.weight(1f),
                height = 44.dp
            )
            IconAction(
                icon = Icons.Rounded.Tune,
                contentDescription = "Change daily goal",
                onClick = {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    onOpenTargetDialog()
                },
                size = 44.dp
            )
        }
    }
}

/**
 * Bezel-style progress dial: one tick per problem in the target (continuous arc for
 * large targets), filled clockwise from 12 o'clock.
 */
@Composable
private fun GoalDial(solved: Int, target: Int, modifier: Modifier = Modifier) {
    val c = Krono.colors
    val ratio = if (target <= 0) 0f else (solved.toFloat() / target).coerceIn(0f, 1f)
    val animated by animateFloatAsState(ratio, tween(700), label = "dial")
    val done = solved >= target && target > 0
    val fill = if (done) c.success else c.accent
    val track = if (c.isDark) c.surfaceRaised else c.line
    val minor = c.lineStrong

    Box(modifier, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val stroke = 9.dp.toPx()
            val radius = min(size.width, size.height) / 2f - stroke / 2f - 6.dp.toPx()
            val topLeft = Offset(center.x - radius, center.y - radius)
            val arcSize = androidx.compose.ui.geometry.Size(radius * 2, radius * 2)

            // Outer minute ticks — the chronograph bezel.
            val outer = min(size.width, size.height) / 2f
            for (i in 0 until 60) {
                val angle = (i / 60f) * 2f * PI.toFloat() - PI.toFloat() / 2f
                val len = if (i % 5 == 0) 4.dp.toPx() else 2.dp.toPx()
                val start = Offset(center.x + cos(angle) * (outer - len), center.y + sin(angle) * (outer - len))
                val end = Offset(center.x + cos(angle) * outer, center.y + sin(angle) * outer)
                drawLine(minor, start, end, strokeWidth = 1.dp.toPx())
            }

            if (target in 1..12) {
                val gap = 8f
                val sweep = 360f / target
                for (i in 0 until target) {
                    val startAngle = -90f + i * sweep + gap / 2f
                    drawArc(track, startAngle, sweep - gap, false, topLeft, arcSize, style = Stroke(stroke, cap = StrokeCap.Round))
                }
                // Fill segments progressively so the animation sweeps across tick boundaries.
                val filledSweep = animated * 360f
                for (i in 0 until target) {
                    val segStart = i * sweep
                    val segFill = (filledSweep - segStart).coerceIn(0f, sweep)
                    if (segFill > gap / 2f) {
                        drawArc(
                            fill, -90f + segStart + gap / 2f, (segFill - gap).coerceAtLeast(0.5f), false,
                            topLeft, arcSize, style = Stroke(stroke, cap = StrokeCap.Round)
                        )
                    }
                }
            } else {
                drawArc(track, -90f, 360f, false, topLeft, arcSize, style = Stroke(stroke))
                if (animated > 0f) {
                    drawArc(fill, -90f, animated * 360f, false, topLeft, arcSize, style = Stroke(stroke, cap = StrokeCap.Round))
                }
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            if (done) {
                androidx.compose.material3.Icon(Icons.Rounded.Check, contentDescription = null, tint = c.success, modifier = Modifier.size(18.dp))
            }
            Text("$solved/$target", style = Readout.medium, color = c.textPrimary)
            Text("TODAY", style = Readout.caption, color = c.textTertiary)
        }
    }
}

