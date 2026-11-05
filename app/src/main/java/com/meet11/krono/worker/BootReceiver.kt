package com.meet11.krono.worker

import android.app.AlarmManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

/** Alarms don't survive a reboot (or an exact-alarm permission change) — re-arm them via a sync. */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            AlarmManager.ACTION_SCHEDULE_EXACT_ALARM_PERMISSION_STATE_CHANGED -> {
                WorkManager.getInstance(context).enqueueUniqueWork(
                    "contest_resync_once",
                    ExistingWorkPolicy.REPLACE,
                    OneTimeWorkRequestBuilder<ContestSyncWorker>().build()
                )
            }
        }
    }
}
