package com.meet11.krono.presentation.navigation

import androidx.compose.animation.animateColorAsState
import androidx.compose.foundation.background
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.R

@Composable
fun KronoBottomNavBar(
    currentRoute: String,
    onNavigate: (Screen) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Color(0xFF0F1218),
        border = androidx.compose.foundation.BorderStroke(0.5.dp, Color(0xFF1E2330))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Screen.bottomNavItems.forEach { screen ->
                val isSelected = currentRoute == screen.route
                val iconColor by animateColorAsState(
                    targetValue = if (isSelected) Color.White else Color(0xFF64748B),
                    label = "nav_icon_color"
                )
                val indicatorColor by animateColorAsState(
                    targetValue = if (isSelected) Color(0xFF1E2536) else Color.Transparent,
                    label = "nav_indicator_color"
                )

                Column(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onNavigate(screen) }
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .width(56.dp)
                            .height(30.dp)
                            .clip(RoundedCornerShape(15.dp))
                            .background(indicatorColor),
                        contentAlignment = Alignment.Center
                    ) {
                        when (screen) {
                            Screen.Home -> Icon(
                                imageVector = Icons.Rounded.GridView,
                                contentDescription = screen.title,
                                tint = iconColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Screen.Contests -> Icon(
                                imageVector = Icons.Rounded.EmojiEvents,
                                contentDescription = screen.title,
                                tint = iconColor,
                                modifier = Modifier.size(20.dp)
                            )
                            Screen.Rivals -> Icon(
                                painter = painterResource(id = R.drawable.ic_sword_cross),
                                contentDescription = screen.title,
                                tint = iconColor,
                                modifier = Modifier.size(19.dp)
                            )
                            else -> Unit
                        }
                    }
                    Spacer(modifier = Modifier.height(3.dp))
                    Text(
                        text = screen.title,
                        color = iconColor,
                        style = MaterialTheme.typography.labelSmall.copy(
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Medium
                        )
                    )
                }
            }
        }
    }
}

