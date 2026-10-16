package com.meet11.krono.di

import android.content.Context
import androidx.room.Room
import com.meet11.krono.data.local.KronoDatabase
import com.meet11.krono.data.local.dao.ContestDao
import com.meet11.krono.data.local.dao.ProfileDao
import com.meet11.krono.data.local.dao.RivalDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): KronoDatabase {
        return Room.databaseBuilder(
            context,
            KronoDatabase::class.java,
            KronoDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }

    @Provides
    fun provideProfileDao(database: KronoDatabase): ProfileDao = database.profileDao()

    @Provides
    fun provideRivalDao(database: KronoDatabase): RivalDao = database.rivalDao()

    @Provides
    fun provideContestDao(database: KronoDatabase): ContestDao = database.contestDao()
}
