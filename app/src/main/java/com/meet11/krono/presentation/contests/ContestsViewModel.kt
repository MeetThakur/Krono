package com.meet11.krono.presentation.contests

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.ContestPhase
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.repository.ContestRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.util.Calendar
import javax.inject.Inject

data class ContestSection(
    val title: String,
    val isLive: Boolean,
    val contests: List<Contest>
)

data class ContestsUiState(
    val sections: List<ContestSection> = emptyList(),
    val totalRoundsCount: Int = 0,
    val selectedPlatform: Platform? = null,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class ContestsViewModel @Inject constructor(
    private val contestRepository: ContestRepository
) : ViewModel() {

    private val selectedPlatformFlow = MutableStateFlow<Platform?>(null)
    private val isLoadingFlow = MutableStateFlow(false)
    private val errorFlow = MutableStateFlow<String?>(null)

    val uiState: StateFlow<ContestsUiState> = combine(
        contestRepository.getContests(),
        selectedPlatformFlow,
        isLoadingFlow,
        errorFlow
    ) { contests, platform, loading, error ->
        val nowMs = System.currentTimeMillis()

        // Filter out finished contests older than 1 hour, and filter by platform
        val validContests = contests.filter { c ->
            val end = if (c.endTime > 0L) c.endTime else (c.startTime + (c.durationSeconds ?: 0L) * 1000L)
            end >= nowMs && (platform == null || c.platform == platform)
        }.sortedBy { it.startTime }

        val ongoing = mutableListOf<Contest>()
        val today = mutableListOf<Contest>()
        val tomorrow = mutableListOf<Contest>()
        val thisWeek = mutableListOf<Contest>()
        val later = mutableListOf<Contest>()

        val nowCal = Calendar.getInstance()

        validContests.forEach { c ->
            val startMs = c.startTime
            val endMs = if (c.endTime > 0L) c.endTime else (startMs + (c.durationSeconds ?: 0L) * 1000L)

            val isRunning = c.phase == ContestPhase.CODING || c.isLive || (startMs <= nowMs && nowMs <= endMs)
            if (isRunning) {
                ongoing.add(c)
                return@forEach
            }

            val cCal = Calendar.getInstance().apply { timeInMillis = startMs }
            val sameYear = nowCal.get(Calendar.YEAR) == cCal.get(Calendar.YEAR)
            val dayDiff = cCal.get(Calendar.DAY_OF_YEAR) - nowCal.get(Calendar.DAY_OF_YEAR)

            if (sameYear && dayDiff == 0) {
                today.add(c)
            } else if (sameYear && dayDiff == 1) {
                tomorrow.add(c)
            } else if (sameYear && dayDiff in 2..7) {
                thisWeek.add(c)
            } else {
                later.add(c)
            }
        }

        val sections = mutableListOf<ContestSection>()
        if (ongoing.isNotEmpty()) sections.add(ContestSection("LIVE NOW", true, ongoing))
        if (today.isNotEmpty()) sections.add(ContestSection("TODAY", false, today))
        if (tomorrow.isNotEmpty()) sections.add(ContestSection("TOMORROW", false, tomorrow))
        if (thisWeek.isNotEmpty()) sections.add(ContestSection("THIS WEEK", false, thisWeek))
        if (later.isNotEmpty()) sections.add(ContestSection("LATER", false, later))

        ContestsUiState(
            sections = sections,
            totalRoundsCount = validContests.size,
            selectedPlatform = platform,
            isLoading = loading,
            error = error
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = ContestsUiState()
    )

    init {
        syncContests()
    }

    fun selectPlatform(platform: Platform?) {
        selectedPlatformFlow.value = platform
    }

    fun toggleReminder(contestId: String, currentSet: Boolean) {
        viewModelScope.launch {
            contestRepository.toggleReminder(contestId, !currentSet)
        }
    }

    fun syncContests() {
        viewModelScope.launch {
            isLoadingFlow.value = true
            contestRepository.syncContests()
            isLoadingFlow.value = false
        }
    }
}
