import java.security.KeyStore
import java.security.MessageDigest

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.hilt)
}

// Keep the identity used by GitHub v1.6.5. Never substitute a machine-generated debug key.
val releaseKeystore = System.getenv("KRONO_KEYSTORE_PATH")?.let(::file)
    ?: rootProject.file(".signing/krono-legacy.keystore")
val releaseStorePassword = System.getenv("KRONO_KEYSTORE_PASSWORD") ?: "android"
val releaseKeyAlias = System.getenv("KRONO_KEY_ALIAS") ?: "androiddebugkey"
val releaseKeyPassword = System.getenv("KRONO_KEY_PASSWORD") ?: "android"
val publishedCertificateSha256 = "fac61745dc0903786fb9ede62a962b399f7348f0bb6f899b8332667591033b9c"

val validateReleaseSigning = tasks.register("validateReleaseSigning") {
    group = "verification"
    description = "Rejects release keys that cannot update the published Krono app."
    doLast {
        check(releaseKeystore.isFile) {
            "Release keystore is missing. Run python3 scripts/prepare-release-signing.py " +
                "or set KRONO_KEYSTORE_PATH to the original Krono keystore."
        }
        val store = KeyStore.getInstance(releaseKeystore, releaseStorePassword.toCharArray())
        val certificate = checkNotNull(store.getCertificate(releaseKeyAlias)) {
            "Release keystore has no certificate for alias $releaseKeyAlias."
        }
        val actual = MessageDigest.getInstance("SHA-256").digest(certificate.encoded)
            .joinToString("") { "%02x".format(it.toInt() and 0xff) }
        check(actual == publishedCertificateSha256) {
            "Release signing certificate $actual does not match GitHub v1.6.5 " +
                "($publishedCertificateSha256). Refusing to build an incompatible update."
        }
        check(store.isKeyEntry(releaseKeyAlias) && store.getKey(releaseKeyAlias, releaseKeyPassword.toCharArray()) != null) {
            "The original signing private key is missing or inaccessible."
        }
    }
}

tasks.matching { it.name == "preReleaseBuild" }.configureEach {
    dependsOn(validateReleaseSigning)
}

android {
    namespace = "com.meet11.krono"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.meet11.Krono"
        minSdk = 26
        targetSdk = 35
        versionCode = 200
        versionName = "2.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("release") {
            storeFile = releaseKeystore
            storePassword = releaseStorePassword
            keyAlias = releaseKeyAlias
            keyPassword = releaseKeyPassword
        }
    }

    buildTypes {
        debug {
            // Development APKs install separately and cannot replace the published app.
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            signingConfig = signingConfigs.getByName("release")
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile>().configureEach {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    // AndroidX & Lifecycle
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.core.splashscreen)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.activity.compose)

    // Compose BOM & UI
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material3.window.size)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.androidx.navigation.compose)

    // Hilt DI
    implementation(libs.hilt.android)
    ksp(libs.hilt.compiler)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)

    // Room Database
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // DataStore Preferences
    implementation(libs.androidx.datastore.preferences)

    // WorkManager
    implementation(libs.androidx.work.runtime.ktx)

    // Networking
    implementation(libs.retrofit)
    implementation(libs.retrofit.converter.kotlinx.serialization)
    implementation(libs.okhttp)
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.kotlinx.coroutines.android)


    // Debugging / Tooling
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // Testing
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}
