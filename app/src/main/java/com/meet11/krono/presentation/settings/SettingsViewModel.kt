package com.meet11.krono.presentation.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.core.theme.ThemePaletteSeed
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.data.preferences.ThemeMode
import com.meet11.krono.data.preferences.ThemeSettings
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val themeSettings: ThemeSettings = ThemeSettings(),
    val reminderLeadMinutes: Int = 15
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val preferencesManager: PreferencesManager
) : ViewModel() {

    val uiState: StateFlow<SettingsUiState> = combine(
        preferencesManager.themeSettings,
        preferencesManager.reminderLeadMinutes
    ) { theme, leadMinutes ->
        SettingsUiState(theme, leadMinutes)
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SettingsUiState()
    )

    fun setThemeMode(mode: ThemeMode) {
        viewModelScope.launch {
            preferencesManager.setThemeMode(mode)
        }
    }

    fun setThemePalette(palette: ThemePaletteSeed) {
        viewModelScope.launch {
            preferencesManager.setThemePalette(palette)
        }
    }

    fun setDynamicColor(enabled: Boolean) {
        viewModelScope.launch {
            preferencesManager.setDynamicColor(enabled)
        }
    }

    fun setReminderLeadMinutes(minutes: Int) {
        viewModelScope.launch {
            preferencesManager.setReminderLeadMinutes(minutes)
        }
    }
}
