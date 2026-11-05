package com.meet11.krono.presentation.common

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.unit.dp
import com.meet11.krono.core.designsystem.Caption
import com.meet11.krono.core.designsystem.IconAction
import com.meet11.krono.core.designsystem.KronoButton
import com.meet11.krono.core.designsystem.SegmentedControl
import com.meet11.krono.core.designsystem.pressable
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.theme.TileShape
import com.meet11.krono.domain.model.Platform

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KronoSheet(onDismiss: () -> Unit, content: @Composable ColumnScope.() -> Unit) {
    val c = Krono.colors
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = c.background,
        dragHandle = { BottomSheetDefaults.DragHandle(color = c.lineStrong) }
    ) {
        Column(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 16.dp)
                .navigationBarsPadding()
                .imePadding(),
            content = content
        )
    }
}

@Composable
fun AddHandleSheet(
    title: String,
    subtitle: String,
    confirmLabel: String,
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onConfirm: (Platform, String) -> Unit,
    initialPlatform: Platform = Platform.CODEFORCES
) {
    val c = Krono.colors
    var platform by rememberSaveable { mutableStateOf(initialPlatform) }
    var handle by rememberSaveable { mutableStateOf("") }
    val focus = remember { FocusRequester() }
    val keyboard = LocalSoftwareKeyboardController.current
    val canSubmit = handle.isNotBlank() && !isLoading
    val submit = {
        if (canSubmit) {
            keyboard?.hide()
            onConfirm(platform, handle.trim())
        }
    }

    LaunchedEffect(Unit) { runCatching { focus.requestFocus() } }

    KronoSheet(onDismiss) {
        Text(title, style = MaterialTheme.typography.headlineSmall, color = c.textPrimary)
        Spacer(Modifier.height(4.dp))
        Text(subtitle, style = MaterialTheme.typography.bodyMedium, color = c.textSecondary)
        Spacer(Modifier.height(20.dp))

        Caption("Platform")
        Spacer(Modifier.height(8.dp))
        SegmentedControl(
            options = Platform.trackable,
            selected = platform,
            onSelect = { platform = it },
            label = { it.displayName }
        )
        Spacer(Modifier.height(16.dp))

        Caption("Handle")
        Spacer(Modifier.height(8.dp))
        BasicTextField(
            value = handle,
            onValueChange = { v -> handle = v.filterNot { it.isWhitespace() }.take(40) },
            singleLine = true,
            enabled = !isLoading,
            textStyle = Readout.medium.copy(color = c.textPrimary),
            cursorBrush = SolidColor(c.accentInk),
            keyboardOptions = KeyboardOptions(
                capitalization = KeyboardCapitalization.None,
                autoCorrectEnabled = false,
                imeAction = ImeAction.Done
            ),
            keyboardActions = KeyboardActions(onDone = { submit() }),
            modifier = Modifier.fillMaxWidth().focusRequester(focus),
            decorationBox = { inner ->
                Row(
                    Modifier
                        .fillMaxWidth()
                        .heightIn(min = 56.dp)
                        .clip(TileShape)
                        .background(c.surface)
                        .border(1.dp, if (handle.isNotEmpty()) c.lineStrong else c.line, TileShape)
                        .padding(horizontal = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("@", style = Readout.medium, color = c.textTertiary)
                    Spacer(Modifier.width(4.dp))
                    Box(Modifier.weight(1f)) {
                        if (handle.isEmpty()) Text("tourist", style = Readout.medium, color = c.textTertiary)
                        inner()
                    }
                }
            }
        )
        Spacer(Modifier.height(20.dp))
        KronoButton(
            text = confirmLabel,
            onClick = submit,
            enabled = handle.isNotBlank(),
            loading = isLoading,
            modifier = Modifier.fillMaxWidth(),
            height = 52.dp
        )
    }
}

@Composable
fun GoalTargetSheet(
    currentTarget: Int,
    onDismiss: () -> Unit,
    onSelect: (Int) -> Unit
) {
    val c = Krono.colors
    var value by rememberSaveable { mutableIntStateOf(currentTarget.coerceIn(1, 99)) }

    KronoSheet(onDismiss) {
        Text("Daily goal", style = MaterialTheme.typography.headlineSmall, color = c.textPrimary)
        Spacer(Modifier.height(4.dp))
        Text("How many problems do you want to solve each day?", style = MaterialTheme.typography.bodyMedium, color = c.textSecondary)
        Spacer(Modifier.height(24.dp))

        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.Center) {
            IconAction(Icons.Rounded.Remove, "Decrease", onClick = { value = (value - 1).coerceAtLeast(1) }, size = 52.dp, iconSize = 22.dp)
            Column(Modifier.width(140.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(value.toString(), style = Readout.hero.copy(fontSize = Readout.hero.fontSize * 1.4f), color = c.textPrimary)
                Caption(if (value == 1) "problem / day" else "problems / day")
            }
            IconAction(Icons.Rounded.Add, "Increase", onClick = { value = (value + 1).coerceAtMost(99) }, size = 52.dp, iconSize = 22.dp)
        }

        Spacer(Modifier.height(24.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            listOf(1, 2, 3, 5, 10).forEach { preset ->
                val selected = preset == value
                Box(
                    Modifier
                        .weight(1f)
                        .height(44.dp)
                        .pressable(shape = TileShape) { value = preset }
                        .background(if (selected) c.inverse else c.surface)
                        .border(1.dp, if (selected) c.inverse else c.line, TileShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(preset.toString(), style = Readout.small, color = if (selected) c.onInverse else c.textPrimary)
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        KronoButton(
            text = if (value == currentTarget) "Keep $value per day" else "Set goal to $value",
            onClick = { onSelect(value) },
            modifier = Modifier.fillMaxWidth(),
            height = 52.dp
        )
    }
}

