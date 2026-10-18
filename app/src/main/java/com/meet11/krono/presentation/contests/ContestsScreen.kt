package com.meet11.krono.presentation.contests

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.CalendarMonth
import androidx.compose.material.icons.rounded.GridView
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.designsystem.ContestCard
import com.meet11.krono.core.theme.FlameRed
import com.meet11.krono.core.theme.PillShape
import com.meet11.krono.domain.model.Platform

@Composable
fun ContestsScreen(
    viewModel: ContestsViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    val platforms = listOf(
        Platform.CODEFORCES,
        Platform.LEETCODE,
        Platform.CODECHEF,
        Platform.ATCODER,
        Platform.GEEKSFORGEEKS,
        Platform.HACKERRANK
    )

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding(),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 90.dp)
    ) {
        // 1. Top Bar
        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                // Scheduled rounds pill
                Row(
                    modifier = Modifier
                        .clip(PillShape)
                        .background(Color(0x14FFFFFF))
                        .padding(horizontal = 10.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Rounded.CalendarMonth,
                        contentDescription = null,
                        tint = Color(0xB3FFFFFF),
                        modifier = Modifier.size(13.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${uiState.totalRoundsCount} ROUNDS SCHEDULED",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Black,
                        color = Color(0xB3FFFFFF),
                        letterSpacing = 0.5.sp
                    )
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Contests",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            }
        }

        // 2. Horizontal Scrolling Platform Selector Pills
        item {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // "All" Pill
                val isAllSelected = uiState.selectedPlatform == null
                val allBg = if (isAllSelected) Color.White else Color(0xFF16181F)
                val allText = if (isAllSelected) Color.Black else Color.White
                val allBorder = if (isAllSelected) Color.White else Color(0x1FFFFFFF)

                Row(
                    modifier = Modifier
                        .clip(PillShape)
                        .background(allBg)
                        .border(1.dp, allBorder, PillShape)
                        .clickable { viewModel.selectPlatform(null) }
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Rounded.GridView,
                        contentDescription = null,
                        tint = allText,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "All",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = allText
                    )
                }

                // Platform Pills
                platforms.forEach { platform ->
                    val isSelected = uiState.selectedPlatform == platform
                    val bg = if (isSelected) Color.White else Color(0xFF16181F)
                    val textColor = if (isSelected) Color.Black else Color.White
                    val border = if (isSelected) Color.White else Color(0x1FFFFFFF)

                    Row(
                        modifier = Modifier
                            .clip(PillShape)
                            .background(bg)
                            .border(1.dp, border, PillShape)
                            .clickable { viewModel.selectPlatform(platform) }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(CircleShape)
                                .background(platform.brandColor)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = platform.displayName,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = textColor
                        )
                    }
                }
            }
        }

        // 3. Grouped Sections
        if (uiState.isLoading && uiState.sections.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color.White)
                }
            }
        } else if (uiState.sections.isEmpty()) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 40.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No contests found",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0x80FFFFFF)
                    )
                }
            }
        } else {
            uiState.sections.forEach { section ->
                item {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (section.isLive) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(FlameRed)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "LIVE NOW",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                color = FlameRed,
                                letterSpacing = 1.sp
                            )
                        } else {
                            Text(
                                text = section.title,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0x99FFFFFF),
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }

                items(section.contests, key = { it.id }) { contest ->
                    Box(modifier = Modifier.padding(horizontal = 20.dp)) {
                        ContestCard(
                            contest = contest,
                            onToggleReminder = { viewModel.toggleReminder(contest.id, it) }
                        )
                    }
                }
            }
        }
    }
}
