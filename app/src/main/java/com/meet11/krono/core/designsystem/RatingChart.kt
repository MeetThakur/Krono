package com.meet11.krono.core.designsystem

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipRect
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.domain.model.RatingPoint

/** Real rating history line chart with peak guide and draw-in animation. */
@Composable
fun RatingChart(
    points: List<RatingPoint>,
    modifier: Modifier = Modifier,
    lineColor: Color = Krono.colors.accent
) {
    if (points.size < 2) return
    val c = Krono.colors
    val fmt = com.meet11.krono.core.util.rememberTimeFormatter()
    val minRating = points.minOf { it.rating }
    val maxRating = points.maxOf { it.rating }
    val range = (maxRating - minRating).coerceAtLeast(1)
    val reveal = remember(points) { Animatable(0f) }
    LaunchedEffect(points) { reveal.animateTo(1f, tween(900)) }
    val guideColor = c.edge
    val surface = c.surface

    KronoCard(modifier = modifier.fillMaxWidth()) {
        Row {
            Caption("Rating history · ${points.size} contests")
            Spacer(Modifier.weight(1f))
            Text("max $maxRating", style = Readout.tiny, color = c.textSecondary)
        }
        Spacer(Modifier.height(14.dp))
        Canvas(Modifier.fillMaxWidth().height(150.dp)) {
            val padY = 8.dp.toPx()
            val w = size.width
            val h = size.height - padY * 2
            val step = w / (points.size - 1)
            val coords = points.mapIndexed { i, p ->
                Offset(i * step, padY + h - (p.rating - minRating).toFloat() / range * h)
            }

            // Guides at max and min.
            listOf(padY, padY + h).forEach { y ->
                drawLine(guideColor, Offset(0f, y), Offset(w, y), 1.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(8f, 8f)))
            }

            val line = Path().apply {
                moveTo(coords.first().x, coords.first().y)
                for (i in 1 until coords.size) {
                    val prev = coords[i - 1]
                    val cur = coords[i]
                    val midX = (prev.x + cur.x) / 2f
                    cubicTo(midX, prev.y, midX, cur.y, cur.x, cur.y)
                }
            }
            val area = Path().apply {
                addPath(line)
                lineTo(coords.last().x, size.height)
                lineTo(coords.first().x, size.height)
                close()
            }

            clipRect(right = w * reveal.value) {
                drawPath(area, Brush.verticalGradient(listOf(lineColor.copy(alpha = 0.22f), lineColor.copy(alpha = 0f))))
                drawPath(line, lineColor, style = Stroke(2.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round))
            }
            if (reveal.value >= 1f) {
                val last = coords.last()
                drawCircle(surface, 6.dp.toPx(), last)
                drawCircle(lineColor, 4.dp.toPx(), last)
            }
        }
        Spacer(Modifier.height(8.dp))
        Row {
            Text(fmt.monthYear(points.first().timestamp), style = Readout.tiny, color = c.textTertiary)
            Spacer(Modifier.weight(1f))
            Text(fmt.monthYear(points.last().timestamp), style = Readout.tiny, color = c.textTertiary)
        }
    }
}
