package com.meet11.krono

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.meet11.krono.worker.ContestSyncWorker
import dagger.hilt.android.HiltAndroidApp
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltAndroidApp
class KronoApplication : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        schedulePeriodicContestSync()
    }

    private fun schedulePeriodicContestSync() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncWorkRequest = PeriodicWorkRequestBuilder<ContestSyncWorker>(6, TimeUnit.HOURS)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            ContestSyncWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            syncWorkRequest
        )
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val contestChannel = NotificationChannel(
                CHANNEL_CONTEST_REMINDERS,
                "Contest Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for upcoming competitive programming contests"
                enableVibration(true)
            }

            val streakChannel = NotificationChannel(
                CHANNEL_DAILY_STREAK,
                "Daily Goal & Streak",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Daily reminders to maintain your problem solving streak"
            }

            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager?.createNotificationChannels(listOf(contestChannel, streakChannel))
        }
    }

    companion object {
        const val CHANNEL_CONTEST_REMINDERS = "contest_reminders"
        const val CHANNEL_DAILY_STREAK = "daily_streak"
    }
}
