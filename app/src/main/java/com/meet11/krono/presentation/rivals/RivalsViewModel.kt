package com.meet11.krono.presentation.rivals

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.model.Rival
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.RivalRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LeaderboardEntry(
    val id: String,
    val username: String,
    val rating: Int?,
    val rank: String?,
    val problemsSolved: Int,
    val isMe: Boolean
)

data class RivalsUiState(
    val selectedPlatform: Platform = Platform.CODEFORCES,
    val leaderboard: List<LeaderboardEntry> = emptyList(),
    val myUser: LeaderboardEntry? = null,
    val topOpponent: LeaderboardEntry? = null,
    val selectedRivalForArena: LeaderboardEntry? = null,
    val maxRating: Int = 1,
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class RivalsViewModel @Inject constructor(
    private val rivalRepository: RivalRepository,
    private val profileRepository: ProfileRepository
) : ViewModel() {

    private val selectedPlatformFlow = MutableStateFlow(Platform.CODEFORCES)
    private val selectedRivalIdFlow = MutableStateFlow<String?>(null)
    private val isLoadingFlow = MutableStateFlow(false)
    private val errorFlow = MutableStateFlow<String?>(null)

    val uiState: StateFlow<RivalsUiState> = combine(
        rivalRepository.getRivals(),
        profileRepository.getProfiles(),
        selectedPlatformFlow,
        selectedRivalIdFlow,
        combine(isLoadingFlow, errorFlow) { loading, error -> Pair(loading, error) }
    ) { rivals, profiles, platform, selectedRivalId, (loading, error) ->
        val platformRivals = rivals.filter { it.platform == platform }
        val userProfileForPlatform = profiles.firstOrNull { it.platform == platform }

        val myEntry = userProfileForPlatform?.let { p ->
            LeaderboardEntry(
                id = p.id,
                username = p.username,
                rating = p.rating,
                rank = p.rank,
                problemsSolved = p.problemsSolved,
                isMe = true
            )
        }

        val rivalEntries = platformRivals.map { r ->
            LeaderboardEntry(
                id = r.id,
                username = r.username,
                rating = r.rating,
                rank = r.rank,
                problemsSolved = r.problemsSolved,
                isMe = false
            )
        }

        val allEntries = mutableListOf<LeaderboardEntry>()
        if (myEntry != null) allEntries.add(myEntry)
        allEntries.addAll(rivalEntries)

        val sortedLeaderboard = allEntries.sortedWith { a, b ->
            val aHasRating = a.rating != null && a.rating > 0
            val bHasRating = b.rating != null && b.rating > 0
            when {
                aHasRating && bHasRating -> (b.rating ?: 0).compareTo(a.rating ?: 0)
                aHasRating && !bHasRating -> -1
                !aHasRating && bHasRating -> 1
                else -> b.problemsSolved.compareTo(a.problemsSolved)
            }
        }

        val topRival = rivalEntries.maxByOrNull { it.rating ?: it.problemsSolved }
        val arenaRival = if (selectedRivalId != null) {
            rivalEntries.firstOrNull { it.id == selectedRivalId } ?: topRival
        } else {
            topRival
        }

        val calculatedMax = sortedLeaderboard.maxOfOrNull { it.rating ?: it.problemsSolved }?.coerceAtLeast(1) ?: 1

        RivalsUiState(
            selectedPlatform = platform,
            leaderboard = sortedLeaderboard,
            myUser = myEntry,
            topOpponent = topRival,
            selectedRivalForArena = arenaRival,
            maxRating = calculatedMax,
            isLoading = loading,
            error = error
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = RivalsUiState()
    )

    fun selectPlatform(platform: Platform) {
        selectedPlatformFlow.value = platform
        selectedRivalIdFlow.value = null
    }

    fun selectRivalForArena(rival: LeaderboardEntry) {
        if (!rival.isMe) {
            selectedRivalIdFlow.value = rival.id
        }
    }

    fun addRival(platform: Platform, handle: String) {
        viewModelScope.launch {
            isLoadingFlow.value = true
            errorFlow.value = null
            rivalRepository.addRival(platform, handle)
                .onFailure { errorFlow.value = it.localizedMessage ?: "Failed to add rival" }
            isLoadingFlow.value = false
        }
    }

    fun deleteRival(id: String) {
        viewModelScope.launch {
            rivalRepository.deleteRival(id)
            if (selectedRivalIdFlow.value == id) {
                selectedRivalIdFlow.value = null
            }
        }
    }

    fun clearError() {
        errorFlow.value = null
    }
}
