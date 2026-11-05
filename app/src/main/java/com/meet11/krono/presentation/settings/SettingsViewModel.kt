package com.meet11.krono.presentation.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.core.theme.ThemePaletteSeed
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.data.preferences.ThemeMode
import com.meet11.krono.data.preferences.ThemeSettings
import com.meet11.krono.domain.repository.ContestRepository
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
    private val preferencesManager: PreferencesManager,
    private val contestRepository: ContestRepository
) : ViewModel() {

    val uiState: StateFlow<SettingsUiState> = combine(
        preferencesManager.themeSettings,
        preferencesManager.reminderLeadMinutes
    ) { theme, lead -> SettingsUiState(theme, lead) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SettingsUiState())

    fun setThemeMode(mode: ThemeMode) = launch { preferencesManager.setThemeMode(mode) }

    fun setThemePalette(palette: ThemePaletteSeed) = launch {
        preferencesManager.setThemePalette(palette)
        // Picking an accent implies the user wants it visible.
        preferencesManager.setDynamicColor(false)
    }

    fun setDynamicColor(enabled: Boolean) = launch { preferencesManager.setDynamicColor(enabled) }

    fun setReminderLeadMinutes(minutes: Int) = launch {
        preferencesManager.setReminderLeadMinutes(minutes)
        // Existing reminders previously kept their old lead time forever.
        contestRepository.updateReminderLeadTime(minutes)
    }

    private fun launch(block: suspend () -> Unit) {
        viewModelScope.launch { block() }
    }
}
