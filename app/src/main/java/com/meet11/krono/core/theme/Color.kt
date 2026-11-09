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
val SignalLive = Color(0xFFFF6B4A)
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
 * Krono's own token set ("pebble" identity): cream/navy canvas, a bold outline on every
 * card, and four pastel fills (butter, sky, mint, coral) that always carry dark ink.
 */
@Immutable
data class KronoColors(
    val isDark: Boolean,
    val background: Color,
    val surface: Color,
    val surfaceRaised: Color,
    val surfaceSunken: Color,
    /** Soft divider / hairline. */
    val line: Color,
    /** The bold 3dp outline drawn around cards, chips and buttons. */
    val lineStrong: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textTertiary: Color,
    /** Solid accent fill (butter). */
    val accent: Color,
    /** Content color on top of [accent] and every pastel. */
    val onAccent: Color,
    val accentInk: Color,
    val inverse: Color,
    val onInverse: Color,
    val butter: Color,
    val sky: Color,
    val mint: Color,
    val coral: Color,
    /** Hard offset shadow under outlined cards. */
    val shadow: Color,
    /** Quiet outline for neutral (untinted) cards. */
    val edge: Color,
    /** Content colour on tinted cards: dark ink in light, cream in dark. */
    val onTint: Color,
    val live: Color = SignalLive,
    val success: Color = SignalSuccess,
    val warning: Color = SignalWarning
) {
    val outline: Color get() = lineStrong
    /** Dark ink that sits on pastel fills in both themes. */
    val ink: Color get() = onAccent
}

private val Ink = Color(0xFF1D2233)
private val NavyInk = Color(0xFF101624)

@Suppress("UNUSED_PARAMETER")
fun kronoDarkColors(palette: ThemePaletteSeed = ThemePaletteSeed.VOLT) = KronoColors(
    isDark = true,
    background = NavyInk,
    surface = Color(0xFF172037),
    surfaceRaised = Color(0xFF212B48),
    surfaceSunken = Color(0xFF0C1220),
    line = Color(0xFF2A3553),
    lineStrong = Color(0xFF47537E),
    textPrimary = Color(0xFFF4EEDC),
    textSecondary = Color(0xFFB7BED0),
    textTertiary = Color(0xFF9AA4BD),
    accent = Color(0xFFFFD66B),
    onAccent = NavyInk,
    accentInk = Color(0xFFFFD66B),
    inverse = Color(0xFFF4EEDC),
    onInverse = NavyInk,
    butter = Color(0xFFFFD66B),
    sky = Color(0xFF8EC5F0),
    mint = Color(0xFF7FD6A8),
    coral = Color(0xFFFF8F73),
    shadow = Color(0xFF05080F),
    edge = Color(0xFF34406A),
    onTint = Color(0xFFF4EEDC),
    live = Color(0xFFFF8F73)
)

@Suppress("UNUSED_PARAMETER")
fun kronoLightColors(palette: ThemePaletteSeed = ThemePaletteSeed.VOLT) = KronoColors(
    isDark = false,
    background = Color(0xFFFFF8E7),
    surface = Color(0xFFFFFFFF),
    surfaceRaised = Color(0xFFFFFFFF),
    surfaceSunken = Color(0xFFF3EBD3),
    line = Color(0xFFF3EBD3),
    lineStrong = Ink,
    textPrimary = Ink,
    textSecondary = Color(0xFF6B7186),
    textTertiary = Color(0xFF8E93A6),
    accent = Color(0xFFFFD66B),
    onAccent = Ink,
    accentInk = Ink,
    inverse = Ink,
    onInverse = Color(0xFFFFF8E7),
    butter = Color(0xFFFFD66B),
    sky = Color(0xFFBFE3FA),
    mint = Color(0xFFC9F0DA),
    coral = Color(0xFFFFB3A0),
    shadow = Ink,
    edge = Ink,
    onTint = Ink
)
