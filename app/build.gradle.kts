import java.security.KeyStore
import java.security.MessageDigest
import java.util.Properties

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

val storeProperties = Properties().apply {
    rootProject.file(".signing/store-signing.properties").takeIf { it.isFile }
        ?.inputStream()?.use { load(it) }
}
val storeKeystore = System.getenv("KRONO_STORE_KEYSTORE_PATH")?.let(::file)
    ?: rootProject.file(".signing/krono-store.jks")
val storeSigningPassword = System.getenv("KRONO_STORE_KEYSTORE_PASSWORD") ?: storeProperties.getProperty("storePassword", "")
val storeKeyAlias = System.getenv("KRONO_STORE_KEY_ALIAS") ?: storeProperties.getProperty("keyAlias", "krono-store")
val storeKeyPassword = System.getenv("KRONO_STORE_KEY_PASSWORD") ?: storeProperties.getProperty("keyPassword", "")
// F-Droid must be able to rebuild without access to the developer's private signing key.
// This opt-in affects only the separate store package; GitHub releases always require the 1.x key.
val unsignedStoreBuild = providers.gradleProperty("kronoStoreUnsigned").map { it.toBooleanStrict() }.getOrElse(false)

val validateStoreSigning = tasks.register("validateStoreSigning") {
    group = "verification"
    description = "Checks the private store signing identity before packaging."
    onlyIf { !unsignedStoreBuild }
    doLast {
        check(storeKeystore.isFile && storeSigningPassword.isNotEmpty() && storeKeyPassword.isNotEmpty()) {
            "Store signing is not configured. Run python3 scripts/prepare-store-signing.py " +
                "or configure KRONO_STORE_KEYSTORE_PATH and the store signing credentials."
        }
        val store = KeyStore.getInstance(storeKeystore, storeSigningPassword.toCharArray())
        val certificate = checkNotNull(store.getCertificate(storeKeyAlias)) { "Store signing certificate is missing." }
        val actual = MessageDigest.getInstance("SHA-256").digest(certificate.encoded)
            .joinToString("") { "%02x".format(it.toInt() and 0xff) }
        val expected = rootProject.file("distribution/store-certificate.sha256").readText().trim()
        check(actual == expected && actual != publishedCertificateSha256) {
            "Store signing certificate does not match the pinned private store identity."
        }
        check(store.isKeyEntry(storeKeyAlias) && store.getKey(storeKeyAlias, storeKeyPassword.toCharArray()) != null) {
            "The store signing private key is missing or inaccessible."
        }
    }
}

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
tasks.matching { it.name == "preStoreReleaseBuild" }.configureEach {
    dependsOn(validateStoreSigning)
}

android {
    namespace = "com.meet11.krono"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.meet11.Krono"
        minSdk = 26
        targetSdk = 35
        versionCode = 202
        versionName = "2.0.2"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    signingConfigs {
        create("store") {
            storeFile = storeKeystore
            storePassword = storeSigningPassword
            keyAlias = storeKeyAlias
            keyPassword = storeKeyPassword
        }
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
        create("storeRelease") {
            initWith(getByName("release"))
            applicationIdSuffix = ".store"
            resValue("string", "app_name", "Krono Store")
            signingConfig = if (unsignedStoreBuild) null else signingConfigs.getByName("store")
            matchingFallbacks += "release"
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
    testImplementation(libs.okhttp.mockwebserver)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}
