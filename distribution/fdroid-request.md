# Krono Store — competitive programming companion

I maintain Krono and would like to request inclusion of its separately signed store edition in F-Droid.

- Source: https://github.com/MeetThakur/Krono
- License: GPL-3.0
- Store application ID: `com.meet11.Krono.store`
- Original GitHub application ID: `com.meet11.Krono`
- Release: https://github.com/MeetThakur/Krono/releases/tag/v2.0.1
- Store APK: https://github.com/MeetThakur/Krono/releases/download/v2.0.1/krono-store-v2.0.1.apk
- Fastlane metadata: https://github.com/MeetThakur/Krono/tree/master/fastlane/metadata/android/en-US
- Privacy: https://github.com/MeetThakur/Krono/blob/master/PRIVACY.md

Krono combines Codeforces, LeetCode, CodeChef and AtCoder contest schedules, reminders, public profile statistics, rating history where supported, rivals and manually logged daily practice goals. It requires Android 8.0 or later. It is a native Kotlin/Jetpack Compose app and has no advertising or analytics SDK.

## Build information

The active app is the root Gradle project's `app` module. `legacy-rn/` is an archived predecessor and is not included by `settings.gradle.kts`.

The store variant is an Android build type named `storeRelease`. Build it from the repository root with:

```sh
gradle assembleStoreRelease -PkronoStoreUnsigned=true
```

This produces `app/build/outputs/apk/storeRelease/app-storeRelease-unsigned.apk` without requiring the private signing key. The property does not affect the original GitHub release signing guard. Gradle wrapper configuration, version catalog and build instructions are in the public source repository. JDK 17 and Android SDK 35 are used.

A local signed-versus-unsigned comparison passed with `apksigcopier compare --unsigned`. This was not an independent F-Droid build and is not being presented as one.

## Signing and services

The store APK has a private release key whose public SHA-256 fingerprint is in `distribution/store-certificate.sha256`. It intentionally uses a different package from the older GitHub APK, which retained a legacy certificate for existing users' updates. We would like to establish developer-signature reproducible builds if possible; this has not yet been verified by F-Droid.

The app depends on public services operated by Codeforces, LeetCode, CodeChef, AtCoder and the AtCoder Problems community API at kenkoooo.com. Please assess any appropriate non-free-network-service anti-feature during review. No platform passwords or API keys are required.

The repository includes AI-assisted/assistant-authored code. We are disclosing this rather than asserting otherwise.
