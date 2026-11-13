package com.meet11.krono.core.ui

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.SnackbarResult
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import com.meet11.krono.worker.reminderNotificationsAllowed
import kotlinx.coroutines.launch
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.repeatOnLifecycle
import kotlinx.coroutines.flow.Flow

val LocalSnackbarHost = staticCompositionLocalOf { SnackbarHostState() }

/** Collects one-shot messages while the screen is started and shows them as snackbars. */
@Composable
fun CollectMessages(messages: Flow<UiMessage>) {
    val host = LocalSnackbarHost.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    LaunchedEffect(messages, lifecycle) {
        lifecycle.repeatOnLifecycle(Lifecycle.State.STARTED) {
            messages.collect { msg ->
                host.currentSnackbarData?.dismiss()
                val result = host.showSnackbar(
                    message = msg.text,
                    actionLabel = msg.actionLabel,
                    withDismissAction = false,
                    duration = if (msg.actionLabel != null) SnackbarDuration.Long else SnackbarDuration.Short
                )
                if (result == SnackbarResult.ActionPerformed) msg.onAction?.invoke()
            }
        }
    }
}

/**
 * Wraps a reminder toggle so enabling a reminder first asks for POST_NOTIFICATIONS on
 * Android 13+. Without this, reminders were scheduled but never displayed.
 */
@Composable
fun rememberNotificationGate(): (enabling: Boolean, proceed: () -> Unit) -> Unit {
    val context = LocalContext.current
    val host = LocalSnackbarHost.current
    val scope = rememberCoroutineScope()
    val blocked = {
        scope.launch { host.showSnackbar("Notifications are off. Enable them in Settings before setting a reminder.") }
        Unit
    }
    // Survives recomposition between launching the dialog and receiving its result.
    val pending = remember { arrayOfNulls<() -> Unit>(1) }
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        val proceed = pending[0]
        pending[0] = null
        if (granted && reminderNotificationsAllowed(context)) proceed?.invoke()
        else blocked()
    }
    return remember(context, launcher, host, scope) {
        { enabling, proceed ->
            val needsAsk = enabling &&
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
            if (needsAsk) {
                pending[0] = proceed
                launcher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else if (enabling && !reminderNotificationsAllowed(context)) {
                blocked()
            } else {
                proceed()
            }
        }
    }
}
