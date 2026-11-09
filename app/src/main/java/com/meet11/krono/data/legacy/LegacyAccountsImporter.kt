package com.meet11.krono.data.legacy

import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteException
import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.dao.RivalDao
import com.meet11.krono.data.local.entity.ProfileEntity
import com.meet11.krono.data.local.entity.RivalEntity
import com.meet11.krono.data.preferences.PreferencesManager
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.RivalRepository
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Brings the connected profiles and rivals of Krono 1.x into 2.0 when it's installed as an update.
 *
 * 1.x kept them in an expo-sqlite database, which lives in `files/SQLite/krono.db`. That is a different
 * place from 2.0's Room database (`databases/krono.db`), so the two never collide. The 1.x display
 * order was kept separately in AsyncStorage (`krono_profile_order`).
 *
 * Cached ratings are copied so the UI is populated immediately (and offline), then refreshed from the
 * platforms. Existing 2.0 rows are never overwritten.
 */
@Singleton
class LegacyAccountsImporter @Inject constructor(
    @ApplicationContext private val context: Context,
    private val preferencesManager: PreferencesManager,
    private val profileDao: ProfileDao,
    private val rivalDao: RivalDao,
    private val profileRepository: ProfileRepository,
    private val rivalRepository: RivalRepository
) {
    private class Legacy(val profiles: List<LegacyAccount>, val rivals: List<LegacyAccount>, val order: List<String>)

    /** Runs once. A read error leaves it unmarked so the next launch retries. */
    suspend fun importIfNeeded() = withContext(Dispatchers.IO) {
        if (preferencesManager.isLegacyAccountsImportDone()) return@withContext
        val legacy = runCatching { read() }.getOrElse { return@withContext }

        var imported = false
        if (legacy != null) {
            val orderById = LegacyAccounts.displayOrder(legacy.order, legacy.profiles)
            val profiles = legacy.profiles.map { a ->
                ProfileEntity(
                    id = a.id, platformId = a.platform.id, username = a.username, displayName = a.displayName,
                    avatar = a.avatar, rating = a.rating, maxRating = a.maxRating, rank = a.rank,
                    problemsSolved = a.problemsSolved, totalSubmissions = a.totalSubmissions,
                    totalContests = a.totalContests, badges = a.badges,
                    displayOrder = orderById[a.id] ?: 0, lastUpdated = a.lastUpdated
                )
            }
            val rivals = legacy.rivals.map { a ->
                RivalEntity(
                    id = a.id, platformId = a.platform.id, username = a.username, displayName = a.displayName,
                    avatar = a.avatar, rating = a.rating, maxRating = a.maxRating, rank = a.rank,
                    problemsSolved = a.problemsSolved, totalSubmissions = a.totalSubmissions,
                    totalContests = a.totalContests, badges = a.badges, lastUpdated = a.lastUpdated
                )
            }
            if (profiles.isNotEmpty()) profileDao.insertIfAbsent(profiles)
            if (rivals.isNotEmpty()) rivalDao.insertIfAbsent(rivals)
            imported = profiles.isNotEmpty() || rivals.isNotEmpty()
        }

        preferencesManager.markLegacyAccountsImported()
        // Bring the cached numbers up to date; offline or rate-limited is fine, the cache stays.
        if (imported) {
            runCatching { profileRepository.refreshProfiles() }
            runCatching { rivalRepository.refreshRivals() }
        }
    }

    private fun read(): Legacy? {
        val file = File(context.filesDir, "SQLite/krono.db")
        if (!file.exists()) return null
        val (profiles, rivals) = SQLiteDatabase.openDatabase(file.path, null, SQLiteDatabase.OPEN_READONLY).use { db ->
            readTable(db, "profiles") to readTable(db, "rivals")
        }
        val order = LegacyAccounts.parseOrder(LegacyAsyncStorage.get(context, ORDER_KEY))
        return Legacy(LegacyAccounts.dedupe(profiles), LegacyAccounts.dedupe(rivals), order)
    }

    /** A missing table just means "none"; any other SQLite failure propagates so we retry later. */
    private fun readTable(db: SQLiteDatabase, table: String): List<LegacyAccount> {
        val cursor = try {
            db.rawQuery("SELECT * FROM $table", null)
        } catch (e: SQLiteException) {
            if (e.message?.contains("no such table", ignoreCase = true) == true) return emptyList()
            throw e
        }
        cursor.use { c ->
            val out = ArrayList<LegacyAccount>()
            while (c.moveToNext()) {
                val row = LegacyRow(
                    id = c.str("id").orEmpty(),
                    platformId = c.str("platformId"),
                    username = c.str("username"),
                    displayName = c.str("displayName"),
                    avatar = c.str("avatar"),
                    rating = c.int("rating"),
                    maxRating = c.int("maxRating"),
                    rank = c.str("rank"),
                    problemsSolved = c.int("problemsSolved"),
                    totalSubmissions = c.int("totalSubmissions"),
                    totalContests = c.int("totalContests"),
                    badges = c.str("badges"),
                    lastUpdated = c.long("lastUpdated")
                )
                LegacyAccounts.fromRow(row)?.let(out::add)
            }
            return out
        }
    }

    // Column lookups tolerate columns that older 1.x databases didn't have yet.
    private fun Cursor.str(col: String): String? =
        getColumnIndex(col).takeIf { it >= 0 && !isNull(it) }?.let(::getString)

    private fun Cursor.int(col: String): Int? =
        getColumnIndex(col).takeIf { it >= 0 && !isNull(it) }?.let(::getInt)

    private fun Cursor.long(col: String): Long? =
        getColumnIndex(col).takeIf { it >= 0 && !isNull(it) }?.let(::getLong)

    private companion object {
        const val ORDER_KEY = "krono_profile_order"
    }
}
