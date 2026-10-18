package com.meet11.krono.worker

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val syncRequest = OneTimeWorkRequestBuilder<ContestSyncWorker>().build()
            WorkManager.getInstance(context).enqueue(syncRequest)
        }
    }
}
