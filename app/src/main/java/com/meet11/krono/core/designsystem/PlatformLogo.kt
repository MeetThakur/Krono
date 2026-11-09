package com.meet11.krono.core.designsystem

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import com.meet11.krono.domain.model.Platform

/**
 * Simple geometric marks for the supported judges, drawn in code so they stay crisp at any size
 * and cost no assets. Returns false when a platform has no mark (callers fall back to initials).
 */
fun Platform.hasLogo(): Boolean = this == Platform.CODEFORCES || this == Platform.LEETCODE || this == Platform.CODECHEF

@Composable
fun PlatformLogo(platform: Platform, size: Dp, modifier: Modifier = Modifier) {
    Canvas(modifier.size(size)) {
        val w = this.size.width
        val h = this.size.height
        when (platform) {
            Platform.CODEFORCES -> {
                // Three bars: yellow, blue (tallest), red.
                val bw = w * 0.22f
                val gap = w * 0.08f
                val x0 = (w - (3 * bw + 2 * gap)) / 2f
                val r = CornerRadius(bw * 0.3f)
                val base = h * 0.82f
                drawRoundRect(Color(0xFFF8C100), Offset(x0, h * 0.40f), Size(bw, base - h * 0.40f), r)
                drawRoundRect(Color(0xFF1B8AE6), Offset(x0 + bw + gap, h * 0.18f), Size(bw, base - h * 0.18f), r)
                drawRoundRect(Color(0xFFE5484D), Offset(x0 + 2 * (bw + gap), h * 0.50f), Size(bw, base - h * 0.50f), r)
            }
            Platform.LEETCODE -> {
                val sw = w * 0.13f
                val chevron = Path().apply {
                    moveTo(w * 0.52f, h * 0.18f)
                    lineTo(w * 0.22f, h * 0.50f)
                    lineTo(w * 0.52f, h * 0.82f)
                }
                drawPath(chevron, Color(0xFFFFA116), style = Stroke(sw, cap = StrokeCap.Round, join = StrokeJoin.Round))
                drawLine(Color(0xFF8A8F9C), Offset(w * 0.50f, h * 0.50f), Offset(w * 0.82f, h * 0.50f), sw, StrokeCap.Round)
            }
            Platform.CODECHEF -> {
                // Chef's hat.
                val c = Color(0xFF8B5A2B)
                drawCircle(c, w * 0.17f, Offset(w * 0.32f, h * 0.36f))
                drawCircle(c, w * 0.20f, Offset(w * 0.50f, h * 0.30f))
                drawCircle(c, w * 0.17f, Offset(w * 0.68f, h * 0.36f))
                drawRoundRect(c, Offset(w * 0.28f, h * 0.40f), Size(w * 0.44f, h * 0.30f), CornerRadius(w * 0.05f))
                drawRoundRect(c, Offset(w * 0.28f, h * 0.74f), Size(w * 0.44f, h * 0.10f), CornerRadius(w * 0.04f))
            }
            else -> Unit
        }
    }
}
