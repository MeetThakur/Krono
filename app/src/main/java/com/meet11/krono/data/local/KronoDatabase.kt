package com.meet11.krono.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.meet11.krono.data.local.dao.ContestDao
import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.dao.RivalDao
import com.meet11.krono.data.local.entity.ContestEntity
import com.meet11.krono.data.local.entity.ProfileEntity
import com.meet11.krono.data.local.entity.RivalEntity

@Database(
    entities = [
        ProfileEntity::class,
        RivalEntity::class,
        ContestEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class KronoDatabase : RoomDatabase() {
    abstract fun profileDao(): ProfileDao
    abstract fun rivalDao(): RivalDao
    abstract fun contestDao(): ContestDao

    companion object {
        const val DATABASE_NAME = "krono.db"
    }
}
