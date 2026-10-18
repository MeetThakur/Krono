package com.meet11.krono.presentation.home

import android.content.Intent
import android.net.Uri
import android.view.HapticFeedbackConstants
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowForward
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.PersonAdd
import androidx.compose.material.icons.rounded.Remove
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.SwapVert
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.designsystem.ActivityHubBento
import com.meet11.krono.core.designsystem.ContestCard
import com.meet11.krono.core.designsystem.DailyChallengeCard
import com.meet11.krono.core.designsystem.DailyGoalCard
import com.meet11.krono.core.designsystem.PillChip
import com.meet11.krono.core.designsystem.PlatformProfileCard
import com.meet11.krono.core.designsystem.ProfileDetailSheet
import com.meet11.krono.core.theme.FlameGold
import com.meet11.krono.core.theme.FlameRed
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.core.theme.StatusSuccess
import com.meet11.krono.domain.model.Platform
import com.meet11.krono.domain.model.Profile
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun HomeScreen(
    viewModel: HomeViewModel,
    onNavigateToSettings: () -> Unit,
    onNavigateToContests: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    var isAddProfileOpen by remember { mutableStateOf(false) }
    var isGoalTargetOpen by remember { mutableStateOf(false) }
    var selectedProfileForDetail by remember { mutableStateOf<Profile?>(null) }
    val view = LocalView.current
    val context = LocalContext.current

    val dateHeaderFormat = SimpleDateFormat("EEE, MMM d", Locale.US)
    val currentDateStr = dateHeaderFormat.format(Date()).uppercase()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding(),
        verticalArrangement = Arrangement.spacedBy(18.dp),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        // 1. Google Native M3 Top App Bar
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    // Date Capsule: Live Dot + Date
                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(Color(0x14FFFFFF))
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(6.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF34D399))
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = currentDateStr,
                            color = Color(0xB3FFFFFF),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 0.5.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Krono",
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }

                // Settings Gear Button
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF1E212A))
                        .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(14.dp))
                        .clickable {
                            view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                            onNavigateToSettings()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Settings,
                        contentDescription = "Settings",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }
            }
        }

        // 2. Live Now Alert Banner
        if (uiState.ongoingContests.isNotEmpty()) {
            val liveContest = uiState.ongoingContests.first()
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0x24EF4444))
                        .border(1.dp, Color(0x59EF4444), RoundedCornerShape(20.dp))
                        .clickable { onNavigateToContests() }
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(FlameRed)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                val count = uiState.ongoingContests.size
                                Text(
                                    text = "$count ${if (count == 1) "CONTEST" else "CONTESTS"} ACTIVE NOW",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = FlameRed,
                                    letterSpacing = 0.5.sp
                                )
                                Text(
                                    text = liveContest.name,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Row(
                            modifier = Modifier
                                .clip(PillShape)
                                .background(FlameRed)
                                .padding(horizontal = 14.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Join",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(
                                imageVector = Icons.AutoMirrored.Rounded.ArrowForward,
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }
                }
            }
        }

        // 3. PROFILES Section
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "PROFILES",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0x99FFFFFF),
                        letterSpacing = 1.sp
                    )

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier
                                .clip(PillShape)
                                .background(Color(0x14FFFFFF))
                                .clickable { isAddProfileOpen = true }
                                .padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Add,
                                contentDescription = "Add Profile",
                                tint = Color.White,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Add",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                        }

                        if (uiState.profiles.size > 1) {
                            Row(
                                modifier = Modifier
                                    .clip(PillShape)
                                    .background(Color(0x14FFFFFF))
                                    .padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.SwapVert,
                                    contentDescription = "Reorder",
                                    tint = Color(0x99FFFFFF),
                                    modifier = Modifier.size(12.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Reorder",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color(0x99FFFFFF)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Profile Carousel or Empty Card
                if (uiState.profiles.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp)
                            .clip(RoundedCornerShape(24.dp))
                            .background(Color(0xFF16181F))
                            .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(24.dp))
                            .clickable { isAddProfileOpen = true }
                            .padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(Color(0x14FFFFFF)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Rounded.PersonAdd,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Connect a Profile",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color.White
                                )
                                Text(
                                    text = "Codeforces, LeetCode, AtCoder, CodeChef...",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0x80FFFFFF)
                                )
                            }
                            Icon(
                                imageVector = Icons.Rounded.ChevronRight,
                                contentDescription = null,
                                tint = Color(0x80FFFFFF)
                            )
                        }
                    }
                } else {
                    LazyRow(
                        contentPadding = PaddingValues(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        items(uiState.profiles, key = { it.id }) { profile ->
                            PlatformProfileCard(
                                profile = profile,
                                onClick = { selectedProfileForDetail = profile }
                            )
                        }
                    }
                }
            }
        }

        // 4. Daily Goal & Streak Engine Card
        item {
            Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                DailyGoalCard(
                    dailyGoal = uiState.dailyGoal,
                    onLogSolve = { viewModel.recordManualSolve() },
                    onOpenTargetDialog = { isGoalTargetOpen = true }
                )
            }
        }

        // 5. ACTIVITY HUB Section
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "ACTIVITY HUB",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0x99FFFFFF),
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                ActivityHubBento(stats = uiState.stats)
            }
        }

        // 6. DAILY CHALLENGE (LeetCode POTD) Section
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Text(
                    text = "DAILY CHALLENGE",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0x99FFFFFF),
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(10.dp))
                DailyChallengeCard(potd = uiState.potd)
            }
        }

        // 7. UPCOMING SCHEDULE Section
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "UPCOMING SCHEDULE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0x99FFFFFF),
                        letterSpacing = 1.sp
                    )

                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .clickable { onNavigateToContests() }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Full Calendar",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0x99FFFFFF)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Icon(
                            imageVector = Icons.AutoMirrored.Rounded.ArrowForward,
                            contentDescription = null,
                            tint = Color(0x99FFFFFF),
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    uiState.upcomingContests.forEach { contest ->
                        ContestCard(
                            contest = contest,
                            onToggleReminder = { viewModel.toggleReminder(contest.id, it) }
                        )
                    }
                }
            }
        }
    }

    // Connect Profile Dialog
    if (isAddProfileOpen) {
        AddProfileDialog(
            onDismiss = { isAddProfileOpen = false },
            onConfirm = { platform, handle ->
                viewModel.addProfile(platform, handle)
                isAddProfileOpen = false
            }
        )
    }

    // Goal Target Selector Modal
    if (isGoalTargetOpen) {
        GoalTargetDialog(
            currentTarget = uiState.dailyGoal.targetProblems,
            onDismiss = { isGoalTargetOpen = false },
            onSelect = {
                viewModel.setDailyGoalTarget(it)
                isGoalTargetOpen = false
            }
        )
    }

    // Profile Detail Modal Sheet
    selectedProfileForDetail?.let { profile ->
        ProfileDetailSheet(
            profile = profile,
            onDismiss = { selectedProfileForDetail = null },
            onDelete = {
                viewModel.deleteProfile(it)
                selectedProfileForDetail = null
            }
        )
    }

    // Error Dialog
    uiState.error?.let { err ->
        AlertDialog(
            onDismissRequest = { viewModel.clearError() },
            title = { Text("Error") },
            text = { Text(err) },
            confirmButton = {
                TextButton(onClick = { viewModel.clearError() }) {
                    Text("OK")
                }
            }
        )
    }
}

@Composable
fun GoalTargetDialog(
    currentTarget: Int,
    onDismiss: () -> Unit,
    onSelect: (Int) -> Unit
) {
    var customInput by remember {
        mutableStateOf(if (currentTarget !in listOf(1, 2, 3, 5)) currentTarget.toString() else "")
    }

    val customInt = customInput.toIntOrNull()
    val isValid = customInt != null && customInt > 0 && customInt <= 999

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF181D27),
        shape = RoundedCornerShape(24.dp),
        title = {
            Text(
                text = "Set Daily Practice Target",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    text = "Choose how many problems you aim to solve each day across all platforms.",
                    fontSize = 13.sp,
                    color = Color(0xB3FFFFFF)
                )

                // Quick Presets Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(1, 2, 3, 5).forEach { num ->
                        val isSelected = currentTarget == num
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .height(54.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) Color.White else Color(0x14FFFFFF))
                                .border(
                                    1.dp,
                                    if (isSelected) Color.White else Color(0x1FFFFFFF),
                                    RoundedCornerShape(16.dp)
                                )
                                .clickable { onSelect(num) },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "$num",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black,
                                color = if (isSelected) Color.Black else Color.White
                            )
                        }
                    }
                }

                HorizontalDivider(color = Color(0x1FFFFFFF), thickness = 1.dp)

                // Custom Target Section
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Custom Target",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xB3FFFFFF)
                        )
                        if (currentTarget !in listOf(1, 2, 3, 5)) {
                            Text(
                                text = "Current: $currentTarget/day",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = FlameGold
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Stepper Decrease [-]
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0x14FFFFFF))
                                .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(16.dp))
                                .clickable {
                                    val current = customInput.toIntOrNull() ?: currentTarget
                                    val next = (current - 1).coerceAtLeast(1)
                                    customInput = next.toString()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Remove,
                                contentDescription = "Decrease Target",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // Number input field
                        BasicTextField(
                            value = customInput,
                            onValueChange = { str ->
                                if (str.all { it.isDigit() } && str.length <= 3) {
                                    customInput = str
                                }
                            },
                            textStyle = TextStyle(
                                color = Color.White,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                textAlign = TextAlign.Center
                            ),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = ImeAction.Done
                            ),
                            keyboardActions = KeyboardActions(
                                onDone = {
                                    if (isValid) {
                                        onSelect(customInt!!)
                                    }
                                }
                            ),
                            cursorBrush = SolidColor(Color.White),
                            decorationBox = { innerTextField ->
                                Box(
                                    modifier = Modifier
                                        .height(54.dp)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(Color(0x14FFFFFF))
                                        .border(
                                            1.dp,
                                            if (isValid && currentTarget == customInt) FlameGold else Color(0x1FFFFFFF),
                                            RoundedCornerShape(16.dp)
                                        )
                                        .padding(horizontal = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (customInput.isEmpty()) {
                                        Text(
                                            text = "Goal",
                                            color = Color(0x66FFFFFF),
                                            fontSize = 14.sp,
                                            textAlign = TextAlign.Center
                                        )
                                    }
                                    innerTextField()
                                }
                            },
                            modifier = Modifier.weight(1f)
                        )

                        // Stepper Increase [+]
                        Box(
                            modifier = Modifier
                                .size(54.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0x14FFFFFF))
                                .border(1.dp, Color(0x1FFFFFFF), RoundedCornerShape(16.dp))
                                .clickable {
                                    val current = customInput.toIntOrNull() ?: currentTarget
                                    val next = (current + 1).coerceAtMost(999)
                                    customInput = next.toString()
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Add,
                                contentDescription = "Increase Target",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }

                        // Apply Button
                        Box(
                            modifier = Modifier
                                .height(54.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isValid) Color.White else Color(0x14FFFFFF))
                                .border(
                                    1.dp,
                                    if (isValid) Color.White else Color(0x1FFFFFFF),
                                    RoundedCornerShape(16.dp)
                                )
                                .clickable(enabled = isValid) {
                                    onSelect(customInt!!)
                                }
                                .padding(horizontal = 16.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Set",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isValid) Color.Black else Color(0x4DFFFFFF)
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close", color = Color(0xB3FFFFFF))
            }
        }
    )
}

@Composable
fun AddProfileDialog(
    onDismiss: () -> Unit,
    onConfirm: (Platform, String) -> Unit
) {
    var selectedPlatform by remember { mutableStateOf(Platform.CODEFORCES) }
    var handle by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Connect Profile",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Select Platform",
                    fontSize = 12.sp,
                    color = Color(0xB3FFFFFF)
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    listOf(Platform.CODEFORCES, Platform.LEETCODE, Platform.CODECHEF).forEach { p ->
                        PillChip(
                            selected = selectedPlatform == p,
                            text = p.displayName,
                            onClick = { selectedPlatform = p },
                            selectedColor = p.brandColor
                        )
                    }
                }
                OutlinedTextField(
                    value = handle,
                    onValueChange = { handle = it },
                    label = { Text("Handle / Username") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (handle.isNotBlank()) onConfirm(selectedPlatform, handle) },
                enabled = handle.isNotBlank()
            ) {
                Text("Connect")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
