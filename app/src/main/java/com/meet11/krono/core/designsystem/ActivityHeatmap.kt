package com.meet11.krono.core.designsystem

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.meet11.krono.core.theme.SleekCardShape
import com.meet11.krono.core.theme.StatusSuccess
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

@Composable
fun ActivityHeatmap(
    activityMap: Map<String, Int>,
    modifier: Modifier = Modifier,
    weeksCount: Int = 13
) {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.US)
    val totalSubmissions = activityMap.values.sum()

    // Calculate matrix of days: weeksCount columns, 7 rows
    val cal = Calendar.getInstance()
    // Move to end of current week (Saturday)
    val dayOfWeek = cal.get(Calendar.DAY_OF_WEEK)
    cal.add(Calendar.DAY_OF_YEAR, Calendar.SATURDAY - dayOfWeek)

    val weeks = mutableListOf<List<Pair<String, Int>>>()
    for (w in 0 until weeksCount) {
        val daysInWeek = mutableListOf<Pair<String, Int>>()
        for (d in 0 until 7) {
            val dateKey = dateFormat.format(cal.time)
            val count = activityMap[dateKey] ?: 0
            daysInWeek.add(0, Pair(dateKey, count))
            cal.add(Calendar.DAY_OF_YEAR, -1)
        }
        weeks.add(0, daysInWeek)
    }

    BentoCard(
        modifier = modifier.fillMaxWidth(),
        containerColor = MaterialTheme.colorScheme.surfaceContainer,
        shape = SleekCardShape
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Activity Heatmap",
                    style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.Bold),
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "$totalSubmissions solves",
                    style = MaterialTheme.typography.labelSmall.copy(fontWeight = FontWeight.SemiBold),
                    color = StatusSuccess
                )
            }

            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                weeks.forEach { weekDays ->
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        weekDays.forEach { (_, count) ->
                            val cellColor = when {
                                count == 0 -> MaterialTheme.colorScheme.surfaceContainerHigh
                                count in 1..2 -> StatusSuccess.copy(alpha = 0.35f)
                                count in 3..4 -> StatusSuccess.copy(alpha = 0.70f)
                                else -> StatusSuccess
                            }

                            Box(
                                modifier = Modifier
                                    .size(13.dp)
                                    .clip(RoundedCornerShape(3.dp))
                                    .background(cellColor)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Legend Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Less",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.width(4.dp))
                listOf(
                    MaterialTheme.colorScheme.surfaceContainerHigh,
                    StatusSuccess.copy(alpha = 0.35f),
                    StatusSuccess.copy(alpha = 0.70f),
                    StatusSuccess
                ).forEach { c ->
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(c)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                }
                Text(
                    text = "More",
                    style = MaterialTheme.typography.labelSmall.copy(fontSize = 10.sp),
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
