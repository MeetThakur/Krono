package com.meet11.krono.presentation.navigation

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.meet11.krono.R
import com.meet11.krono.core.theme.Krono

@Composable
fun KronoBottomNavBar(
    currentRoute: String,
    onNavigate: (Screen) -> Unit,
    modifier: Modifier = Modifier
) {
    val c = Krono.colors
    val view = LocalView.current
    val barShape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)
    Column(
        modifier
            .fillMaxWidth()
            .clip(barShape)
            .background(c.surface)
            .border(2.dp, c.line, barShape)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Screen.bottomNavItems.forEach { screen ->
                val selected = currentRoute == screen.route
                val fg by animateColorAsState(if (selected) c.textPrimary else c.textTertiary, tween(200), label = "navFg")
                val pillBg by animateColorAsState(if (selected) c.accent else Color.Transparent, tween(200), label = "navBg")
                val iconTint by animateColorAsState(if (selected) c.onAccent else c.textTertiary, tween(200), label = "navIcon")
                val pillWidth by animateDpAsState(if (selected) 68.dp else 56.dp, spring(dampingRatio = 0.7f, stiffness = 500f), label = "navW")

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null,
                            role = Role.Tab
                        ) {
                            if (!selected) view.performHapticFeedback(android.view.HapticFeedbackConstants.CLOCK_TICK)
                            onNavigate(screen)
                        }
                        .padding(vertical = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .width(pillWidth)
                            .height(34.dp)
                            .clip(RoundedCornerShape(17.dp))
                            .background(pillBg),
                        contentAlignment = Alignment.Center
                    ) {
                        if (screen.iconRes != null) {
                            Icon(painterResource(screen.iconRes), contentDescription = null, tint = iconTint, modifier = Modifier.size(19.dp))
                        } else {
                            Icon(screen.icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                    Text(screen.title, style = MaterialTheme.typography.labelMedium, color = fg)
                }
            }
        }
    }
}

