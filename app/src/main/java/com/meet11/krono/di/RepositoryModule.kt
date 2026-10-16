package com.meet11.krono.di

import com.meet11.krono.data.repository.ContestRepositoryImpl
import com.meet11.krono.data.repository.ProfileRepositoryImpl
import com.meet11.krono.data.repository.RivalRepositoryImpl
import com.meet11.krono.data.repository.StreakRepositoryImpl
import com.meet11.krono.domain.repository.ContestRepository
import com.meet11.krono.domain.repository.ProfileRepository
import com.meet11.krono.domain.repository.RivalRepository
import com.meet11.krono.domain.repository.StreakRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {

    @Binds
    @Singleton
    abstract fun bindContestRepository(impl: ContestRepositoryImpl): ContestRepository

    @Binds
    @Singleton
    abstract fun bindProfileRepository(impl: ProfileRepositoryImpl): ProfileRepository

    @Binds
    @Singleton
    abstract fun bindRivalRepository(impl: RivalRepositoryImpl): RivalRepository

    @Binds
    @Singleton
    abstract fun bindStreakRepository(impl: StreakRepositoryImpl): StreakRepository
}
