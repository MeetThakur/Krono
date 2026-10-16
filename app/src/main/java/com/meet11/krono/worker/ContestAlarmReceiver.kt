package com.meet11.krono.worker

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.meet11.krono.KronoApplication
import com.meet11.krono.MainActivity
import com.meet11.krono.R

class ContestAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val contestId = intent.getStringExtra(EXTRA_CONTEST_ID) ?: return
        val contestName = intent.getStringExtra(EXTRA_CONTEST_NAME) ?: "Contest"
        val platformName = intent.getStringExtra(EXTRA_PLATFORM_NAME) ?: "Krono"
        val minutesBefore = intent.getIntExtra(EXTRA_MINUTES_BEFORE, 15)

        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            contestId.hashCode(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, KronoApplication.CHANNEL_CONTEST_REMINDERS)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Contest Starting Soon!")
            .setContentText("$contestName on $platformName starts in $minutesBefore minutes.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(contestId.hashCode(), notification)
    }

    companion object {
        const val EXTRA_CONTEST_ID = "extra_contest_id"
        const val EXTRA_CONTEST_NAME = "extra_contest_name"
        const val EXTRA_PLATFORM_NAME = "extra_platform_name"
        const val EXTRA_MINUTES_BEFORE = "extra_minutes_before"
    }
}
