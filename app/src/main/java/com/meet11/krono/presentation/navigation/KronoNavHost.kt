package com.meet11.krono.presentation.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavBackStackEntry
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.ui.LocalSnackbarHost
import com.meet11.krono.presentation.contests.ContestsScreen
import com.meet11.krono.presentation.home.HomeScreen
import com.meet11.krono.presentation.rivals.RivalsScreen
import com.meet11.krono.presentation.settings.SettingsScreen

private const val TAB_FADE_MS = 220
private const val PUSH_MS = 320

private fun tabEnter() = fadeIn(tween(TAB_FADE_MS, delayMillis = 60)) + scaleIn(tween(TAB_FADE_MS, delayMillis = 60), initialScale = 0.985f)
private fun tabExit() = fadeOut(tween(120))

private fun AnimatedContentTransitionScope<NavBackStackEntry>.isPush() =
    targetState.destination.route == Screen.Settings.route || initialState.destination.route == Screen.Settings.route

@Composable
fun KronoApp() {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val currentRoute = backStack?.destination?.route ?: Screen.Home.route
    val snackbarHost = remember { SnackbarHostState() }
    val c = Krono.colors

    CompositionLocalProvider(LocalSnackbarHost provides snackbarHost) {
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            containerColor = c.background,
            contentWindowInsets = WindowInsets(0.dp),
            snackbarHost = {
                SnackbarHost(snackbarHost) { data ->
                    Snackbar(
                        snackbarData = data,
                        containerColor = c.inverse,
                        contentColor = c.onInverse,
                        actionColor = if (c.isDark) c.onInverse else c.accent,
                        shape = androidx.compose.foundation.shape.RoundedCornerShape(14.dp)
                    )
                }
            },
            bottomBar = {
                if (currentRoute in Screen.tabRoutes) {
                    KronoBottomNavBar(
                        currentRoute = currentRoute,
                        onNavigate = { screen ->
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
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
                modifier = Modifier.padding(innerPadding),
                enterTransition = {
                    if (isPush()) slideInHorizontally(tween(PUSH_MS, easing = FastOutSlowInEasing)) { it / 3 } + fadeIn(tween(PUSH_MS))
                    else tabEnter()
                },
                exitTransition = {
                    if (isPush()) slideOutHorizontally(tween(PUSH_MS, easing = FastOutSlowInEasing)) { -it / 6 } + fadeOut(tween(PUSH_MS))
                    else tabExit()
                },
                popEnterTransition = {
                    if (isPush()) slideInHorizontally(tween(PUSH_MS, easing = FastOutSlowInEasing)) { -it / 6 } + fadeIn(tween(PUSH_MS))
                    else tabEnter()
                },
                popExitTransition = {
                    if (isPush()) slideOutHorizontally(tween(PUSH_MS, easing = FastOutSlowInEasing)) { it / 3 } + fadeOut(tween(PUSH_MS))
                    else tabExit()
                }
            ) {
                composable(Screen.Home.route) {
                    HomeScreen(
                        viewModel = hiltViewModel(),
                        onNavigateToSettings = { navController.navigate(Screen.Settings.route) { launchSingleTop = true } },
                        onNavigateToContests = {
                            navController.navigate(Screen.Contests.route) {
                                popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
                composable(Screen.Contests.route) { ContestsScreen(viewModel = hiltViewModel()) }
                composable(Screen.Rivals.route) { RivalsScreen(viewModel = hiltViewModel()) }
                composable(Screen.Settings.route) {
                    SettingsScreen(viewModel = hiltViewModel(), onBack = { navController.popBackStack() })
                }
            }
        }
    }
}
