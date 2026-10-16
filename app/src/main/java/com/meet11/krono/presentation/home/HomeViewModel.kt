package com.meet11.krono.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.ContestPhase
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.repository.ContestRepository
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.StreakRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CumulativeStats(
    val totalSolved: Int = 0,
    val totalContests: Int = 0,
    val totalSubmissions: Int = 0
)

data class HomeUiState(
    val profiles: List<Profile> = emptyList(),
    val dailyGoal: DailyGoal = DailyGoal(0, 0, 2, 0, false, 0f),
    val stats: CumulativeStats = CumulativeStats(),
    val ongoingContests: List<Contest> = emptyList(),
    val upcomingContests: List<Contest> = emptyList(),
    val potd: Potd? = null,
    val isRefreshing: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val streakRepository: StreakRepository,
    private val contestRepository: ContestRepository
) : ViewModel() {

    private val isRefreshingFlow = MutableStateFlow(false)
    private val errorFlow = MutableStateFlow<String?>(null)
    private val potdFlow = MutableStateFlow<Potd?>(null)

    init {
        fetchPotd()
    }

    val uiState: StateFlow<HomeUiState> = combine(
        profileRepository.getProfiles(),
        streakRepository.getDailyGoal(),
        contestRepository.getContests(),
        potdFlow,
        combine(isRefreshingFlow, errorFlow) { refreshing, error -> Pair(refreshing, error) }
    ) { profiles, goal, allContests, potd, (refreshing, error) ->
        val totalSolved = profiles.sumOf { it.problemsSolved }
        val totalContests = profiles.sumOf { it.totalContests }
        val totalSubs = profiles.sumOf { if (it.totalSubmissions > 0) it.totalSubmissions else it.problemsSolved }

        val now = System.currentTimeMillis()
        val ongoing = allContests.filter { c ->
            val end = if (c.endTime > 0L) c.endTime else (c.startTime + (c.durationSeconds ?: 0L) * 1000L)
            c.phase == ContestPhase.CODING || c.isLive || (c.startTime <= now && now <= end)
        }

        val upcoming = allContests.filter { c ->
            val end = if (c.endTime > 0L) c.endTime else (c.startTime + (c.durationSeconds ?: 0L) * 1000L)
            end >= now && !ongoing.contains(c)
        }.sortedBy { it.startTime }.take(5)

        HomeUiState(
            profiles = profiles,
            dailyGoal = goal,
            stats = CumulativeStats(
                totalSolved = totalSolved,
                totalContests = totalContests,
                totalSubmissions = totalSubs
            ),
            ongoingContests = ongoing,
            upcomingContests = upcoming,
            potd = potd,
            isRefreshing = refreshing,
            error = error
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HomeUiState()
    )

    private fun fetchPotd() {
        viewModelScope.launch {
            profileRepository.getLeetCodePotd().onSuccess {
                potdFlow.value = it
            }
        }
    }

    fun recordManualSolve() {
        viewModelScope.launch {
            streakRepository.recordManualSolve()
        }
    }

    fun setDailyGoalTarget(target: Int) {
        viewModelScope.launch {
            streakRepository.setDailyGoalTarget(target)
        }
    }

    fun addProfile(platform: Platform, handle: String) {
        viewModelScope.launch {
            isRefreshingFlow.value = true
            errorFlow.value = null
            profileRepository.addProfile(platform, handle)
                .onFailure { errorFlow.value = it.localizedMessage ?: "Failed to add profile" }
            isRefreshingFlow.value = false
        }
    }

    fun deleteProfile(id: String) {
        viewModelScope.launch {
            profileRepository.deleteProfile(id)
        }
    }

    fun refreshProfiles() {
        viewModelScope.launch {
            isRefreshingFlow.value = true
            profileRepository.refreshProfiles()
            contestRepository.syncContests()
            fetchPotd()
            isRefreshingFlow.value = false
        }
    }

    fun toggleReminder(contestId: String, currentSet: Boolean) {
        viewModelScope.launch {
            contestRepository.toggleReminder(contestId, !currentSet)
        }
    }

    fun clearError() {
        errorFlow.value = null
    }
}
