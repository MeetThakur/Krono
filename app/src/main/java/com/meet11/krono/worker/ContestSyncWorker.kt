package com.meet11.krono.worker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.meet11.krono.domain.model.Contest
import com.meet11.krono.domain.repository.ContestRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class ContestSyncWorker @AssistedInject constructor(
    @Assisted private val context: Context,
    @Assisted workerParams: WorkerParameters,
    private val contestRepository: ContestRepository
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            contestRepository.syncContests()
            val activeReminders = contestRepository.getActiveReminders()
            scheduleAlarms(activeReminders)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    private fun scheduleAlarms(contests: List<Contest>) {
        val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
        val now = System.currentTimeMillis()

        for (contest in contests) {
            val triggerTime = contest.startTime - (contest.reminderMinutesBefore * 60 * 1000)
            if (triggerTime <= now) continue

            val intent = Intent(context, ContestAlarmReceiver::class.java).apply {
                putExtra(ContestAlarmReceiver.EXTRA_CONTEST_ID, contest.id)
                putExtra(ContestAlarmReceiver.EXTRA_CONTEST_NAME, contest.name)
                putExtra(ContestAlarmReceiver.EXTRA_PLATFORM_NAME, contest.platform.displayName)
                putExtra(ContestAlarmReceiver.EXTRA_MINUTES_BEFORE, contest.reminderMinutesBefore)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                contest.id.hashCode(),
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
                } else {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
                }
            } else {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pendingIntent)
            }
        }
    }

    companion object {
        const val WORK_NAME = "contest_sync_work"
    }
}
