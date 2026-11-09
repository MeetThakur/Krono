package com.meet11.krono.worker

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import com.meet11.krono.domain.model.Contest
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Owns the AlarmManager side of contest reminders. Previously alarms were only set by the
 * 6-hourly sync worker, so toggling a reminder for a contest starting soon never fired, and
 * turning one off never cancelled it.
 */
@Singleton
class ReminderScheduler @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val alarmManager: AlarmManager?
        get() = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    fun canScheduleExact(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarmManager?.canScheduleExactAlarms() == true

    /** Returns false when the trigger time has already passed. */
    fun schedule(contest: Contest, minutesBefore: Int): Boolean {
        val am = alarmManager ?: return false
        val triggerAt = contest.startTime - minutesBefore * 60_000L
        if (triggerAt <= System.currentTimeMillis()) return false

        val pending = pendingIntent(contest.id, buildIntent(contest, minutesBefore))
        val exact = canScheduleExact() && runCatching {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pending)
        }.isSuccess
        if (!exact) {
            // Without exact-alarm access the OS is free to defer, by up to an hour for a plain inexact
            // alarm. A window that ends at the reminder time keeps it close to on time when set well in
            // advance. Android enforces a 10-minute minimum window, so a reminder set less than 10
            // minutes before its trigger can arrive up to ~10 minutes late (verified on Android 16).
            // Exact alarms (Settings > Reminders > Exact timing) remove this uncertainty.
            val windowStart = (triggerAt - INEXACT_WINDOW_MS).coerceAtLeast(System.currentTimeMillis())
            am.setWindow(AlarmManager.RTC_WAKEUP, windowStart, triggerAt - windowStart, pending)
        }
        return true
    }

    fun cancel(contestId: String) {
        val am = alarmManager ?: return
        val intent = Intent(context, ContestAlarmReceiver::class.java)
        val pending = PendingIntent.getBroadcast(
            context,
            contestId.hashCode(),
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        ) ?: return
        am.cancel(pending)
        pending.cancel()
    }

    fun scheduleAll(contests: List<Contest>) {
        contests.forEach { schedule(it, it.reminderMinutesBefore) }
    }

    private fun buildIntent(contest: Contest, minutesBefore: Int) =
        Intent(context, ContestAlarmReceiver::class.java).apply {
            putExtra(ContestAlarmReceiver.EXTRA_CONTEST_ID, contest.id)
            putExtra(ContestAlarmReceiver.EXTRA_CONTEST_NAME, contest.name)
            putExtra(ContestAlarmReceiver.EXTRA_PLATFORM_NAME, contest.platform.displayName)
            putExtra(ContestAlarmReceiver.EXTRA_MINUTES_BEFORE, minutesBefore)
            putExtra(ContestAlarmReceiver.EXTRA_URL, contest.url)
            putExtra(ContestAlarmReceiver.EXTRA_START_TIME, contest.startTime)
        }

    private companion object {
        const val INEXACT_WINDOW_MS = 10 * 60_000L
    }

    private fun pendingIntent(contestId: String, intent: Intent) = PendingIntent.getBroadcast(
        context,
        contestId.hashCode(),
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}
