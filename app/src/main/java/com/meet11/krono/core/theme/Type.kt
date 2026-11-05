package com.meet11.krono.core.theme

import androidx.compose.material3.Typography
import androidx.compose.runtime.Immutable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.meet11.krono.R

@OptIn(androidx.compose.ui.text.ExperimentalTextApi::class)
private fun variable(res: Int, weight: Int) = Font(
    resId = res,
    weight = FontWeight(weight),
    variationSettings = FontVariation.Settings(FontVariation.weight(weight))
)

/** Geometric grotesk with a technical edge — used for display, titles and labels. */
val Grotesk = FontFamily(
    variable(R.font.space_grotesk, 400),
    variable(R.font.space_grotesk, 500),
    variable(R.font.space_grotesk, 600),
    variable(R.font.space_grotesk, 700)
)

/** Monospace for every number, timer and rating — the "instrument readout" voice. */
val Mono = FontFamily(
    variable(R.font.jetbrains_mono, 400),
    variable(R.font.jetbrains_mono, 500),
    variable(R.font.jetbrains_mono, 600),
    variable(R.font.jetbrains_mono, 700)
)

private val Body = FontFamily.Default

val Typography = Typography(
    displayLarge = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Bold, fontSize = 52.sp, lineHeight = 56.sp, letterSpacing = (-0.03).em),
    displayMedium = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Bold, fontSize = 42.sp, lineHeight = 46.sp, letterSpacing = (-0.03).em),
    displaySmall = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Bold, fontSize = 34.sp, lineHeight = 40.sp, letterSpacing = (-0.025).em),
    headlineLarge = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Bold, fontSize = 30.sp, lineHeight = 36.sp, letterSpacing = (-0.02).em),
    headlineMedium = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Bold, fontSize = 26.sp, lineHeight = 32.sp, letterSpacing = (-0.02).em),
    headlineSmall = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.SemiBold, fontSize = 22.sp, lineHeight = 28.sp, letterSpacing = (-0.015).em),
    titleLarge = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.SemiBold, fontSize = 20.sp, lineHeight = 26.sp, letterSpacing = (-0.01).em),
    titleMedium = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.SemiBold, fontSize = 16.sp, lineHeight = 22.sp, letterSpacing = (-0.005).em),
    titleSmall = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 20.sp),
    bodyLarge = TextStyle(fontFamily = Body, fontWeight = FontWeight.Normal, fontSize = 16.sp, lineHeight = 24.sp),
    bodyMedium = TextStyle(fontFamily = Body, fontWeight = FontWeight.Normal, fontSize = 14.sp, lineHeight = 20.sp),
    bodySmall = TextStyle(fontFamily = Body, fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, lineHeight = 20.sp),
    labelMedium = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Medium, fontSize = 12.sp, lineHeight = 16.sp),
    labelSmall = TextStyle(fontFamily = Grotesk, fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = 0.02.em)
)

/** Monospaced readout styles. Tabular figures keep ticking timers from jittering. */
@Immutable
object Readout {
    private val base = TextStyle(fontFamily = Mono, fontFeatureSettings = "tnum, zero")
    val hero = base.copy(fontWeight = FontWeight.SemiBold, fontSize = 40.sp, lineHeight = 44.sp, letterSpacing = (-0.04).em)
    val large = base.copy(fontWeight = FontWeight.SemiBold, fontSize = 30.sp, lineHeight = 34.sp, letterSpacing = (-0.03).em)
    val medium = base.copy(fontWeight = FontWeight.SemiBold, fontSize = 20.sp, lineHeight = 24.sp, letterSpacing = (-0.02).em)
    val small = base.copy(fontWeight = FontWeight.Medium, fontSize = 14.sp, lineHeight = 18.sp)
    val tiny = base.copy(fontWeight = FontWeight.Medium, fontSize = 11.sp, lineHeight = 14.sp, letterSpacing = 0.02.em)
    /** Small uppercase mono caption, e.g. "NEXT CONTEST". */
    val caption = base.copy(fontWeight = FontWeight.Medium, fontSize = 10.5.sp, lineHeight = 14.sp, letterSpacing = 0.08.em)
}
