package com.meet11.krono.presentation.navigation

import androidx.annotation.DrawableRes
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.SpaceDashboard
import androidx.compose.ui.graphics.vector.ImageVector
import com.meet11.krono.R

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector,
    @DrawableRes val iconRes: Int? = null
) {
    data object Home : Screen("home", "Today", Icons.Rounded.SpaceDashboard)
    data object Contests : Screen("contests", "Contests", Icons.Rounded.CalendarMonth)
    data object Rivals : Screen("rivals", "Rivals", Icons.Rounded.SpaceDashboard, R.drawable.ic_sword_cross)
    data object Settings : Screen("settings", "Settings", Icons.Rounded.Settings)

    companion object {
        // Lazy: eager init here races the sealed subclasses' own static init (NPE on cold start).
        val bottomNavItems: List<Screen> by lazy { listOf(Home, Contests, Rivals) }
        val tabRoutes: Set<String> by lazy { bottomNavItems.map { it.route }.toSet() }
    }
}
