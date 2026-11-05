package com.meet11.krono.core.util

import com.meet11.krono.data.remote.UserNotFoundException
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException

/** Turns low-level exceptions into copy a user can act on. */
fun Throwable.toUserMessage(fallback: String = "Something went wrong. Please try again."): String = when (this) {
    is UserNotFoundException -> message ?: fallback
    is UnknownHostException -> "You're offline. Check your connection and try again."
    is SocketTimeoutException -> "The server took too long to respond. Try again in a moment."
    is IOException -> "Network error. Check your connection and try again."
    is retrofit2.HttpException -> if (code() == 429) "Rate limited by the platform — try again in a minute." else "The platform returned an error (${code()})."
    is UnsupportedOperationException -> message ?: fallback
    else -> fallback
}
