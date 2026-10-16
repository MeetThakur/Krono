package com.meet11.krono.core.designsystem

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.PlatformCodeforces
import com.meet11.krono.core.theme.SleekCardShape

data class RatingPoint(
    val timestamp: Long,
    val rating: Int,
    val contestName: String? = null
)

@Composable
fun RatingChart(
    points: List<RatingPoint>,
    modifier: Modifier = Modifier,
    lineColor: Color = PlatformCodeforces
) {
    if (points.isEmpty()) return

    val minRating = points.minOf { it.rating }
    val maxRating = points.maxOf { it.rating }
    val range = (maxRating - minRating).coerceAtLeast(1)

    BentoCard(
        modifier = modifier.fillMaxWidth(),
        containerColor = MaterialTheme.colorScheme.surfaceContainer,
        shape = SleekCardShape
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Rating History",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "Peak: $maxRating",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = lineColor
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(140.dp)
            ) {
                val width = size.width
                val height = size.height
                val paddingX = 16f
                val paddingY = 16f
                val availableWidth = width - (paddingX * 2)
                val availableHeight = height - (paddingY * 2)

                val stepX = if (points.size > 1) availableWidth / (points.size - 1) else availableWidth

                val coordinates = points.mapIndexed { index, point ->
                    val x = paddingX + (index * stepX)
                    val normalizedY = (point.rating - minRating).toFloat() / range
                    val y = height - paddingY - (normalizedY * availableHeight)
                    Offset(x, y)
                }

                // Draw dashed guide line for max rating
                val maxGuideY = height - paddingY - availableHeight
                drawLine(
                    color = lineColor.copy(alpha = 0.25f),
                    start = Offset(paddingX, maxGuideY),
                    end = Offset(width - paddingX, maxGuideY),
                    strokeWidth = 2f,
                    pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f)
                )

                // Build curve path
                val strokePath = Path().apply {
                    if (coordinates.isNotEmpty()) {
                        moveTo(coordinates.first().x, coordinates.first().y)
                        for (i in 0 until coordinates.size - 1) {
                            val p0 = coordinates[i]
                            val p1 = coordinates[i + 1]
                            val controlPoint1 = Offset(p0.x + (p1.x - p0.x) / 2, p0.y)
                            val controlPoint2 = Offset(p0.x + (p1.x - p0.x) / 2, p1.y)
                            cubicTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, p1.x, p1.y)
                        }
                    }
                }

                // Fill gradient under curve
                val fillPath = Path().apply {
                    addPath(strokePath)
                    lineTo(coordinates.last().x, height)
                    lineTo(coordinates.first().x, height)
                    close()
                }

                drawPath(
                    path = fillPath,
                    brush = Brush.verticalGradient(
                        colors = listOf(lineColor.copy(alpha = 0.35f), Color.Transparent),
                        startY = 0f,
                        endY = height
                    )
                )

                // Draw line stroke
                drawPath(
                    path = strokePath,
                    color = lineColor,
                    style = Stroke(width = 3.5.dp.toPx())
                )

                // Draw points
                coordinates.forEach { point ->
                    drawCircle(
                        color = lineColor,
                        radius = 4.dp.toPx(),
                        center = point
                    )
                    drawCircle(
                        color = Color.White,
                        radius = 2.dp.toPx(),
                        center = point
                    )
                }
            }
        }
    }
}
