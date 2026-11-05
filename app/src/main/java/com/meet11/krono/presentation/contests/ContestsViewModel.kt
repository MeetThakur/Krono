package com.meet11.krono.presentation.contests

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.core.ui.UiMessage
import com.meet11.krono.core.ui.tickerFlow
import com.meet11.krono.core.util.toUserMessage
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.repository.ContestRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.temporal.ChronoUnit
import javax.inject.Inject

enum class SectionKind(val title: String) { LIVE("Live now"), TODAY("Today"), TOMORROW("Tomorrow"), WEEK("This week"), LATER("Later") }

data class ContestSection(val kind: SectionKind, val contests: List<Contest>)

data class ContestsUiState(
    val isLoaded: Boolean = false,
    val sections: List<ContestSection> = emptyList(),
    val totalCount: Int = 0,
    val countsByPlatform: Map<Platform, Int> = emptyMap(),
    val selectedPlatform: Platform? = null,
    val isRefreshing: Boolean = false
)

@HiltViewModel
class ContestsViewModel @Inject constructor(
    private val contestRepository: ContestRepository
) : ViewModel() {

    private val selectedPlatform = MutableStateFlow<Platform?>(null)
    private val refreshing = MutableStateFlow(false)
    private val messageChannel = Channel<UiMessage>(Channel.BUFFERED)
    val messages = messageChannel.receiveAsFlow()

    val uiState: StateFlow<ContestsUiState> = combine(
        contestRepository.getContests(),
        selectedPlatform,
        refreshing,
        tickerFlow()
    ) { contests, platform, isRefreshing, now ->
        val active = contests.filter { !it.isFinishedAt(now) }
        val visible = active.filter { platform == null || it.platform == platform }.sortedBy { it.startTime }

        val zone = ZoneId.systemDefault()
        val today = LocalDate.now(zone)
        val grouped = visible.groupBy { c ->
            if (c.isLiveAt(now)) SectionKind.LIVE
            else when (ChronoUnit.DAYS.between(today, Instant.ofEpochMilli(c.startTime).atZone(zone).toLocalDate())) {
                0L -> SectionKind.TODAY
                1L -> SectionKind.TOMORROW
                in 2L..6L -> SectionKind.WEEK
                else -> SectionKind.LATER
            }
        }

        ContestsUiState(
            isLoaded = true,
            sections = SectionKind.entries.mapNotNull { k -> grouped[k]?.let { ContestSection(k, it) } },
            totalCount = visible.size,
            countsByPlatform = active.groupingBy { it.platform }.eachCount(),
            selectedPlatform = platform,
            isRefreshing = isRefreshing
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ContestsUiState())

    init {
        refresh(userInitiated = false)
    }

    fun selectPlatform(platform: Platform?) {
        selectedPlatform.value = platform
    }

    fun refresh(userInitiated: Boolean = true) {
        if (refreshing.value) return
        viewModelScope.launch {
            refreshing.value = userInitiated
            val result = contestRepository.syncContests()
            refreshing.value = false
            result.onFailure {
                if (userInitiated) messageChannel.send(UiMessage(it.toUserMessage("Couldn't refresh contests.")))
            }
        }
    }

    fun toggleReminder(contest: Contest) {
        viewModelScope.launch {
            val enable = !contest.reminderSet
            val ok = contestRepository.setReminder(contest.id, enable)
            when {
                !ok -> messageChannel.send(UiMessage("Too close to the start to set a reminder"))
                enable -> messageChannel.send(UiMessage("Reminder set for ${contest.name}"))
            }
        }
    }
}
