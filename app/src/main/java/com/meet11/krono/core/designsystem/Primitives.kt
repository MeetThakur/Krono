package com.meet11.krono.core.designsystem

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.drawscope.translate
import com.meet11.krono.core.theme.CardShape
import com.meet11.krono.core.theme.OutlineWidth
import com.meet11.krono.core.theme.ShadowOffset
import com.meet11.krono.core.theme.contentOn
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.theme.TileShape
import com.meet11.krono.domain.model.Platform

/** Small wrapper so every control can give consistent haptic feedback. */
class Haptics(private val view: android.view.View) {
    /** Light tick for taps and selection changes. */
    fun tick() { view.performHapticFeedback(android.view.HapticFeedbackConstants.CONTEXT_CLICK) }
    /** Firmer click for toggles. */
    fun toggle() { view.performHapticFeedback(android.view.HapticFeedbackConstants.VIRTUAL_KEY) }
    /** Success confirmation (falls back to a key tap before Android 11). */
    fun success() {
        view.performHapticFeedback(
            if (android.os.Build.VERSION.SDK_INT >= 30) android.view.HapticFeedbackConstants.CONFIRM
            else android.view.HapticFeedbackConstants.VIRTUAL_KEY
        )
    }
}

@Composable
fun rememberHaptics(): Haptics {
    val view = androidx.compose.ui.platform.LocalView.current
    return remember(view) { Haptics(view) }
}

/**
 * Clickable with a subtle spring press-scale. Scale runs in the draw phase via
 * graphicsLayer so presses never trigger recomposition of the content.
 */
@Composable
fun Modifier.pressable(
    enabled: Boolean = true,
    pressedScale: Float = 0.97f,
    shape: Shape? = null,
    role: Role = Role.Button,
    onClickLabel: String? = null,
    haptic: Boolean = true,
    onClick: () -> Unit
): Modifier {
    val haptics = rememberHaptics()
    val interaction = remember { MutableInteractionSource() }
    val pressed by interaction.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) pressedScale else 1f,
        animationSpec = spring(dampingRatio = 0.6f, stiffness = 900f),
        label = "press"
    )
    return this
        .graphicsLayer { scaleX = scale; scaleY = scale }
        // Clip before clickable so the ripple follows the rounded shape.
        .then(if (shape != null) Modifier.clip(shape) else Modifier)
        .clickable(
            interactionSource = interaction,
            indication = ripple(),
            enabled = enabled,
            role = role,
            onClickLabel = onClickLabel,
            onClick = { if (haptic) haptics.tick(); onClick() }
        )
}

/** Pebble card: uneven corners, bold outline and a hard offset shadow. */
@Composable
fun KronoCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    shape: Shape = CardShape,
    color: Color = Krono.colors.surface,
    borderColor: Color = Krono.colors.edge,
    shadowColor: Color = Krono.colors.shadow,
    contentPadding: PaddingValues = PaddingValues(18.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    val c = Krono.colors
    val clickModifier = if (onClick != null) Modifier.pressable(pressedScale = 0.985f, shape = shape, onClick = onClick) else Modifier.clip(shape)
    Column(
        modifier = modifier
            .pebbleShadow(shape, shadowColor)
            .then(clickModifier)
            .background(color)
            .border(OutlineWidth, borderColor, shape)
            .padding(contentPadding),
        content = content
    )
}

/** Hard, un-blurred shadow offset downward — the "sticker" lift. */
fun Modifier.pebbleShadow(shape: Shape, color: Color, offset: Dp = ShadowOffset + 1.dp): Modifier =
    this.drawBehind {
        val o = offset.toPx()
        val outline = shape.createOutline(size, layoutDirection, this)
        translate(0f, o) {
            when (outline) {
                is androidx.compose.ui.graphics.Outline.Rounded -> drawPath(
                    androidx.compose.ui.graphics.Path().apply { addRoundRect(outline.roundRect) }, color
                )
                is androidx.compose.ui.graphics.Outline.Generic -> drawPath(outline.path, color)
                is androidx.compose.ui.graphics.Outline.Rectangle -> drawRect(color, size = size)
            }
        }
    }

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    count: Int? = null,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    val c = Krono.colors
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 32.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = c.textPrimary
        )
        if (count != null) {
            Spacer(Modifier.width(8.dp))
            Text(text = count.toString(), style = Readout.tiny, color = c.textTertiary)
        }
        Spacer(Modifier.weight(1f))
        if (actionLabel != null && onAction != null) {
            Row(
                modifier = Modifier
                    .clip(PillShape)
                    .clickable(onClick = onAction)
                    .padding(horizontal = 8.dp, vertical = 6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(actionLabel, style = MaterialTheme.typography.labelMedium, color = c.textSecondary)
                Spacer(Modifier.width(4.dp))
                Icon(
                    Icons.AutoMirrored.Rounded.ArrowForward,
                    contentDescription = null,
                    tint = c.textSecondary,
                    modifier = Modifier.size(14.dp)
                )
            }
        }
    }
}

/** Small mono caption, e.g. "NEXT CONTEST". */
@Composable
fun Caption(text: String, modifier: Modifier = Modifier, color: Color = Krono.colors.textTertiary) {
    Text(text = text.uppercase(), style = MaterialTheme.typography.labelSmall.copy(letterSpacing = 0.08.em, fontWeight = androidx.compose.ui.text.font.FontWeight.Bold), color = color, modifier = modifier, maxLines = 1)
}

enum class TagTone { Neutral, Live, Success, Accent, Warning }

@Composable
fun Tag(
    text: String,
    modifier: Modifier = Modifier,
    tone: TagTone = TagTone.Neutral,
    dotColor: Color? = null,
    pulse: Boolean = false,
    uppercase: Boolean = true
) {
    val c = Krono.colors
    val (bg, fg) = when (tone) {
        TagTone.Neutral -> c.surfaceSunken to c.textSecondary
        TagTone.Live -> c.coral to c.ink
        TagTone.Success -> c.mint to c.ink
        TagTone.Warning -> c.butter to c.ink
        TagTone.Accent -> c.inverse to c.onInverse
    }
    Row(
        modifier = modifier
            .clip(PillShape)
            .background(bg)
            .padding(horizontal = 10.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val dot = dotColor ?: if (tone == TagTone.Live) c.live else null
        if (dot != null) {
            if (pulse) PulsingDot(dot, 6.dp) else Dot(dot, 6.dp)
            Spacer(Modifier.width(5.dp))
        }
        Text(
            text = text,
            style = MaterialTheme.typography.labelMedium,
            color = fg,
            maxLines = 1
        )
    }
}

@Composable
fun Dot(color: Color, size: Dp = 8.dp, modifier: Modifier = Modifier) {
    Box(modifier.size(size).background(color, CircleShape))
}

@Composable
fun PulsingDot(color: Color, size: Dp = 8.dp, modifier: Modifier = Modifier) {
    val transition = rememberInfiniteTransition(label = "pulse")
    val halo by transition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(1400), RepeatMode.Restart),
        label = "halo"
    )
    Box(
        modifier = modifier
            .size(size)
            .drawBehind {
                drawCircle(color.copy(alpha = (1f - halo) * 0.45f), radius = this.size.minDimension / 2f * (1f + halo * 1.4f))
                drawCircle(color)
            }
    )
}

/** Filter chip. Selected state uses the inverse fill for maximum clarity. */
@Composable
fun KronoChip(
    text: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    leadingDot: Color? = null
) {
    val c = Krono.colors
    val haptics = rememberHaptics()
    val bg by animateColorAsState(if (selected) c.inverse else c.surface, tween(180), label = "chipBg")
    val fg by animateColorAsState(if (selected) c.onInverse else c.textPrimary, tween(180), label = "chipFg")
    val border = if (selected) c.inverse else c.line
    Row(
        modifier = modifier
            .clip(PillShape)
            .background(bg)
            .border(2.dp, border, PillShape)
            .clickable(role = Role.Tab, onClick = { haptics.tick(); onClick() })
            .heightIn(min = 36.dp)
            .padding(horizontal = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (leadingDot != null) {
            Dot(leadingDot, 7.dp)
            Spacer(Modifier.width(8.dp))
        }
        Text(text, style = MaterialTheme.typography.labelLarge, color = fg, maxLines = 1)
    }
}

/** Segmented control for 2–4 mutually exclusive options. */
@Composable
fun <T> SegmentedControl(
    options: List<T>,
    selected: T,
    onSelect: (T) -> Unit,
    label: (T) -> String,
    modifier: Modifier = Modifier
) {
    val c = Krono.colors
    val haptics = rememberHaptics()
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(c.surfaceSunken)
            .padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        options.forEach { option ->
            val isSelected = option == selected
            val bg by animateColorAsState(if (isSelected) c.inverse else Color.Transparent, tween(180), label = "segBg")
            val fg by animateColorAsState(if (isSelected) c.onInverse else c.textSecondary, tween(180), label = "segFg")
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(PillShape)
                    .background(bg)
                    .clickable(role = Role.RadioButton) { if (!isSelected) haptics.tick(); onSelect(option) }
                    .heightIn(min = 38.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(label(option), style = MaterialTheme.typography.labelLarge, color = fg, maxLines = 1)
            }
        }
    }
}

/** Round icon button with an optional "active" accent state. */
@Composable
fun IconAction(
    icon: ImageVector,
    contentDescription: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    active: Boolean = false,
    size: Dp = 40.dp,
    iconSize: Dp = 18.dp,
    haptic: Boolean = true
) {
    val c = Krono.colors
    val bg by animateColorAsState(if (active) c.accent else c.surface, tween(200), label = "iaBg")
    val fg by animateColorAsState(if (active) c.onAccent else c.textPrimary, tween(200), label = "iaFg")
    Box(
        modifier = modifier
            .size(size)
            .pebbleShadow(CircleShape, c.shadow, 3.dp)
            .pressable(pressedScale = 0.9f, shape = CircleShape, haptic = haptic, onClick = onClick)
            .background(bg)
            .border(OutlineWidth, if (active && c.isDark) c.accent else c.lineStrong, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(icon, contentDescription = contentDescription, tint = fg, modifier = Modifier.size(iconSize))
    }
}

enum class ButtonStyle { Primary, Secondary, Inverse, Danger }

@Composable
fun KronoButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    style: ButtonStyle = ButtonStyle.Primary,
    enabled: Boolean = true,
    loading: Boolean = false,
    leadingIcon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    height: Dp = 48.dp,
    haptic: Boolean = true
) {
    val c = Krono.colors
    val (bg, fg, border) = when (style) {
        ButtonStyle.Primary -> Triple(c.accent, c.onAccent, if (c.isDark) c.accent else c.lineStrong)
        ButtonStyle.Inverse -> Triple(c.inverse, c.onInverse, if (c.isDark) c.inverse else c.lineStrong)
        ButtonStyle.Secondary -> Triple(c.surface, c.textPrimary, c.lineStrong)
        ButtonStyle.Danger -> Triple(c.coral, c.ink, if (c.isDark) c.coral else c.lineStrong)
    }
    val alpha = if (enabled) 1f else 0.4f
    Row(
        modifier = modifier
            .heightIn(min = height)
            .graphicsLayer { this.alpha = alpha }
            .pebbleShadow(PillShape, c.shadow, 3.dp)
            .pressable(enabled = enabled && !loading, shape = PillShape, haptic = haptic, onClick = onClick)
            .background(bg)
            .border(OutlineWidth, border, PillShape)
            .padding(horizontal = 20.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        CompositionLocalProvider(LocalContentColor provides fg) {
            if (loading) {
                CircularProgressIndicator(modifier = Modifier.size(18.dp), strokeWidth = 2.dp, color = fg)
            } else {
                if (leadingIcon != null) {
                    Icon(leadingIcon, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(8.dp))
                }
                Text(text, style = MaterialTheme.typography.labelLarge, color = fg, maxLines = 1)
                if (trailingIcon != null) {
                    Spacer(Modifier.width(6.dp))
                    Icon(trailingIcon, contentDescription = null, modifier = Modifier.size(16.dp))
                }
            }
        }
    }
}

/** Logo tile for a platform; judges without a drawn mark fall back to a coloured monogram. */
@Composable
fun PlatformMark(platform: Platform, modifier: Modifier = Modifier, size: Dp = 36.dp) {
    val c = Krono.colors
    val shape = RoundedCornerShape(size * 0.34f)
    if (platform.hasLogo()) {
        Box(
            modifier = modifier
                .size(size)
                .clip(shape)
                .background(Color(0xFFFFF8E7))
                .border(2.dp, c.ink, shape),
            contentAlignment = Alignment.Center
        ) { PlatformLogo(platform, size * 0.72f) }
    } else {
        val tint = platform.brandColor
        Box(
            modifier = modifier
                .size(size)
                .clip(shape)
                .background(tint)
                .border(2.dp, c.ink, shape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = platform.shortCode,
                style = Readout.tiny.copy(fontSize = (size.value * 0.3f).sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold),
                color = contentOn(tint),
                maxLines = 1
            )
        }
    }
}

/** Initials avatar used for handles. */
@Composable
fun HandleAvatar(handle: String, modifier: Modifier = Modifier, size: Dp = 40.dp, highlighted: Boolean = false) {
    val c = Krono.colors
    val bg = if (highlighted) c.accent else c.surfaceSunken
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(bg)
            .border(2.dp, c.lineStrong, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = handle.filter { it.isLetterOrDigit() }.take(2).uppercase().ifEmpty { "?" },
            style = MaterialTheme.typography.labelLarge,
            color = if (highlighted) c.onAccent else c.textPrimary
        )
    }
}

/** Thin progress track. */
@Composable
fun ProgressTrack(
    progress: Float,
    modifier: Modifier = Modifier,
    color: Color = Krono.colors.accent,
    trackColor: Color = Krono.colors.surfaceSunken,
    height: Dp = 8.dp
) {
    val animated by animateFloatAsState(progress.coerceIn(0f, 1f), tween(600), label = "track")
    Box(
        modifier
            .fillMaxWidth()
            .height(height)
            .clip(PillShape)
            .background(trackColor)
            .drawBehind {
                drawRoundRect(
                    color = color,
                    size = this.size.copy(width = this.size.width * animated),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(this.size.height / 2f)
                )
            }
    )
}

/** Centered empty-state block. */
@Composable
fun EmptyState(
    icon: ImageVector,
    title: String,
    message: String,
    modifier: Modifier = Modifier,
    action: (@Composable () -> Unit)? = null
) {
    val c = Krono.colors
    KronoCard(modifier = modifier.fillMaxWidth(), contentPadding = PaddingValues(horizontal = 24.dp, vertical = 32.dp)) {
        Column(Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(c.butter)
                    .border(3.dp, c.lineStrong, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = c.ink, modifier = Modifier.size(22.dp))
            }
            Spacer(Modifier.height(14.dp))
            Text(title, style = MaterialTheme.typography.titleMedium, color = c.textPrimary)
            Spacer(Modifier.height(4.dp))
            Text(
                message,
                style = MaterialTheme.typography.bodyMedium,
                color = c.textSecondary,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
            if (action != null) {
                Spacer(Modifier.height(18.dp))
                action()
            }
        }
    }
}

/** Screen title block used at the top of each tab. */
@Composable
fun ScreenTitle(
    title: String,
    modifier: Modifier = Modifier,
    eyebrow: String? = null,
    trailing: @Composable RowScope.() -> Unit = {}
) {
    val c = Krono.colors
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 12.dp, bottom = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(Modifier.weight(1f)) {
            if (eyebrow != null) {
                Caption(eyebrow)
                Spacer(Modifier.height(6.dp))
            }
            Text(title, style = MaterialTheme.typography.displaySmall, color = c.textPrimary, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically, content = trailing)
    }
}

/** Shimmer-free skeleton block (static tint keeps it cheap). */
@Composable
fun SkeletonBlock(modifier: Modifier = Modifier, shape: Shape = CardShape) {
    Box(modifier.clip(shape).background(Krono.colors.surfaceSunken))
}

@Composable
fun BoxScope.Hairline(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxWidth().height(1.dp).background(Krono.colors.line).align(Alignment.BottomCenter))
}

@Composable
fun VerticalHairline(modifier: Modifier = Modifier) {
    Box(modifier.width(1.dp).background(Krono.colors.line))
}

internal fun Color.darken(factor: Float = 0.62f) = Color(red * factor, green * factor, blue * factor, alpha)


/** A pastel as a card fill: untouched in light, sunk into the navy in dark so cards glow instead of shout. */
@Composable
fun tintFill(pastel: Color): Color {
    val c = Krono.colors
    return if (c.isDark) androidx.compose.ui.graphics.lerp(pastel, c.background, 0.80f) else pastel
}

/** Hard shadow for a tinted card: ink in light, a deep shade of the pastel in dark so the card still lifts. */
@Composable
fun tintShadow(pastel: Color): Color =
    if (Krono.colors.isDark) androidx.compose.ui.graphics.lerp(pastel, Color.Black, 0.55f) else Krono.colors.shadow

/** Outline for a tinted card: the pastel itself in dark, the ink outline in light. */
@Composable
fun tintEdge(pastel: Color): Color = if (Krono.colors.isDark) pastel else Krono.colors.lineStrong

/** Pastel card fill for a platform: its brand hue washed toward white, always read with dark ink. */
@Composable
fun platformTint(platform: Platform): Color {
    val c = Krono.colors
    return tintFill(platformPastel(platform))
}

@Composable
fun platformPastel(platform: Platform): Color {
    val c = Krono.colors
    return when (platform) {
        Platform.CODEFORCES -> c.sky
        Platform.LEETCODE -> c.butter
        Platform.CODECHEF -> if (c.isDark) Color(0xFFFFB98A) else Color(0xFFFFD2B0)
        else -> androidx.compose.ui.graphics.lerp(platform.brandColor, Color.White, if (c.isDark) 0.45f else 0.72f)
    }
}
