package com.meet11.krono.worker

import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationManagerCompat
import com.meet11.krono.KronoApplication

/** Both app permission and the individual channel can block reminder delivery. */
fun reminderNotificationsAllowed(context: Context): Boolean {
    if (!NotificationManagerCompat.from(context).areNotificationsEnabled()) return false
    val manager = context.getSystemService(NotificationManager::class.java) ?: return false
    val channel = manager.getNotificationChannel(KronoApplication.CHANNEL_CONTEST_REMINDERS)
    return channel == null || channel.importance != NotificationManager.IMPORTANCE_NONE
}
