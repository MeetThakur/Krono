package com.meet11.krono.core.theme

import androidx.compose.runtime.Immutable
import androidx.compose.ui.graphics.Color

// ── Platform brand colors ────────────────────────────────────────────────
val PlatformCodeforces = Color(0xFF3B82F6)
val PlatformLeetCode = Color(0xFFFFA116)
val PlatformCodeChef = Color(0xFFB0773F)
val PlatformAtCoder = Color(0xFF9CA3AF)
val PlatformGeeksforGeeks = Color(0xFF2F8D46)
val PlatformHackerRank = Color(0xFF1BA94C)
val PlatformTopCoder = Color(0xFF29A8DF)
val PlatformCodingNinjas = Color(0xFFE3602B)

// ── Semantic signal colors (shared by both themes) ──────────────────────
val SignalLive = Color(0xFFFF4D4F)
val SignalSuccess = Color(0xFF34C77B)
val SignalWarning = Color(0xFFFFB224)

/**
 * Accent palettes. `fill` is used for solid surfaces (buttons, rings, indicators)
 * with [onFill] content on top. `inkOnLight` is a darker variant of the same hue that
 * stays legible as text/icon color on light backgrounds.
 *
 * Enum names are persisted in DataStore — never rename existing entries.
 */
enum class ThemePaletteSeed(
    val displayName: String,
    val fill: Color,
    val onFill: Color,
    val inkOnLight: Color
) {
    VOLT("Volt", Color(0xFFD4FF3F), Color(0xFF0B0B0C), Color(0xFF5B7A00)),
    AMBER("Ember", Color(0xFFFF7A3D), Color(0xFF0B0B0C), Color(0xFFC2410C)),
    BLUE("Ice", Color(0xFF7CC4FF), Color(0xFF0B0B0C), Color(0xFF1D6FB8)),
    VIOLET("Iris", Color(0xFFB4A0FF), Color(0xFF0B0B0C), Color(0xFF6D4FE0)),
    ROSE("Rose", Color(0xFFFF7EA8), Color(0xFF0B0B0C), Color(0xFFC72C62)),
    EMERALD("Mint", Color(0xFF5EE6B0), Color(0xFF0B0B0C), Color(0xFF0E8A5F)),
    MONOCHROME("Mono", Color(0xFFF4F4F5), Color(0xFF0B0B0C), Color(0xFF0B0B0C));
}

/**
 * Krono's own token set. Screens read from here instead of hardcoding hex values,
 * so both light and dark themes render correctly.
 */
@Immutable
data class KronoColors(
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceRaised: Color,
    val surfaceSunken: Color,
    val line: Color,
    val lineStrong: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textTertiary: Color,
    /** Solid accent fill (buttons, ring, active indicator). */
    val accent: Color,
    /** Content color on top of [accent]. */
    val onAccent: Color,
    /** Accent hue tuned for text/icons on the current background. */
    val accentInk: Color,
    /** Inverse fill for selected chips / high-emphasis neutral elements. */
    val inverse: Color,
    val onInverse: Color,
    val live: Color = SignalLive,
    val success: Color = SignalSuccess,
    val warning: Color = SignalWarning
)

fun kronoDarkColors(palette: ThemePaletteSeed) = KronoColors(
    isDark = true,
    background = Color(0xFF09090A),
    surface = Color(0xFF131315),
    surfaceRaised = Color(0xFF1B1B1E),
    surfaceSunken = Color(0xFF0E0E10),
    line = Color(0xFF222226),
    lineStrong = Color(0xFF2E2E33),
    textPrimary = Color(0xFFF4F4F5),
    textSecondary = Color(0xFFA1A1AA),
    textTertiary = Color(0xFF6B6B74),
    accent = palette.fill,
    onAccent = palette.onFill,
    accentInk = palette.fill,
    inverse = Color(0xFFF4F4F5),
    onInverse = Color(0xFF0B0B0C)
)

fun kronoLightColors(palette: ThemePaletteSeed) = KronoColors(
    isDark = false,
    background = Color(0xFFF5F5F2),
    surface = Color(0xFFFFFFFF),
    surfaceRaised = Color(0xFFFFFFFF),
    surfaceSunken = Color(0xFFEDEDE9),
    line = Color(0xFFE5E5E0),
    lineStrong = Color(0xFFD4D4CE),
    textPrimary = Color(0xFF0B0B0C),
    textSecondary = Color(0xFF55555D),
    textTertiary = Color(0xFF8C8C94),
    accent = if (palette == ThemePaletteSeed.MONOCHROME) Color(0xFF0B0B0C) else palette.fill,
    onAccent = if (palette == ThemePaletteSeed.MONOCHROME) Color.White else palette.onFill,
    accentInk = palette.inkOnLight,
    inverse = Color(0xFF0B0B0C),
    onInverse = Color(0xFFF4F4F5)
)
