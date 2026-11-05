package com.meet11.krono.core.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.ColorScheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.ReadOnlyComposable
import androidx.compose.runtime.remember
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.platform.LocalContext

val LocalKronoColors = staticCompositionLocalOf { kronoDarkColors(ThemePaletteSeed.VOLT) }

/** Shorthand accessor: `Krono.colors.textPrimary`. */
object Krono {
    val colors: KronoColors
        @Composable @ReadOnlyComposable get() = LocalKronoColors.current
}

private fun KronoColors.toMaterial(): ColorScheme {
    val base = if (isDark) darkColorScheme() else lightColorScheme()
    return base.copy(
        primary = if (isDark) accent else textPrimary,
        onPrimary = if (isDark) onAccent else background,
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

/** Blends a Material You dynamic scheme into Krono tokens so custom components follow it too. */
private fun KronoColors.withDynamic(scheme: ColorScheme): KronoColors = copy(
    background = scheme.background,
    surface = scheme.surfaceContainerLow,
    surfaceRaised = scheme.surfaceContainerHigh,
    surfaceSunken = scheme.surfaceContainerLowest,
    line = scheme.outlineVariant,
    lineStrong = scheme.outline,
    textPrimary = scheme.onSurface,
    textSecondary = scheme.onSurfaceVariant,
    accent = scheme.primary,
    onAccent = scheme.onPrimary,
    accentInk = scheme.primary,
    inverse = scheme.inverseSurface,
    onInverse = scheme.inverseOnSurface
)

@Composable
fun KronoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    palette: ThemePaletteSeed = ThemePaletteSeed.VOLT,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val useDynamic = dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S

    val (kronoColors, colorScheme) = remember(darkTheme, useDynamic, palette) {
        val tokens = if (darkTheme) kronoDarkColors(palette) else kronoLightColors(palette)
        if (useDynamic) {
            val dyn = if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
            val merged = tokens.withDynamic(dyn)
            merged to dyn.copy(surfaceTint = Color.Transparent)
        } else {
            tokens to tokens.toMaterial()
        }
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
fun contentOn(fill: Color): Color = if (fill.luminance() > 0.45f) Color(0xFF0B0B0C) else Color.White
