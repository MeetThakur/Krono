package com.meet11.krono.core.ui

import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

/** One-shot message rendered as a snackbar. */
data class UiMessage(
    val text: String,
    val actionLabel: String? = null,
    val onAction: (() -> Unit)? = null,
    val id: Long = System.nanoTime()
)

/** Emits the current time every [periodMs]; used so time-bucketed lists re-sort as contests start/end. */
fun tickerFlow(periodMs: Long = 60_000L): Flow<Long> = flow {
    while (true) {
        val now = System.currentTimeMillis()
        emit(now)
        delay(periodMs - now % periodMs)
    }
}
