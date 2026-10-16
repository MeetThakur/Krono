package com.meet11.krono.core.theme

import androidx.compose.ui.graphics.Color

// Platform Brand Colors
val PlatformCodeforces = Color(0xFF1877F2)
val PlatformLeetCode = Color(0xFFFFA116)
val PlatformCodeChef = Color(0xFF8B4513)
val PlatformAtCoderLight = Color(0xFF1C1917)
val PlatformAtCoderDark = Color(0xFFFFFFFF)
val PlatformGeeksforGeeks = Color(0xFF2F8D46)
val PlatformHackerRank = Color(0xFF00EA64)
val PlatformTopCoder = Color(0xFF29A8DF)
val PlatformCodingNinjas = Color(0xFFD04D28)

// Status Colors
val StatusSuccess = Color(0xFF10B981)
val StatusError = Color(0xFFEF4444)
val StatusWarning = Color(0xFFF59E0B)
val StatusInfo = Color(0xFF3B82F6)

// Expressive Flame Colors
val FlameOrange = Color(0xFFF59E0B)
val FlameRed = Color(0xFFEF4444)
val FlameGold = Color(0xFFFBBF24)

// Light Palette (Default Monochrome Slate)
val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate600 = Color(0xFF475569)
val Slate500 = Color(0xFF64748B)
val Slate400 = Color(0xFF94A3B8)
val Slate300 = Color(0xFFCBD5E1)
val Slate200 = Color(0xFFE2E8F0)
val Slate100 = Color(0xFFF1F5F9)
val Slate50 = Color(0xFFF8FAFC)

// Dark Palette
val DarkBg = Color(0xFF0D0F14)
val DarkSurfaceLowest = Color(0xFF090A0D)
val DarkSurfaceLow = Color(0xFF13161C)
val DarkSurface = Color(0xFF171B23)
val DarkSurfaceHigh = Color(0xFF1F242F)
val DarkSurfaceHighest = Color(0xFF282E3C)
val DarkOutline = Color(0x1FFFFFFF)
val DarkOutlineVariant = Color(0x0FFFFFFF)

// Light Surfaces
val LightBg = Color(0xFFF8F9FC)
val LightSurfaceLowest = Color(0xFFFFFFFF)
val LightSurfaceLow = Color(0xFFF3F4F8)
val LightSurface = Color(0xFFFFFFFF)
val LightSurfaceHigh = Color(0xFFECEEF4)
val LightSurfaceHighest = Color(0xFFE2E5EE)
val LightOutline = Color(0x14000000)
val LightOutlineVariant = Color(0x0A000000)

enum class ThemePaletteSeed(val displayName: String, val seedColor: Color) {
    MONOCHROME("Monochrome", Slate900),
    BLUE("Blue", Color(0xFF2563EB)),
    EMERALD("Emerald", Color(0xFF059669)),
    VIOLET("Violet", Color(0xFF7C3AED)),
    ROSE("Rose", Color(0xFFE11D48)),
    AMBER("Amber", Color(0xFFD97706))
}
