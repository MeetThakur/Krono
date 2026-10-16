package com.meet11.krono.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.DateRange
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(
    val route: String,
    val title: String,
    val icon: ImageVector
) {
    data object Home : Screen("home", "Home", Icons.Rounded.GridView)
    data object Contests : Screen("contests", "Contests", Icons.Rounded.EmojiEvents)
    data object Rivals : Screen("rivals", "Rivals", Icons.Rounded.Shield)
    data object Settings : Screen("settings", "Settings", Icons.Rounded.Settings)

    companion object {
        val bottomNavItems: List<Screen>
            get() = listOf(Home, Contests, Rivals)
    }
}
