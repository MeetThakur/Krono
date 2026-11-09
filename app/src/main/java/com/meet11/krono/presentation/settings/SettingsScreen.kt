package com.meet11.krono.presentation.settings

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.OpenInNew
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.meet11.krono.BuildConfig
import com.meet11.krono.core.designsystem.Caption
import com.meet11.krono.core.designsystem.IconAction
import com.meet11.krono.core.designsystem.KronoCard
import com.meet11.krono.core.designsystem.SegmentedControl
import com.meet11.krono.core.designsystem.Tag
import com.meet11.krono.core.designsystem.TagTone
import com.meet11.krono.core.designsystem.openUrl
import com.meet11.krono.core.designsystem.pressable
import com.meet11.krono.core.theme.Krono
import com.meet11.krono.core.theme.Readout
import com.meet11.krono.core.theme.ThemePaletteSeed
import com.meet11.krono.data.preferences.ThemeMode

@Composable
fun SettingsScreen(viewModel: SettingsViewModel, onBack: () -> Unit, modifier: Modifier = Modifier) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val theme = state.themeSettings
    val c = Krono.colors
    val context = LocalContext.current

    // Re-read system permission state whenever the user comes back from system settings.
    var resumeTick by remember { mutableIntStateOf(0) }
    LifecycleResumeEffect(Unit) {
        resumeTick++
        onPauseOrDispose { }
    }
    val notificationsOn = remember(resumeTick) { notificationsAllowed(context) }
    val exactAlarmsOn = remember(resumeTick) { exactAlarmsAllowed(context) }

    Column(
        modifier
            .fillMaxSize()
            .background(c.background)
            .statusBarsPadding()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 20.dp)
            .navigationBarsPadding()
    ) {
        Spacer(Modifier.height(12.dp))
        IconAction(Icons.AutoMirrored.Rounded.ArrowBack, "Back", onClick = onBack, size = 44.dp, iconSize = 20.dp)
        Spacer(Modifier.height(16.dp))
        Text("Settings", style = MaterialTheme.typography.displaySmall, color = c.textPrimary)
        Spacer(Modifier.height(28.dp))

        Group("Appearance") {
            Caption("Theme")
            Spacer(Modifier.height(8.dp))
            SegmentedControl(
                options = ThemeMode.entries.toList(),
                selected = theme.mode,
                onSelect = viewModel::setThemeMode,
                label = { it.name.lowercase().replaceFirstChar(Char::uppercase) }
            )
        }

        Group("Reminders") {
            Caption("Notify me before a contest")
            Spacer(Modifier.height(8.dp))
            SegmentedControl(
                options = listOf(5, 15, 30, 60),
                selected = state.reminderLeadMinutes,
                onSelect = viewModel::setReminderLeadMinutes,
                label = { if (it == 60) "1 hour" else "$it min" }
            )
            Spacer(Modifier.height(16.dp))
            StatusRow(
                title = "Notifications",
                ok = notificationsOn,
                okText = "Allowed",
                badText = "Blocked",
                onFix = { openAppNotificationSettings(context) }
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                Spacer(Modifier.height(12.dp))
                StatusRow(
                    title = "Exact timing",
                    ok = exactAlarmsOn,
                    okText = "On",
                    badText = "Approximate",
                    onFix = { openExactAlarmSettings(context) }
                )
            }
        }

        Group("About") {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("Krono", style = MaterialTheme.typography.titleMedium, color = c.textPrimary)
                    Text("Competitive programming, on the clock.", style = MaterialTheme.typography.bodySmall, color = c.textSecondary)
                }
                Text("v${BuildConfig.VERSION_NAME}", style = Readout.tiny, color = c.textTertiary)
            }
            Spacer(Modifier.height(14.dp))
            LinkRow("Source code") { openUrl(context, "https://github.com/MeetThakur/Krono") }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun Group(title: String, content: @Composable () -> Unit) {
    Text(title, style = MaterialTheme.typography.titleMedium, color = Krono.colors.textPrimary)
    Spacer(Modifier.height(10.dp))
    KronoCard(Modifier.fillMaxWidth(), contentPadding = PaddingValues(18.dp)) { content() }
    Spacer(Modifier.height(28.dp))
}

@Composable
private fun ToggleRow(title: String, subtitle: String, checked: Boolean, onCheckedChange: (Boolean) -> Unit) {
    val c = Krono.colors
    Row(verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.titleSmall, color = c.textPrimary)
            Text(subtitle, style = MaterialTheme.typography.bodySmall, color = c.textSecondary)
        }
        Spacer(Modifier.width(12.dp))
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedTrackColor = c.mint,
                checkedThumbColor = c.ink,
                checkedBorderColor = c.lineStrong,
                uncheckedTrackColor = c.surfaceSunken,
                uncheckedBorderColor = c.lineStrong,
                uncheckedThumbColor = c.lineStrong
            )
        )
    }
}

@Composable
private fun StatusRow(title: String, ok: Boolean, okText: String, badText: String, onFix: () -> Unit) {
    val c = Krono.colors
    Row(
        Modifier.fillMaxWidth().pressable(enabled = !ok, pressedScale = 0.99f, onClick = onFix),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(title, style = MaterialTheme.typography.titleSmall, color = c.textPrimary, modifier = Modifier.weight(1f))
        if (ok) {
            Tag(okText, tone = TagTone.Success)
        } else {
            Tag(badText, tone = TagTone.Warning)
            Spacer(Modifier.width(8.dp))
            Text("Fix", style = MaterialTheme.typography.labelLarge, color = c.accentInk)
        }
    }
}

@Composable
private fun LinkRow(title: String, onClick: () -> Unit) {
    val c = Krono.colors
    Row(Modifier.fillMaxWidth().pressable(pressedScale = 0.99f, onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
        Text(title, style = MaterialTheme.typography.titleSmall, color = c.textPrimary, modifier = Modifier.weight(1f))
        Icon(Icons.AutoMirrored.Rounded.OpenInNew, contentDescription = null, tint = c.textTertiary, modifier = Modifier.size(16.dp))
    }
}

private fun notificationsAllowed(context: Context): Boolean {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
        ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) return false
    return androidx.core.app.NotificationManagerCompat.from(context).areNotificationsEnabled()
}

private fun exactAlarmsAllowed(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
        (context.getSystemService(Context.ALARM_SERVICE) as AlarmManager).canScheduleExactAlarms()

private fun openAppNotificationSettings(context: Context) {
    runCatching {
        context.startActivity(
            Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS)
                .putExtra(Settings.EXTRA_APP_PACKAGE, context.packageName)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }
}

private fun openExactAlarmSettings(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return
    runCatching {
        context.startActivity(
            Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:${context.packageName}"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }
}
