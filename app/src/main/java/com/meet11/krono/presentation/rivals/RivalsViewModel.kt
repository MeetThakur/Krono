package com.meet11.krono.presentation.rivals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.core.ui.UiMessage
import com.meet11.krono.core.util.toUserMessage
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.RivalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LeaderboardEntry(
    val id: String,
    val username: String,
    val rating: Int?,
    val maxRating: Int?,
    val rank: String?,
    val problemsSolved: Int,
    val isMe: Boolean
) {
    val hasRating: Boolean get() = rating != null && rating > 0
    /** Comparable score: rating when rated, otherwise solved count. */
    val score: Int get() = if (hasRating) rating!! else problemsSolved
}

data class RivalsUiState(
    val isLoaded: Boolean = false,
    val selectedPlatform: Platform = Platform.CODEFORCES,
    val leaderboard: List<LeaderboardEntry> = emptyList(),
    val me: LeaderboardEntry? = null,
    val opponent: LeaderboardEntry? = null,
    val maxScore: Int = 1,
    val rivalCountByPlatform: Map<Platform, Int> = emptyMap(),
    val isRefreshing: Boolean = false
)

@HiltViewModel
class RivalsViewModel @Inject constructor(
    private val rivalRepository: RivalRepository,
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val selectedPlatform = MutableStateFlow<Platform?>(null)
    private val selectedRivalId = MutableStateFlow<String?>(null)
    private val refreshing = MutableStateFlow(false)
    private val messageChannel = Channel<UiMessage>(Channel.BUFFERED)
    val messages = messageChannel.receiveAsFlow()

    private val _isAdding = MutableStateFlow(false)
    val isAdding: StateFlow<Boolean> = _isAdding.asStateFlow()

    val uiState: StateFlow<RivalsUiState> = combine(
        rivalRepository.getRivals(),
        profileRepository.getProfiles(),
        selectedPlatform,
        selectedRivalId,
        refreshing
    ) { rivals, profiles, chosen, rivalId, isRefreshing ->
        // Default to the first platform the user actually uses, instead of always Codeforces.
        val platform = chosen
            ?: profiles.firstOrNull { it.platform in Platform.trackable }?.platform
            ?: rivals.firstOrNull()?.platform
            ?: Platform.CODEFORCES

        val me = profiles.firstOrNull { it.platform == platform }?.let {
            LeaderboardEntry(it.id, it.username, it.rating, it.maxRating, it.rank, it.problemsSolved, isMe = true)
        }
        val others = rivals.filter { it.platform == platform }.map {
            LeaderboardEntry(it.id, it.username, it.rating, it.maxRating, it.rank, it.problemsSolved, isMe = false)
        }
        val board = (listOfNotNull(me) + others).sortedWith(
            compareByDescending<LeaderboardEntry> { it.hasRating }.thenByDescending { it.score }
        )
        val opponent = others.firstOrNull { it.id == rivalId } ?: others.maxByOrNull { it.score }

        RivalsUiState(
            isLoaded = true,
            selectedPlatform = platform,
            leaderboard = board,
            me = me,
            opponent = opponent,
            maxScore = board.maxOfOrNull { it.score }?.coerceAtLeast(1) ?: 1,
            rivalCountByPlatform = rivals.groupingBy { it.platform }.eachCount(),
            isRefreshing = isRefreshing
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), RivalsUiState())

    fun selectPlatform(platform: Platform) {
        selectedPlatform.value = platform
        selectedRivalId.value = null
    }

    fun selectOpponent(entry: LeaderboardEntry) {
        if (!entry.isMe) selectedRivalId.value = entry.id
    }

    fun refresh() {
        if (refreshing.value) return
        viewModelScope.launch {
            refreshing.value = true
            val rivals = async { rivalRepository.refreshRivals() }
            val profiles = async { profileRepository.refreshProfiles() }
            val failure = rivals.await().exceptionOrNull() ?: profiles.await().exceptionOrNull()
            refreshing.value = false
            if (failure != null) messageChannel.send(UiMessage(failure.toUserMessage("Couldn't refresh standings.")))
        }
    }

    fun addRival(platform: Platform, handle: String, onSuccess: () -> Unit) {
        if (_isAdding.value) return
        viewModelScope.launch {
            _isAdding.value = true
            rivalRepository.addRival(platform, handle)
                .onSuccess {
                    selectPlatform(platform)
                    selectedRivalId.value = it.id
                    onSuccess()
                    messageChannel.send(UiMessage("Now tracking @${it.username}"))
                }
                .onFailure { messageChannel.send(UiMessage(it.toUserMessage("Couldn't add that rival."))) }
            _isAdding.value = false
        }
    }

    fun deleteRival(entry: LeaderboardEntry) {
        viewModelScope.launch {
            rivalRepository.deleteRival(entry.id)
            if (selectedRivalId.value == entry.id) selectedRivalId.value = null
            messageChannel.send(UiMessage("Removed @${entry.username}"))
        }
    }
}
