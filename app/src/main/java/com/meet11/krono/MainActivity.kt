package com.meet11.krono

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.meet11.krono.core.theme.KronoTheme
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.data.preferences.ThemeMode
import com.meet11.krono.presentation.navigation.KronoApp
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            val themeSettings by preferencesManager.themeSettings.collectAsState(
                initial = com.meet11.krono.data.preferences.ThemeSettings()
            )

            val isDark = when (themeSettings.mode) {
                ThemeMode.SYSTEM -> isSystemInDarkTheme()
                ThemeMode.DARK -> true
                ThemeMode.LIGHT -> false
            }

            KronoTheme(
                darkTheme = isDark,
                dynamicColor = themeSettings.dynamicColor,
                palette = themeSettings.palette
            ) {
                KronoApp()
            }
        }
    }
}
