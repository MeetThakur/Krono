package com.meet11.krono.core.designsystem

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.LinkOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.domain.model.Profile
import com.meet11.krono.domain.model.RatingPoint
import kotlinx.coroutines.launch
import java.text.NumberFormat

sealed interface RatingHistoryState {
    data object Loading : RatingHistoryState
    data object Unavailable : RatingHistoryState
    data class Loaded(val points: List<RatingPoint>) : RatingHistoryState
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileDetailSheet(
    profile: Profile,
    history: RatingHistoryState,
    onDismiss: () -> Unit,
    onDelete: (String) -> Unit
) {
    val c = Krono.colors
    val context = LocalContext.current
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val numbers = NumberFormat.getIntegerInstance()
    var confirmDisconnect by remember { mutableStateOf(false) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = c.background,
        shape = androidx.compose.foundation.shape.RoundedCornerShape(topStart = 32.dp, topEnd = 32.dp),
        dragHandle = { BottomSheetDefaults.DragHandle(width = 48.dp, height = 5.dp, color = c.edge) }
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 12.dp)
                .navigationBarsPadding()
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                PlatformMark(profile.platform, size = 48.dp)
                Spacer(Modifier.width(14.dp))
                Column(Modifier.weight(1f)) {
                    Text("@${profile.username}", style = MaterialTheme.typography.headlineSmall, color = c.textPrimary, maxLines = 1)
                    Text(
                        listOfNotNull(profile.platform.displayName, profile.rank?.replaceFirstChar { it.uppercase() }).joinToString(" · "),
                        style = MaterialTheme.typography.bodyMedium,
                        color = c.textSecondary
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricTile("Rating", profile.rating?.takeIf { it > 0 }?.toString() ?: "—", Modifier.weight(1f), pastel = c.butter)
                MetricTile("Peak", profile.maxRating?.takeIf { it > 0 }?.toString() ?: "—", Modifier.weight(1f), pastel = c.sky)
            }
            Spacer(Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                MetricTile("Solved", numbers.format(profile.problemsSolved), Modifier.weight(1f), pastel = c.mint)
                MetricTile("Contests", numbers.format(profile.totalContests), Modifier.weight(1f), pastel = c.coral)
            }

            Spacer(Modifier.height(16.dp))
            when (history) {
                is RatingHistoryState.Loaded ->
                    if (history.points.size >= 2) {
                        RatingChart(points = history.points, lineColor = profile.platform.brandColor)
                    } else {
                        HistoryNote("Not enough rated contests to draw a history yet.")
                    }
                RatingHistoryState.Loading -> SkeletonBlock(Modifier.fillMaxWidth().height(214.dp))
                RatingHistoryState.Unavailable -> HistoryNote("Rating history isn't available for ${profile.platform.displayName}.")
            }

            Spacer(Modifier.height(20.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                profile.platform.profileUrl(profile.username)?.let { url ->
                    KronoButton(
                        text = "View profile",
                        onClick = { openUrl(context, url) },
                        style = ButtonStyle.Secondary,
                        trailingIcon = Icons.AutoMirrored.Rounded.OpenInNew,
                        modifier = Modifier.weight(1f)
                    )
                }
                KronoButton(
                    text = "Disconnect",
                    onClick = { confirmDisconnect = true },
                    style = ButtonStyle.Danger,
                    leadingIcon = Icons.Rounded.LinkOff,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }

    if (confirmDisconnect) {
        AlertDialog(
            onDismissRequest = { confirmDisconnect = false },
            containerColor = c.surface,
            title = { Text("Disconnect @${profile.username}?", style = MaterialTheme.typography.titleLarge) },
            text = { Text("Krono will stop syncing this ${profile.platform.displayName} profile. You can add it again any time.", color = c.textSecondary) },
            confirmButton = {
                TextButton(onClick = {
                    confirmDisconnect = false
                    scope.launch { sheetState.hide() }.invokeOnCompletion { onDelete(profile.id) }
                }) { Text("Disconnect", color = c.live) }
            },
            dismissButton = {
                TextButton(onClick = { confirmDisconnect = false }) { Text("Cancel", color = c.textSecondary) }
            }
        )
    }
}

@Composable
private fun MetricTile(label: String, value: String, modifier: Modifier = Modifier, pastel: androidx.compose.ui.graphics.Color) {
    val c = Krono.colors
    KronoCard(
        modifier = modifier,
        color = tintFill(pastel),
        borderColor = tintEdge(pastel),
        shadowColor = tintShadow(pastel),
        contentPadding = PaddingValues(16.dp)
    ) {
        Caption(label, color = c.onTint.copy(alpha = 0.7f))
        Spacer(Modifier.height(6.dp))
        Text(value, style = Readout.large, color = c.onTint, maxLines = 1)
    }
}

@Composable
private fun HistoryNote(text: String) {
    KronoCard(Modifier.fillMaxWidth(), color = Krono.colors.surfaceSunken) {
        Box(Modifier.fillMaxWidth().padding(vertical = 12.dp), contentAlignment = Alignment.Center) {
            Text(text, style = MaterialTheme.typography.bodyMedium, color = Krono.colors.textSecondary)
        }
    }
}
