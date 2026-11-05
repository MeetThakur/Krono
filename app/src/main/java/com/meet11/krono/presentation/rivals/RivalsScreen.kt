package com.meet11.krono.presentation.rivals

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Groups
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meet11.krono.core.designsystem.Caption
import com.meet11.krono.core.designsystem.EmptyState
import com.meet11.krono.core.designsystem.HandleAvatar
import com.meet11.krono.core.designsystem.IconAction
import com.meet11.krono.core.designsystem.KronoButton
import com.meet11.krono.core.designsystem.KronoCard
import com.meet11.krono.core.designsystem.ProgressTrack
import com.meet11.krono.core.designsystem.ScreenTitle
import com.meet11.krono.core.designsystem.SectionHeader
import com.meet11.krono.core.designsystem.SegmentedControl
import com.meet11.krono.core.designsystem.Tag
import com.meet11.krono.core.designsystem.TagTone
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.ui.CollectMessages
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.presentation.common.AddHandleSheet
import kotlin.math.abs

private val Gutter = 20.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RivalsScreen(viewModel: RivalsViewModel, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val isAdding by viewModel.isAdding.collectAsStateWithLifecycle()
    CollectMessages(viewModel.messages)

    var showAdd by rememberSaveable { mutableStateOf(false) }
    var pendingDelete by remember { mutableStateOf<LeaderboardEntry?>(null) }
    val c = Krono.colors

    PullToRefreshBox(
        isRefreshing = state.isRefreshing,
        onRefresh = viewModel::refresh,
        modifier = modifier.fillMaxSize()
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize().statusBarsPadding(),
            contentPadding = PaddingValues(start = Gutter, end = Gutter, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            item(key = "title") {
                ScreenTitle(
                    title = "Rivals",
                    eyebrow = "Head-to-head",
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    IconAction(Icons.Rounded.Add, "Add rival", onClick = { showAdd = true }, active = true, size = 44.dp, iconSize = 22.dp)
                }
            }

            item(key = "platforms") {
                SegmentedControl(
                    options = Platform.trackable,
                    selected = state.selectedPlatform,
                    onSelect = viewModel::selectPlatform,
                    label = { p ->
                        val n = state.rivalCountByPlatform[p] ?: 0
                        if (n > 0) "${p.displayName} $n" else p.displayName
                    },
                    modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)
                )
            }

            val me = state.me
            val opponent = state.opponent
            if (me != null && opponent != null) {
                item(key = "h2h") {
                    HeadToHead(me, opponent, Modifier.animateItem())
                }
            } else if (state.isLoaded && me == null) {
                item(key = "noProfile") {
                    KronoCard(color = c.surfaceSunken) {
                        Text(
                            "Connect your ${state.selectedPlatform.displayName} profile on Today to see where you stand.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = c.textSecondary
                        )
                    }
                }
            }

            item(key = "standingsHeader") {
                SectionHeader("Standings", count = state.leaderboard.size.takeIf { it > 0 }, modifier = Modifier.padding(top = 12.dp))
            }

            if (state.isLoaded && state.leaderboard.none { !it.isMe }) {
                item(key = "empty") {
                    EmptyState(
                        icon = Icons.Rounded.Groups,
                        title = "No rivals on ${state.selectedPlatform.displayName}",
                        message = "Add a friend's handle and Krono will rank you side by side.",
                        action = { KronoButton("Add a rival", onClick = { showAdd = true }, leadingIcon = Icons.Rounded.Add) }
                    )
                }
            }

            if (state.leaderboard.isNotEmpty() && state.leaderboard.any { !it.isMe }) {
                itemsIndexed(state.leaderboard, key = { _, e -> e.id }) { index, entry ->
                    StandingRow(
                        position = index + 1,
                        entry = entry,
                        maxScore = state.maxScore,
                        isOpponent = entry.id == opponent?.id,
                        onClick = { viewModel.selectOpponent(entry) },
                        onRemove = { pendingDelete = entry },
                        modifier = Modifier.animateItem()
                    )
                }
                item(key = "hint") {
                    Text(
                        "Tap a rival to compare head-to-head",
                        style = MaterialTheme.typography.bodySmall,
                        color = c.textTertiary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                    )
                }
            }
        }
    }

    if (showAdd) {
        AddHandleSheet(
            title = "Track a rival",
            subtitle = "Compare ratings and solved counts with a friend.",
            confirmLabel = "Add rival",
            isLoading = isAdding,
            initialPlatform = state.selectedPlatform,
            onDismiss = { showAdd = false },
            onConfirm = { p, h -> viewModel.addRival(p, h) { showAdd = false } }
        )
    }

    pendingDelete?.let { entry ->
        AlertDialog(
            onDismissRequest = { pendingDelete = null },
            containerColor = c.surface,
            title = { Text("Remove @${entry.username}?", style = MaterialTheme.typography.titleLarge) },
            text = { Text("They'll be removed from your standings.", color = c.textSecondary) },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteRival(entry)
                    pendingDelete = null
                }) { Text("Remove", color = c.live) }
            },
            dismissButton = { TextButton(onClick = { pendingDelete = null }) { Text("Cancel", color = c.textSecondary) } }
        )
    }
}

@Composable
private fun HeadToHead(me: LeaderboardEntry, opponent: LeaderboardEntry, modifier: Modifier = Modifier) {
    val c = Krono.colors
    val bothRated = me.hasRating && opponent.hasRating
    val metric = if (bothRated) "Rating" else "Solved"
    val mine = if (bothRated) me.rating!! else me.problemsSolved
    val theirs = if (bothRated) opponent.rating!! else opponent.problemsSolved
    val diff = mine - theirs
    val total = (mine + theirs).coerceAtLeast(1)

    KronoCard(modifier = modifier.fillMaxWidth(), borderColor = c.lineStrong, contentPadding = PaddingValues(20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Caption("$metric · you vs @${opponent.username}")
            Spacer(Modifier.weight(1f))
            Tag(
                text = when {
                    diff > 0 -> "Ahead +$diff"
                    diff < 0 -> "Behind ${diff}"
                    else -> "Tied"
                },
                tone = when {
                    diff > 0 -> TagTone.Success
                    diff < 0 -> TagTone.Live
                    else -> TagTone.Neutral
                }
            )
        }
        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.Bottom) {
            Side(label = "You", handle = me.username, value = mine, highlighted = true, modifier = Modifier.weight(1f))
            Text("vs", style = Readout.small, color = c.textTertiary, modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp))
            Side(label = "Rival", handle = opponent.username, value = theirs, highlighted = false, alignEnd = true, modifier = Modifier.weight(1f))
        }
        Spacer(Modifier.height(16.dp))
        // Tug-of-war bar: your share of the combined score.
        Row(Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp))) {
            val share = mine.toFloat() / total
            Box(Modifier.weight(share.coerceIn(0.02f, 0.98f)).fillMaxHeight().background(c.accent))
            Spacer(Modifier.width(3.dp))
            Box(Modifier.weight((1f - share).coerceIn(0.02f, 0.98f)).fillMaxHeight().background(c.lineStrong))
        }
        if (bothRated) {
            Spacer(Modifier.height(10.dp))
            Text(
                text = if (diff >= 0) "You're ${abs(diff)} points clear." else "${abs(diff)} points to close the gap.",
                style = MaterialTheme.typography.bodySmall,
                color = c.textSecondary
            )
        }
    }
}

@Composable
private fun Side(
    label: String,
    handle: String,
    value: Int,
    highlighted: Boolean,
    modifier: Modifier = Modifier,
    alignEnd: Boolean = false
) {
    val c = Krono.colors
    Column(modifier, horizontalAlignment = if (alignEnd) Alignment.End else Alignment.Start) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            if (!alignEnd) HandleAvatar(handle, size = 28.dp, highlighted = highlighted)
            if (!alignEnd) Spacer(Modifier.width(8.dp))
            Column(horizontalAlignment = if (alignEnd) Alignment.End else Alignment.Start) {
                Caption(label)
                Text("@$handle", style = MaterialTheme.typography.labelMedium, color = c.textSecondary, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            if (alignEnd) Spacer(Modifier.width(8.dp))
            if (alignEnd) HandleAvatar(handle, size = 28.dp)
        }
        Spacer(Modifier.height(10.dp))
        Text(value.toString(), style = Readout.large, color = if (highlighted) c.textPrimary else c.textSecondary, maxLines = 1)
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
private fun StandingRow(
    position: Int,
    entry: LeaderboardEntry,
    maxScore: Int,
    isOpponent: Boolean,
    onClick: () -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier
) {
    val c = Krono.colors
    val border = when {
        entry.isMe -> c.accent.copy(alpha = if (c.isDark) 0.55f else 1f)
        isOpponent -> c.lineStrong
        else -> c.line
    }
    KronoCard(
        modifier = modifier
            .fillMaxWidth()
            .clip(com.meet11.krono.core.theme.CardShape)
            .combinedClickable(onClick = onClick, onLongClick = { if (!entry.isMe) onRemove() }),
        borderColor = border,
        contentPadding = PaddingValues(start = 14.dp, end = 6.dp, top = 12.dp, bottom = 12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                position.toString().padStart(2, '0'),
                style = Readout.small,
                color = if (position == 1) c.accentInk else c.textTertiary,
                modifier = Modifier.width(26.dp)
            )
            HandleAvatar(entry.username, size = 36.dp, highlighted = entry.isMe)
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "@${entry.username}",
                        style = MaterialTheme.typography.titleSmall,
                        color = c.textPrimary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    if (entry.isMe) {
                        Spacer(Modifier.width(6.dp))
                        Tag("You", tone = TagTone.Accent)
                    }
                }
                Spacer(Modifier.height(2.dp))
                Text(
                    listOfNotNull(entry.rank?.replaceFirstChar { it.uppercase() }, "${entry.problemsSolved} solved").joinToString(" · "),
                    style = MaterialTheme.typography.bodySmall,
                    color = c.textTertiary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(Modifier.height(8.dp))
                ProgressTrack(
                    progress = entry.score.toFloat() / maxScore,
                    color = if (entry.isMe) c.accent else c.textTertiary,
                    height = 3.dp
                )
            }
            Spacer(Modifier.width(12.dp))
            Text(entry.score.toString(), style = Readout.medium, color = c.textPrimary)
            if (!entry.isMe) {
                IconButton(onClick = onRemove) {
                    Icon(Icons.Rounded.Close, contentDescription = "Remove @${entry.username}", tint = c.textTertiary, modifier = Modifier.width(16.dp))
                }
            } else {
                Spacer(Modifier.width(48.dp))
            }
        }
    }
}
