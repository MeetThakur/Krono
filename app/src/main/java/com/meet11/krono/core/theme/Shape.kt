package com.meet11.krono.core.theme

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val Shapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(26.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

val PillShape = CircleShape

/** Pebble corners: large and deliberately uneven (TL, TR, BR, BL). */
val CardShape = RoundedCornerShape(topStart = 28.dp, topEnd = 20.dp, bottomEnd = 28.dp, bottomStart = 20.dp)
val CardShapeAlt = RoundedCornerShape(topStart = 20.dp, topEnd = 28.dp, bottomEnd = 20.dp, bottomStart = 28.dp)
val TileShape = RoundedCornerShape(topStart = 20.dp, topEnd = 14.dp, bottomEnd = 20.dp, bottomStart = 14.dp)

val OutlineWidth = 3.dp
val ShadowOffset = 4.dp
