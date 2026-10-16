package com.meet11.krono.presentation.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.meet11.krono.presentation.contests.ContestsScreen
import com.meet11.krono.presentation.contests.ContestsViewModel
import com.meet11.krono.presentation.home.HomeScreen
import com.meet11.krono.presentation.home.HomeViewModel
import com.meet11.krono.presentation.rivals.RivalsScreen
import com.meet11.krono.presentation.rivals.RivalsViewModel
import com.meet11.krono.presentation.settings.SettingsScreen
import com.meet11.krono.presentation.settings.SettingsViewModel

@Composable
fun KronoApp() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: Screen.Home.route

    val isMainTab = currentRoute in listOf(Screen.Home.route, Screen.Contests.route, Screen.Rivals.route)

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            if (isMainTab) {
                KronoBottomNavBar(
                    currentRoute = currentRoute,
                    onNavigate = { screen ->
                        navController.navigate(screen.route) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                val viewModel: HomeViewModel = hiltViewModel()
                HomeScreen(
                    viewModel = viewModel,
                    onNavigateToSettings = { navController.navigate(Screen.Settings.route) },
                    onNavigateToContests = { navController.navigate(Screen.Contests.route) }
                )
            }
            composable(Screen.Contests.route) {
                val viewModel: ContestsViewModel = hiltViewModel()
                ContestsScreen(viewModel = viewModel)
            }
            composable(Screen.Rivals.route) {
                val viewModel: RivalsViewModel = hiltViewModel()
                RivalsScreen(viewModel = viewModel)
            }
            composable(Screen.Settings.route) {
                val viewModel: SettingsViewModel = hiltViewModel()
                SettingsScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
