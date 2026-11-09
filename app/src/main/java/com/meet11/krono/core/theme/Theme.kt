package com.meet11.krono.core.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance

val LocalKronoColors = staticCompositionLocalOf { kronoDarkColors(ThemePaletteSeed.VOLT) }

/** Shorthand accessor: `Krono.colors.textPrimary`. */
object Krono {
    val colors: KronoColors
        @Composable @ReadOnlyComposable get() = LocalKronoColors.current
}

private fun KronoColors.toMaterial(): ColorScheme {
    val base = if (isDark) darkColorScheme() else lightColorScheme()
    return base.copy(
        primary = accent,
        onPrimary = onAccent,
        primaryContainer = surfaceRaised,
        onPrimaryContainer = textPrimary,
        secondary = textSecondary,
        onSecondary = background,
        secondaryContainer = surfaceRaised,
        onSecondaryContainer = textPrimary,
        tertiary = accentInk,
        onTertiary = onAccent,
        background = background,
        onBackground = textPrimary,
        surface = surface,
        onSurface = textPrimary,
        surfaceVariant = surfaceRaised,
        onSurfaceVariant = textSecondary,
        surfaceTint = Color.Transparent,
        inverseSurface = inverse,
        inverseOnSurface = onInverse,
        surfaceContainerLowest = surfaceSunken,
        surfaceContainerLow = surface,
        surfaceContainer = surface,
        surfaceContainerHigh = surfaceRaised,
        surfaceContainerHighest = surfaceRaised,
        outline = lineStrong,
        outlineVariant = line,
        error = live,
        onError = Color.White,
        scrim = Color.Black
    )
}

@Composable
fun KronoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val (kronoColors, colorScheme) = remember(darkTheme) {
        val tokens = if (darkTheme) kronoDarkColors() else kronoLightColors()
        tokens to tokens.toMaterial()
    }

    CompositionLocalProvider(LocalKronoColors provides kronoColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            shapes = Shapes,
            content = content
        )
    }
}

/** Readable content color (black/white) for an arbitrary fill such as a platform brand color. */
fun contentOn(fill: Color): Color = if (fill.luminance() > 0.45f) Color(0xFF1D2233) else Color.White
