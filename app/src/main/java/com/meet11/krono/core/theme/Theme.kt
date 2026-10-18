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
import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

@Immutable
data class KronoExtraColors(
    val codeforces: Color = PlatformCodeforces,
    val leetcode: Color = PlatformLeetCode,
    val codechef: Color = PlatformCodeChef,
    val atcoder: Color = PlatformAtCoderDark,
    val geeksforgeeks: Color = PlatformGeeksforGeeks,
    val hackerrank: Color = PlatformHackerRank,
    val topcoder: Color = PlatformTopCoder,
    val codingninjas: Color = PlatformCodingNinjas,
    val flameOrange: Color = FlameOrange,
    val flameRed: Color = FlameRed,
    val flameGold: Color = FlameGold,
    val surfaceHighlight: Color = DarkSurfaceHigh,
    val cardBorder: Color = DarkOutline
)

val LocalKronoColors = staticCompositionLocalOf { KronoExtraColors() }

private val DefaultDarkColorScheme = darkColorScheme(
    primary = Color(0xFFF8FAFC),
    onPrimary = Color(0xFF0F172A),
    primaryContainer = Color(0xFF1E293B),
    onPrimaryContainer = Color(0xFFF1F5F9),
    secondary = Color(0xFF94A3B8),
    onSecondary = Color(0xFF0F172A),
    secondaryContainer = Color(0xFF334155),
    onSecondaryContainer = Color(0xFFF8FAFC),
    tertiary = Color(0xFF3B82F6),
    onTertiary = Color(0xFFFFFFFF),
    tertiaryContainer = Color(0xFF1E3A8A),
    onTertiaryContainer = Color(0xFFDBEAFE),
    background = DarkBg,
    onBackground = Color(0xFFF8FAFC),
    surface = DarkSurface,
    onSurface = Color(0xFFF8FAFC),
    surfaceVariant = DarkSurfaceHigh,
    onSurfaceVariant = Color(0xFF94A3B8),
    surfaceContainerLowest = DarkSurfaceLowest,
    surfaceContainerLow = DarkSurfaceLow,
    surfaceContainer = DarkSurface,
    surfaceContainerHigh = DarkSurfaceHigh,
    surfaceContainerHighest = DarkSurfaceHighest,
    outline = DarkOutline,
    outlineVariant = DarkOutlineVariant
)

private val DefaultLightColorScheme = lightColorScheme(
    primary = Slate900,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFE2E8F0),
    onPrimaryContainer = Slate900,
    secondary = Color(0xFF475569),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFE2E8F0),
    onSecondaryContainer = Color(0xFF1E293B),
    tertiary = Color(0xFF2563EB),
    onTertiary = Color.White,
    tertiaryContainer = Color(0xFFDBEAFE),
    onTertiaryContainer = Color(0xFF1E40AF),
    background = LightBg,
    onBackground = Slate900,
    surface = LightSurface,
    onSurface = Slate900,
    surfaceVariant = LightSurfaceHigh,
    onSurfaceVariant = Color(0xFF64748B),
    surfaceContainerLowest = LightSurfaceLowest,
    surfaceContainerLow = LightSurfaceLow,
    surfaceContainer = LightSurface,
    surfaceContainerHigh = LightSurfaceHigh,
    surfaceContainerHighest = LightSurfaceHighest,
    outline = LightOutline,
    outlineVariant = LightOutlineVariant
)

fun getPaletteColorScheme(palette: ThemePaletteSeed, isDark: Boolean): ColorScheme {
    val seed = palette.seedColor
    return if (isDark) {
        DefaultDarkColorScheme.copy(
            primary = if (palette == ThemePaletteSeed.MONOCHROME) Color(0xFFF8FAFC) else seed,
            primaryContainer = seed.copy(alpha = 0.25f),
            onPrimaryContainer = Color.White
        )
    } else {
        DefaultLightColorScheme.copy(
            primary = if (palette == ThemePaletteSeed.MONOCHROME) Slate900 else seed,
            primaryContainer = seed.copy(alpha = 0.15f),
            onPrimaryContainer = seed
        )
    }
}

@Composable
fun KronoTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    palette: ThemePaletteSeed = ThemePaletteSeed.MONOCHROME,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        else -> getPaletteColorScheme(palette, darkTheme)
    }

    val extraColors = if (darkTheme) {
        KronoExtraColors(
            atcoder = PlatformAtCoderDark,
            surfaceHighlight = DarkSurfaceHigh,
            cardBorder = DarkOutline
        )
    } else {
        KronoExtraColors(
            atcoder = PlatformAtCoderLight,
            surfaceHighlight = LightSurfaceHigh,
            cardBorder = LightOutline
        )
    }

    CompositionLocalProvider(LocalKronoColors provides extraColors) {
        MaterialTheme(
            colorScheme = colorScheme,
            typography = Typography,
            shapes = Shapes,
            content = content
        )
    }
}
