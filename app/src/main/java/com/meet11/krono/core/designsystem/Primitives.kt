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
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.CardShape
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.theme.TileShape
import com.meet11.krono.domain.model.Platform

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
    onClick: () -> Unit
): Modifier {
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
            onClick = onClick
        )
}

/** Flat surface with a hairline border. The base container of the whole app. */
@Composable
fun KronoCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    shape: Shape = CardShape,
    color: Color = Krono.colors.surface,
    borderColor: Color = Krono.colors.line,
    contentPadding: PaddingValues = PaddingValues(18.dp),
    content: @Composable ColumnScope.() -> Unit
) {
    val clickModifier = if (onClick != null) Modifier.pressable(pressedScale = 0.985f, shape = shape, onClick = onClick) else Modifier.clip(shape)
    Column(
        modifier = modifier
            .then(clickModifier)
            .background(color)
            .border(1.dp, borderColor, shape)
            .padding(contentPadding),
        content = content
    )
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
    Text(text = text.uppercase(), style = Readout.caption, color = color, modifier = modifier, maxLines = 1)
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
        TagTone.Neutral -> c.surfaceRaised to c.textSecondary
        TagTone.Live -> c.live.copy(alpha = if (c.isDark) 0.16f else 0.10f) to c.live
        TagTone.Success -> c.success.copy(alpha = if (c.isDark) 0.16f else 0.12f) to c.success
        TagTone.Warning -> c.warning.copy(alpha = if (c.isDark) 0.16f else 0.14f) to (if (c.isDark) c.warning else Color(0xFF9A5B00))
        TagTone.Accent -> c.accent to c.onAccent
    }
    Row(
        modifier = modifier
            .clip(PillShape)
            .background(bg)
            .padding(horizontal = 8.dp, vertical = 3.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        val dot = dotColor ?: if (tone == TagTone.Live) c.live else null
        if (dot != null) {
            if (pulse) PulsingDot(dot, 6.dp) else Dot(dot, 6.dp)
            Spacer(Modifier.width(5.dp))
        }
        Text(
            text = if (uppercase) text.uppercase() else text,
            style = if (uppercase) Readout.caption else Readout.tiny,
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
    val bg by animateColorAsState(if (selected) c.inverse else c.surface, tween(180), label = "chipBg")
    val fg by animateColorAsState(if (selected) c.onInverse else c.textPrimary, tween(180), label = "chipFg")
    val border = if (selected) c.inverse else c.line
    Row(
        modifier = modifier
            .clip(PillShape)
            .background(bg)
            .border(1.dp, border, PillShape)
            .clickable(role = Role.Tab, onClick = onClick)
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
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clip(TileShape)
            .background(c.surfaceSunken)
            .border(1.dp, c.line, TileShape)
            .padding(3.dp),
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        options.forEach { option ->
            val isSelected = option == selected
            val bg by animateColorAsState(if (isSelected) c.surfaceRaised else Color.Transparent, tween(180), label = "segBg")
            val fg by animateColorAsState(if (isSelected) c.textPrimary else c.textSecondary, tween(180), label = "segFg")
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(11.dp))
                    .background(bg)
                    .then(if (isSelected) Modifier.border(1.dp, c.line, RoundedCornerShape(11.dp)) else Modifier)
                    .clickable(role = Role.RadioButton) { onSelect(option) }
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
    iconSize: Dp = 18.dp
) {
    val c = Krono.colors
    val bg by animateColorAsState(if (active) c.accent else c.surfaceRaised, tween(200), label = "iaBg")
    val fg by animateColorAsState(if (active) c.onAccent else c.textPrimary, tween(200), label = "iaFg")
    Box(
        modifier = modifier
            .size(size)
            .pressable(pressedScale = 0.9f, shape = CircleShape, onClick = onClick)
            .background(bg)
            .border(1.dp, if (active) c.accent else c.line, CircleShape),
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
    height: Dp = 48.dp
) {
    val c = Krono.colors
    val (bg, fg, border) = when (style) {
        ButtonStyle.Primary -> Triple(c.accent, c.onAccent, c.accent)
        ButtonStyle.Inverse -> Triple(c.inverse, c.onInverse, c.inverse)
        ButtonStyle.Secondary -> Triple(c.surfaceRaised, c.textPrimary, c.line)
        ButtonStyle.Danger -> Triple(c.live.copy(alpha = 0.12f), c.live, c.live.copy(alpha = 0.25f))
    }
    val alpha = if (enabled) 1f else 0.4f
    Row(
        modifier = modifier
            .heightIn(min = height)
            .graphicsLayer { this.alpha = alpha }
            .pressable(enabled = enabled && !loading, shape = PillShape, onClick = onClick)
            .background(bg)
            .border(1.dp, border, PillShape)
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

/** Monogram tile for a platform — gives each source a recognisable mark without logos. */
@Composable
fun PlatformMark(platform: Platform, modifier: Modifier = Modifier, size: Dp = 36.dp) {
    val c = Krono.colors
    val tint = platform.brandColor
    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(size * 0.3f))
            .background(tint.copy(alpha = if (c.isDark) 0.16f else 0.12f))
            .border(1.dp, tint.copy(alpha = 0.28f), RoundedCornerShape(size * 0.3f)),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = platform.shortCode,
            style = Readout.tiny.copy(fontSize = (size.value * 0.3f).sp, fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold),
            color = if (c.isDark) tint else tint.darken(),
            maxLines = 1
        )
    }
}

/** Initials avatar used for handles. */
@Composable
fun HandleAvatar(handle: String, modifier: Modifier = Modifier, size: Dp = 40.dp, highlighted: Boolean = false) {
    val c = Krono.colors
    val bg = if (highlighted) c.accent else c.surfaceRaised
    Box(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .background(bg)
            .border(1.dp, if (highlighted) c.accent else c.line, CircleShape),
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
    trackColor: Color = Krono.colors.line,
    height: Dp = 4.dp
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
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(c.surfaceRaised),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, contentDescription = null, tint = c.textSecondary, modifier = Modifier.size(22.dp))
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
    Box(modifier.clip(shape).background(Krono.colors.surface).border(1.dp, Krono.colors.line, shape))
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

