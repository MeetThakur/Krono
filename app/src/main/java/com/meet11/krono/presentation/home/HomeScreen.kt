package com.meet11.krono.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.size
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.EventBusy
import androidx.compose.material.icons.rounded.PersonAddAlt
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meet11.krono.core.designsystem.AddProfileTile
import com.meet11.krono.core.designsystem.ButtonStyle
import com.meet11.krono.core.designsystem.Caption
import com.meet11.krono.core.designsystem.ContestRow
import com.meet11.krono.core.designsystem.DailyChallengeCard
import com.meet11.krono.core.designsystem.DailyGoalCard
import com.meet11.krono.core.designsystem.EmptyState
import com.meet11.krono.core.designsystem.IconAction
import com.meet11.krono.core.designsystem.KronoButton
import com.meet11.krono.core.designsystem.KronoCard
import com.meet11.krono.core.designsystem.NextContestHero
import com.meet11.krono.core.designsystem.PlatformProfileCard
import com.meet11.krono.core.designsystem.ProfileDetailSheet
import com.meet11.krono.core.designsystem.SectionHeader
import com.meet11.krono.core.designsystem.SkeletonBlock
import com.meet11.krono.core.designsystem.StatItem
import com.meet11.krono.core.designsystem.StatsStrip
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.ui.CollectMessages
import com.meet11.krono.core.ui.rememberNotificationGate
import com.meet11.krono.core.util.rememberTimeFormatter
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.presentation.common.AddHandleSheet
import com.meet11.krono.presentation.common.GoalTargetSheet

private val Gutter = 20.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToSettings: () -> Unit,
    onNavigateToContests: () -> Unit,
    modifier: Modifier = Modifier
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val isAdding by viewModel.isAddingProfile.collectAsStateWithLifecycle()
    val history by viewModel.ratingHistory.collectAsStateWithLifecycle()
    CollectMessages(viewModel.messages)

    var showAddProfile by rememberSaveable { mutableStateOf(false) }
    var showGoalSheet by rememberSaveable { mutableStateOf(false) }
    var detailProfileId by rememberSaveable { mutableStateOf<String?>(null) }

    val gate = rememberNotificationGate()
    val onToggleReminder: (Contest) -> Unit = { contest ->
        gate(!contest.reminderSet) { viewModel.toggleReminder(contest) }
    }
    val c = Krono.colors
    val fmt = rememberTimeFormatter()

    val haptics = com.meet11.krono.core.designsystem.rememberHaptics()
    PullToRefreshBox(
        isRefreshing = state.isRefreshing,
        onRefresh = { haptics.toggle(); viewModel.refresh() },
        modifier = modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().statusBarsPadding(),
            contentPadding = PaddingValues(bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(28.dp)
        ) {
            item(key = "header", contentType = "header") {
                Row(
                    Modifier.fillMaxWidth().padding(horizontal = Gutter).padding(top = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    androidx.compose.foundation.layout.Box(
                        Modifier
                            .size(52.dp)
                            .clip(androidx.compose.foundation.shape.RoundedCornerShape(topStart = 18.dp, topEnd = 14.dp, bottomEnd = 18.dp, bottomStart = 12.dp))
                            .background(c.butter)
                            .border(3.dp, if (c.isDark) c.butter else c.lineStrong, androidx.compose.foundation.shape.RoundedCornerShape(topStart = 18.dp, topEnd = 14.dp, bottomEnd = 18.dp, bottomStart = 12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        androidx.compose.foundation.Image(
                            painter = androidx.compose.ui.res.painterResource(com.meet11.krono.R.drawable.ic_launcher_foreground),
                            contentDescription = null,
                            modifier = Modifier.size(60.dp)
                        )
                    }
                    Spacer(Modifier.width(14.dp))
                    Column(Modifier.weight(1f)) {
                        Caption(fmt.header())
                        Spacer(Modifier.height(4.dp))
                        Text("Krono", style = MaterialTheme.typography.displaySmall, color = c.textPrimary)
                    }
                    IconAction(Icons.Rounded.Settings, contentDescription = "Settings", onClick = onNavigateToSettings, size = 44.dp, iconSize = 20.dp)
                }
            }

            // Hero: a live contest takes precedence over the next upcoming one.
            val hero = state.liveContests.firstOrNull() ?: state.nextContest
            item(key = "hero", contentType = "hero") {
                Column(Modifier.padding(horizontal = Gutter).animateItem()) {
                    when {
                        hero != null -> NextContestHero(contest = hero, onToggleReminder = { onToggleReminder(hero) })
                        !state.isLoaded -> SkeletonBlock(Modifier.fillMaxWidth().height(260.dp))
                        else -> EmptyState(
                            icon = Icons.Rounded.EventBusy,
                            title = "No contests scheduled",
                            message = "Pull down to refresh the schedule from Codeforces, LeetCode, CodeChef and AtCoder."
                        )
                    }
                    if (state.liveContests.size > 1) {
                        Spacer(Modifier.height(10.dp))
                        KronoButton(
                            text = "${state.liveContests.size - 1} more live now",
                            onClick = onNavigateToContests,
                            style = ButtonStyle.Secondary,
                            modifier = Modifier.fillMaxWidth(),
                            height = 40.dp
                        )
                    }
                }
            }

            item(key = "profiles", contentType = "profiles") {
                Column {
                    SectionHeader(
                        title = "Profiles",
                        count = state.profiles.size.takeIf { it > 0 },
                        actionLabel = if (state.profiles.isNotEmpty()) "Add" else null,
                        onAction = { showAddProfile = true },
                        modifier = Modifier.padding(horizontal = Gutter)
                    )
                    Spacer(Modifier.height(10.dp))
                    if (!state.isLoaded) {
                        // Don't flash "connect your first profile" before the saved profiles have loaded.
                        SkeletonBlock(Modifier.padding(horizontal = Gutter).fillMaxWidth().height(164.dp))
                    } else if (state.profiles.isEmpty()) {
                        EmptyState(
                            icon = Icons.Rounded.PersonAddAlt,
                            title = "Connect your first profile",
                            message = "Track your Codeforces, LeetCode and CodeChef ratings in one place.",
                            modifier = Modifier.padding(horizontal = Gutter),
                            action = {
                                KronoButton("Connect profile", onClick = { showAddProfile = true }, leadingIcon = Icons.Rounded.Add)
                            }
                        )
                    } else {
                        LazyRow(
                            contentPadding = PaddingValues(horizontal = Gutter),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            items(state.profiles, key = { it.id }) { profile ->
                                PlatformProfileCard(
                                    profile = profile,
                                    onClick = {
                                        detailProfileId = profile.id
                                        viewModel.loadRatingHistory(profile)
                                    },
                                    modifier = Modifier.animateItem()
                                )
                            }
                            item(key = "add") { AddProfileTile(onClick = { showAddProfile = true }) }
                        }
                    }
                }
            }

            item(key = "goal", contentType = "goal") {
                Column(Modifier.padding(horizontal = Gutter)) {
                    SectionHeader("Daily practice")
                    Spacer(Modifier.height(10.dp))
                    if (state.isLoaded) {
                        DailyGoalCard(
                            dailyGoal = state.dailyGoal,
                            onLogSolve = viewModel::recordManualSolve,
                            onOpenTargetDialog = { showGoalSheet = true }
                        )
                    } else {
                        SkeletonBlock(Modifier.fillMaxWidth().height(206.dp))
                    }
                    if (state.profiles.isNotEmpty()) {
                        Spacer(Modifier.height(10.dp))
                        StatsStrip(
                            listOf(
                                StatItem("Solved", state.stats.totalSolved),
                                StatItem("Contests", state.stats.totalContests),
                                StatItem("Peak", state.stats.peakRating)
                            )
                        )
                    }
                }
            }

            item(key = "potd", contentType = "potd") {
                Column(Modifier.padding(horizontal = Gutter)) {
                    SectionHeader("Daily challenge")
                    Spacer(Modifier.height(10.dp))
                    DailyChallengeCard(potd = state.potd, isLoading = state.isPotdLoading)
                }
            }

            if (state.upcomingContests.isNotEmpty()) {
                item(key = "upcoming", contentType = "upcoming") {
                    Column(Modifier.padding(horizontal = Gutter)) {
                        SectionHeader("Coming up", actionLabel = "All contests", onAction = onNavigateToContests)
                        Spacer(Modifier.height(10.dp))
                        KronoCard(contentPadding = PaddingValues(vertical = 4.dp)) {
                            state.upcomingContests.forEachIndexed { index, contest ->
                                if (index > 0) {
                                    Box(Modifier.padding(start = 64.dp).fillMaxWidth().height(1.dp).background(c.line))
                                }
                                ContestRow(contest = contest, onToggleReminder = { onToggleReminder(contest) })
                            }
                        }
                    }
                }
            }
        }
    }

    if (showAddProfile) {
        AddHandleSheet(
            title = "Connect a profile",
            subtitle = "We'll pull your rating, rank and solved count.",
            confirmLabel = "Connect",
            isLoading = isAdding,
            onDismiss = { showAddProfile = false },
            onConfirm = { platform, handle -> viewModel.addProfile(platform, handle) { showAddProfile = false } }
        )
    }

    if (showGoalSheet) {
        GoalTargetSheet(
            currentTarget = state.dailyGoal.targetProblems,
            onDismiss = { showGoalSheet = false },
            onSelect = {
                viewModel.setDailyGoalTarget(it)
                showGoalSheet = false
            }
        )
    }

    val detailProfile = state.profiles.firstOrNull { it.id == detailProfileId }
    if (detailProfile != null) {
        ProfileDetailSheet(
            profile = detailProfile,
            history = history,
            onDismiss = { detailProfileId = null },
            onDelete = {
                viewModel.deleteProfile(it)
                detailProfileId = null
            }
        )
    }
}

