package com.meet11.krono.presentation.contests

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.EventBusy
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meet11.krono.core.designsystem.ContestCard
import com.meet11.krono.core.designsystem.EmptyState
import com.meet11.krono.core.designsystem.KronoChip
import com.meet11.krono.core.designsystem.PulsingDot
import com.meet11.krono.core.designsystem.ScreenTitle
import com.meet11.krono.core.designsystem.SkeletonBlock
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.ui.CollectMessages
import com.meet11.krono.core.ui.rememberNotificationGate
import com.meet11.krono.domain.model.Platform

private val Gutter = 20.dp

@OptIn(ExperimentalMaterial3Api::class, androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
fun ContestsScreen(viewModel: ContestsViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    CollectMessages(viewModel.messages)
    val gate = rememberNotificationGate()
    val c = Krono.colors

    val haptics = com.meet11.krono.core.designsystem.rememberHaptics()
    PullToRefreshBox(
        isRefreshing = state.isRefreshing,
        onRefresh = { haptics.toggle(); viewModel.refresh() },
        modifier = modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().statusBarsPadding(),
            contentPadding = PaddingValues(bottom = 24.dp)
        ) {
            item(key = "title") {
                ScreenTitle(
                    title = "Contests",
                    eyebrow = "${state.totalCount} scheduled",
                    modifier = Modifier.padding(horizontal = Gutter).padding(top = 4.dp)
                )
            }

            stickyHeader(key = "filters") {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .background(c.background)
                        .horizontalScroll(rememberScrollState())
                        .padding(horizontal = Gutter, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    KronoChip("All", selected = state.selectedPlatform == null, onClick = { viewModel.selectPlatform(null) })
                    Platform.contestSources.forEach { p ->
                        val count = state.countsByPlatform[p] ?: 0
                        KronoChip(
                            text = if (count > 0) "${p.displayName} $count" else p.displayName,
                            selected = state.selectedPlatform == p,
                            onClick = { viewModel.selectPlatform(if (state.selectedPlatform == p) null else p) },
                            leadingDot = p.brandColor
                        )
                    }
                }
            }

            when {
                !state.isLoaded -> items(3, key = { "skeleton$it" }) {
                    SkeletonBlock(Modifier.padding(horizontal = Gutter, vertical = 6.dp).fillMaxWidth().height(170.dp))
                }
                state.sections.isEmpty() -> item(key = "empty") {
                    EmptyState(
                        icon = Icons.Rounded.EventBusy,
                        title = if (state.selectedPlatform != null) "Nothing on ${state.selectedPlatform!!.displayName}" else "No contests scheduled",
                        message = "Pull down to refresh. New rounds usually appear a few days ahead.",
                        modifier = Modifier.padding(horizontal = Gutter, vertical = 8.dp)
                    )
                }
                else -> state.sections.forEach { section ->
                    item(key = "h_${section.kind}", contentType = "header") {
                        Row(
                            Modifier.padding(horizontal = Gutter).padding(top = 18.dp, bottom = 10.dp).animateItem(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            if (section.kind == SectionKind.LIVE) {
                                PulsingDot(c.live, 7.dp)
                                Spacer(Modifier.width(8.dp))
                            }
                            Text(
                                section.kind.title,
                                style = MaterialTheme.typography.titleMedium,
                                color = if (section.kind == SectionKind.LIVE) c.live else c.textPrimary
                            )
                            Spacer(Modifier.width(8.dp))
                            Text(section.contests.size.toString(), style = Readout.tiny, color = c.textTertiary)
                        }
                    }
                    items(section.contests, key = { it.id }, contentType = { "contest" }) { contest ->
                        Box(Modifier.padding(horizontal = Gutter, vertical = 5.dp).animateItem()) {
                            ContestCard(
                                contest = contest,
                                onToggleReminder = { gate(!contest.reminderSet) { viewModel.toggleReminder(contest) } }
                            )
                        }
                    }
                }
            }
        }
    }
}

