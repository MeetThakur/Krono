package com.meet11.krono.worker

import android.Manifest
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import android.util.Log
import com.meet11.krono.BuildConfig
import com.meet11.krono.KronoApplication
import com.meet11.krono.MainActivity
import com.meet11.krono.R

class ContestAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val contestId = intent.getStringExtra(EXTRA_CONTEST_ID) ?: return
        val contestName = intent.getStringExtra(EXTRA_CONTEST_NAME) ?: "Contest"
        val platformName = intent.getStringExtra(EXTRA_PLATFORM_NAME) ?: "Krono"
        val minutesBefore = intent.getIntExtra(EXTRA_MINUTES_BEFORE, 15)
        val url = intent.getStringExtra(EXTRA_URL)
        val startTime = intent.getLongExtra(EXTRA_START_TIME, 0L)

        // At most one reminder per contest start. Krono 1.x scheduled two (60 and 15 min) on purpose,
        // and redelivered/duplicate alarms (exact + inexact, reboot re-arm) must never notify twice.
        val ledger = FiredReminderLedger.forContext(context)
        if (ledger.hasFired(contestId, startTime)) {
            if (BuildConfig.DEBUG) Log.i(TAG, "skipped duplicate reminder for $contestId")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) return

        val openIntent = if (!url.isNullOrBlank()) {
            Intent(Intent.ACTION_VIEW, Uri.parse(url))
        } else {
            Intent(context, MainActivity::class.java)
        }.apply { flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP }

        val pendingIntent = PendingIntent.getActivity(
            context,
            contestId.hashCode(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Report the real time left (the alarm may fire slightly early when exact alarms are off).
        val minutesLeft = if (startTime > 0L) {
            ((startTime - System.currentTimeMillis()) / 60_000L).toInt().coerceAtLeast(1)
        } else minutesBefore
        val lead = if (minutesLeft >= 60 && minutesLeft % 60 == 0) "${minutesLeft / 60}h" else "$minutesLeft min"
        val notification = NotificationCompat.Builder(context, KronoApplication.CHANNEL_CONTEST_REMINDERS)
            .setSmallIcon(R.drawable.ic_stat_krono)
            .setColor(0xFF0B0B0C.toInt())
            .setContentTitle(contestName)
            .setContentText("$platformName · starts in $lead")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setAutoCancel(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(pendingIntent)
            .build()

        val posted = runCatching { NotificationManagerCompat.from(context).notify(contestId.hashCode(), notification) }
        if (posted.isSuccess) {
            ledger.markFired(contestId, startTime)
            if (BuildConfig.DEBUG) Log.i(TAG, "posted reminder for $contestId")
        }
    }

    companion object {
        private const val TAG = "KronoReminder"
        const val EXTRA_CONTEST_ID = "extra_contest_id"
        const val EXTRA_CONTEST_NAME = "extra_contest_name"
        const val EXTRA_PLATFORM_NAME = "extra_platform_name"
        const val EXTRA_MINUTES_BEFORE = "extra_minutes_before"
        const val EXTRA_URL = "extra_url"
        const val EXTRA_START_TIME = "extra_start_time"
    }
}
