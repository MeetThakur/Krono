package com.meet11.krono.di

import com.meet11.krono.data.remote.api.CodeChefApi
import com.meet11.krono.data.remote.api.CodeforcesApi
import com.meet11.krono.data.remote.api.KenkooooAtCoderApi
import com.meet11.krono.data.remote.api.LeetCodeApi
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Cache
import java.io.File
import android.content.Context
import com.meet11.krono.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(@ApplicationContext context: Context): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .cache(Cache(File(context.cacheDir, "http"), 10L * 1024 * 1024))
            .apply {
                // Never log network traffic in release builds.
                if (BuildConfig.DEBUG) {
                    addInterceptor(HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BASIC })
                }
            }
            .build()
    }

    @Provides
    @Singleton
    fun provideCodeforcesApi(okHttpClient: OkHttpClient, json: Json): CodeforcesApi {
        return Retrofit.Builder()
            .baseUrl("https://codeforces.com/api/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(CodeforcesApi::class.java)
    }

    @Provides
    @Singleton
    fun provideLeetCodeApi(okHttpClient: OkHttpClient, json: Json): LeetCodeApi {
        return Retrofit.Builder()
            .baseUrl("https://leetcode.com/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(LeetCodeApi::class.java)
    }

    @Provides
    @Singleton
    fun provideCodeChefApi(okHttpClient: OkHttpClient, json: Json): CodeChefApi {
        return Retrofit.Builder()
            .baseUrl("https://www.codechef.com/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(CodeChefApi::class.java)
    }

    @Provides
    @Singleton
    fun provideKenkooooAtCoderApi(okHttpClient: OkHttpClient, json: Json): KenkooooAtCoderApi {
        return Retrofit.Builder()
            .baseUrl("https://kenkoooo.com/atcoder/atcoder-api/")
            .client(okHttpClient)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(KenkooooAtCoderApi::class.java)
    }
}
