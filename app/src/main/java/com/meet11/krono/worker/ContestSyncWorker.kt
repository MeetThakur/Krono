package com.meet11.krono.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.meet11.krono.domain.repository.ContestRepository
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class ContestSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted workerParams: WorkerParameters,
    private val contestRepository: ContestRepository,
    private val reminderScheduler: ReminderScheduler
) : CoroutineWorker(context, workerParams) {

    override suspend fun doWork(): Result {
        val synced = contestRepository.syncContests()
        // Always (re)arm alarms — they're wiped on reboot and contest times can shift.
        runCatching { reminderScheduler.scheduleAll(contestRepository.getActiveReminders()) }
        return if (synced.isSuccess || runAttemptCount >= 3) Result.success() else Result.retry()
    }

    companion object {
        const val WORK_NAME = "contest_sync_work"
    }
}
