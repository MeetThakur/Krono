package com.meet11.krono.presentation.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.core.designsystem.RatingHistoryState
import com.meet11.krono.core.ui.UiMessage
import com.meet11.krono.core.ui.tickerFlow
import com.meet11.krono.core.util.toUserMessage
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.model.DailyGoal
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Potd
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.repository.ContestRepository
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.StreakRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeStats(
    val totalSolved: Int = 0,
    val totalContests: Int = 0,
    val peakRating: Int? = null
)

data class HomeUiState(
    val isLoaded: Boolean = false,
    val profiles: List<Profile> = emptyList(),
    val dailyGoal: DailyGoal = DailyGoal(0, 0, 2, 0, false, 0f),
    val stats: HomeStats = HomeStats(),
    val liveContests: List<Contest> = emptyList(),
    val nextContest: Contest? = null,
    val upcomingContests: List<Contest> = emptyList(),
    val potd: Potd? = null,
    val isPotdLoading: Boolean = true,
    val isRefreshing: Boolean = false
)

private data class Transient(
    val potd: Potd? = null,
    val potdLoading: Boolean = true,
    val refreshing: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val profileRepository: ProfileRepository,
    private val streakRepository: StreakRepository,
    private val contestRepository: ContestRepository
) : ViewModel() {

    private val transient = MutableStateFlow(Transient())
    private val messageChannel = Channel<UiMessage>(Channel.BUFFERED)
    val messages = messageChannel.receiveAsFlow()

    private val _isAddingProfile = MutableStateFlow(false)
    val isAddingProfile: StateFlow<Boolean> = _isAddingProfile.asStateFlow()

    private val _ratingHistory = MutableStateFlow<RatingHistoryState>(RatingHistoryState.Loading)
    val ratingHistory: StateFlow<RatingHistoryState> = _ratingHistory.asStateFlow()

    private val contestBuckets = combine(contestRepository.getContests(), tickerFlow()) { contests, now ->
        val active = contests.filter { !it.isFinishedAt(now) }.sortedBy { it.startTime }
        val live = active.filter { it.isLiveAt(now) }
        val upcoming = active.filter { it.isUpcomingAt(now) }
        Triple(live, upcoming.firstOrNull(), upcoming.drop(1).take(4))
    }.distinctUntilChanged()

    val uiState: StateFlow<HomeUiState> = combine(
        profileRepository.getProfiles(),
        streakRepository.getDailyGoal(),
        contestBuckets,
        transient
    ) { profiles, goal, (live, next, upcoming), t ->
        HomeUiState(
            isLoaded = true,
            profiles = profiles,
            dailyGoal = goal,
            stats = HomeStats(
                totalSolved = profiles.sumOf { it.problemsSolved },
                totalContests = profiles.sumOf { it.totalContests },
                peakRating = profiles.mapNotNull { it.maxRating ?: it.rating }.filter { it > 0 }.maxOrNull()
            ),
            liveContests = live,
            nextContest = next,
            upcomingContests = upcoming,
            potd = t.potd,
            isPotdLoading = t.potdLoading,
            isRefreshing = t.refreshing
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), HomeUiState())

    init {
        refresh(userInitiated = false)
    }

    /** Pull-to-refresh and first load. Background loads stay quiet unless everything fails. */
    fun refresh(userInitiated: Boolean = true) {
        if (transient.value.refreshing) return
        viewModelScope.launch {
            transient.update { it.copy(refreshing = userInitiated) }
            val profilesJob = async {
                val profiles = profileRepository.getProfiles().first()
                val stale = profiles.any { System.currentTimeMillis() - it.lastUpdated > STALE_MS }
                if (userInitiated || stale) profileRepository.refreshProfiles() else Result.success(Unit)
            }
            val contestsJob = async { contestRepository.syncContests() }
            val potdJob = async { fetchPotd() }

            val contests = contestsJob.await()
            val profiles = profilesJob.await()
            potdJob.await()
            transient.update { it.copy(refreshing = false) }

            val failure = contests.exceptionOrNull() ?: profiles.exceptionOrNull()
            if (failure != null && userInitiated) {
                messageChannel.send(UiMessage(failure.toUserMessage("Couldn't refresh. Showing saved data.")))
            }
        }
    }

    private suspend fun fetchPotd() {
        transient.update { it.copy(potdLoading = true) }
        val potd = profileRepository.getLeetCodePotd().getOrNull()
        transient.update { it.copy(potd = potd ?: it.potd, potdLoading = false) }
    }

    fun recordManualSolve() {
        viewModelScope.launch {
            streakRepository.recordManualSolve()
            messageChannel.send(UiMessage("Solve logged", actionLabel = "Undo", onAction = ::undoSolve))
        }
    }

    private fun undoSolve() {
        viewModelScope.launch { streakRepository.undoManualSolve() }
    }

    fun setDailyGoalTarget(target: Int) {
        viewModelScope.launch { streakRepository.setDailyGoalTarget(target) }
    }

    fun addProfile(platform: Platform, handle: String, onSuccess: () -> Unit) {
        if (_isAddingProfile.value) return
        viewModelScope.launch {
            _isAddingProfile.value = true
            profileRepository.addProfile(platform, handle)
                .onSuccess {
                    onSuccess()
                    messageChannel.send(UiMessage("Connected @${it.username} on ${platform.displayName}"))
                }
                .onFailure { messageChannel.send(UiMessage(it.toUserMessage("Couldn't add that profile."))) }
            _isAddingProfile.value = false
        }
    }

    fun deleteProfile(id: String) {
        viewModelScope.launch { profileRepository.deleteProfile(id) }
    }

    fun loadRatingHistory(profile: Profile) {
        _ratingHistory.value = RatingHistoryState.Loading
        viewModelScope.launch {
            _ratingHistory.value = profileRepository.getRatingHistory(profile).fold(
                onSuccess = { points -> if (points == null) RatingHistoryState.Unavailable else RatingHistoryState.Loaded(points) },
                onFailure = { RatingHistoryState.Unavailable }
            )
        }
    }

    fun toggleReminder(contest: Contest) {
        viewModelScope.launch {
            val enable = !contest.reminderSet
            val ok = contestRepository.setReminder(contest.id, enable)
            when {
                !ok -> messageChannel.send(UiMessage("Too close to the start to set a reminder"))
                enable -> messageChannel.send(UiMessage("We'll remind you before ${contest.name}"))
            }
        }
    }

    private companion object {
        const val STALE_MS = 30 * 60 * 1000L
    }
}

