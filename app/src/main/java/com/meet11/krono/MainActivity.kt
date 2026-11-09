package com.meet11.krono

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.SideEffect
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.KronoTheme
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.data.preferences.ThemeMode
import com.meet11.krono.data.preferences.ThemeSettings
import com.meet11.krono.presentation.navigation.KronoApp
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    @Volatile
    private var themeReady = false

    override fun onCreate(savedInstanceState: Bundle?) {
        // Keep the system splash until DataStore answers, so there's no blank/wrong-theme frame.
        installSplashScreen().setKeepOnScreenCondition { !themeReady }
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            // null until DataStore answers (a few ms) — avoids flashing the wrong theme on cold start.
            val settings: ThemeSettings? by preferencesManager.themeSettings
                .collectAsStateWithLifecycle(initialValue = null)
            val systemDark = isSystemInDarkTheme()
            val current = settings ?: ThemeSettings()
            val isDark = when (current.mode) {
                ThemeMode.SYSTEM -> systemDark
                ThemeMode.DARK -> true
                ThemeMode.LIGHT -> false
            }

            SystemBars(isDark)
            KronoTheme(darkTheme = isDark) {
                if (settings == null) {
                    Box(Modifier.fillMaxSize().background(Krono.colors.background))
                } else {
                    SideEffect { themeReady = true }
                    KronoApp()
                }
            }
        }
    }

    @Composable
    private fun SystemBars(isDark: Boolean) {
        DisposableEffect(isDark) {
            val style = if (isDark) SystemBarStyle.dark(Color.TRANSPARENT)
            else SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT)
            enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
            onDispose { }
        }
    }
}
