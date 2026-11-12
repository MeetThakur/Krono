<p align="center">
  <img src="assets/images/hero.png" alt="Krono — competitive programming, on the clock" width="100%" />
</p>

<p align="center">
  <a href="assets/video/krono-trailer.mp4"><img src="assets/video/krono-trailer.gif" alt="Krono trailer" width="70%" /></a><br />
  <sub>Click for the full-quality video</sub>
</p>

<h1 align="center">Krono</h1>

<p align="center">
  <strong>Competitive programming, on the clock.</strong><br />
  One countdown for every contest, your ratings across platforms, and a head-to-head with your rivals.
</p>

<p align="center">
  <a href="https://github.com/MeetThakur/Krono/releases/latest"><img src="https://img.shields.io/github/v/release/MeetThakur/Krono?style=flat-square&color=blue&label=Release" alt="Latest Release" /></a>
  <a href="https://github.com/MeetThakur/Krono/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/MeetThakur/Krono/ci.yml?branch=master&style=flat-square&label=CI" alt="CI status" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square" alt="License: GPLv3" /></a>
  <img src="https://img.shields.io/badge/Kotlin-2.1.0-7F52FF?logo=kotlin&logoColor=white&style=flat-square" alt="Kotlin" />
  <img src="https://img.shields.io/badge/Jetpack_Compose-Material_3-4285F4?logo=jetpackcompose&logoColor=white&style=flat-square" alt="Compose" />
  <img src="https://img.shields.io/badge/Architecture-MVVM-green?style=flat-square" alt="MVVM" />
  <img src="https://img.shields.io/badge/DI-Hilt-00599C?style=flat-square" alt="Hilt" />
  <img src="https://img.shields.io/badge/Database-Room-orange?logo=sqlite&logoColor=white&style=flat-square" alt="Room" />
  <img src="https://img.shields.io/badge/Min_SDK-26-brightgreen?style=flat-square" alt="Min SDK" />
  <img src="https://img.shields.io/badge/Target_SDK-35-blue?style=flat-square" alt="Target SDK" />
</p>

---

## Download

<p align="center">
  <a href="https://github.com/MeetThakur/Krono/releases/latest">
    <img src="https://img.shields.io/badge/Download-Latest%20APK-2ea44f?style=for-the-badge&logo=android&logoColor=white" alt="Download APK" />
  </a>
</p>

- **Direct APK** — grab `app-release.apk` from [GitHub Releases](https://github.com/MeetThakur/Krono/releases/latest) and install it (Android 8.0+ / API 26+).
- **Store edition** — `krono-store-vX.Y.Z.apk` is a separate package, shown as **Krono Store**, signed with its own private release key. It installs alongside the original app and has separate local data. Store listings are pending; see [distribution status](distribution/README.md).
- **Auto-updates with Obtainium**
  1. Open [Obtainium](https://github.com/ImranR98/Obtainium) on your device.
  2. Tap **Add App** and paste `https://github.com/MeetThakur/Krono`.
  3. Obtainium tracks new releases and installs them for you.
  4. For the original GitHub edition, set the APK filename filter to `^app-release\.apk$` so the separately signed store edition is not selected.

---

## Screenshots

<p align="center">
  <img src="assets/images/screenshots/home.png" width="200" alt="Today — next-contest chronograph and profiles" />
  <img src="assets/images/screenshots/home2.png" width="200" alt="Today — daily goal dial, stats and problem of the day" />
  <img src="assets/images/screenshots/contests.png" width="200" alt="Contests — grouped schedule with live countdowns" />
</p>
<p align="center">
  <img src="assets/images/screenshots/rivals.png" width="200" alt="Rivals — head-to-head and standings" />
  <img src="assets/images/screenshots/settings.png" width="200" alt="Settings — theme and reminder health" />
  <img src="assets/images/screenshots/home_light.png" width="200" alt="Today in light mode" />
  <img src="assets/images/screenshots/contests_light.png" width="200" alt="Contests in light mode" />
</p>

<sub>Screenshots use synthetic demo accounts.</sub>

---

## Features

- **Next-contest chronograph** — The Today screen counts down to the next round (or the end of a live one) to the second, with one-tap open, calendar export and reminder.
- **Unified contest schedule** — Codeforces, LeetCode, CodeChef and AtCoder in one timezone-aware list, grouped into Live / Today / Tomorrow / This week / Later, with per-platform filters and live progress bars for running contests.
- **Reliable reminders** — Alarms are armed the moment you tap the bell (and cancelled when you untap it), honour your lead time (5 min – 1 hour), survive reboots, and ask for notification permission on Android 13+. Settings shows whether notifications and exact timing are actually allowed, with a one-tap fix.
- **Profiles & real rating history** — Connect Codeforces, LeetCode and CodeChef handles to sync rating, peak, rank, solved and contest counts. Profile sheets chart your real rating history from Codeforces and LeetCode.
- **Daily practice** — A bezel-style goal dial, streaks that break correctly when you miss a day, and an undo for accidental logs.
- **Rivals** — Head-to-head comparison with gap-to-close, plus ranked standings per platform. Tap to compare, long-press or ✕ to remove.
- **Your look** — Light, dark or system theme in the pebble identity: cream and navy, chunky outlines, and butter, sky, mint and coral fills.

---

## Design

Krono 2.0 has its own "pebble" identity: a warm cream (or deep navy) canvas, chunky outlines with a hard offset shadow, uneven rounded corners, and four pastel fills (butter, sky, mint, coral). Each platform gets its own tint and logo mark.

| Token | Choice |
| :--- | :--- |
| Display, UI and numbers | Fredoka |
| Body | Nunito |
| Canvas | Cream `#FFF8E7` (light), navy `#101624` (dark) |
| Ink | `#1D2233` |
| Fills | Butter `#FFD66B`, sky `#BFE3FA`, mint `#C9F0DA`, coral `#FFB3A0` (deepened in dark) |

All colours come from `KronoColors` tokens (`core/theme/Color.kt`), so both themes stay consistent.

--- | :--- |
| Display & UI type | Space Grotesk |
| Numbers & timers | JetBrains Mono, tabular figures |
| Surfaces (dark) | Ink `#09090A` → `#131315` → `#1B1B1E`, hairlines `#222226` |
| Signal accent | Volt `#D4FF3F` (swap in Settings) |

All colours come from `KronoColors` tokens (`core/theme/Color.kt`), so both themes and every accent stay consistent.

---

## Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Language** | Kotlin 2.1.0 | 100% native modern Kotlin with Coroutines & Flow |
| **UI Framework** | Jetpack Compose + Material 3 | Declarative UI with Material 3 Expressive components |
| **Architecture** | MVVM + Clean Architecture | Unidirectional data flow with ViewModel and StateFlow |
| **Dependency Injection** | Hilt (Dagger) | Compile-time dependency injection across components |
| **Local Storage** | Room Database + DataStore | SQLite abstraction for relational data & Proto DataStore for preferences |
| **Networking** | Retrofit + OkHttp + kotlinx.serialization | Asynchronous HTTP client with JSON serialization |
| **Background Tasks** | WorkManager | Guaranteed periodic background sync for contest listings |
| **Build System** | Gradle Kotlin DSL (KTS) | Version catalogs (`libs.versions.toml`), Android Gradle Plugin 8.8.2 |

---

## Project Structure

```text
app/src/main/java/com/meet11/krono/
├── core/
│   ├── designsystem/          # Primitives (KronoCard, Tag, chips, buttons) + ContestCard, NextContestHero, GoalDial, RatingChart
│   ├── theme/                 # KronoColors tokens, Fredoka / Nunito type, pebble shapes
│   ├── ui/                    # Snackbar messages, notification-permission gate, ticker flow
│   └── util/                  # Locale-aware time formatting, countdowns, user-facing error messages
├── data/
│   ├── local/                 # Room database, entities, DAOs
│   ├── preferences/           # DataStore preferences
│   ├── remote/                # Retrofit APIs, DTOs, CodeChef parser, shared ProfileFetcher
│   └── repository/            # Repository implementations
├── di/                        # Hilt modules
├── domain/                    # Models and repository interfaces
├── presentation/
│   ├── home/                  # Today: chronograph, profiles, daily goal, POTD, coming up
│   ├── contests/              # Grouped schedule with filters
│   ├── rivals/                # Head-to-head and standings
│   ├── settings/              # Appearance, reminders, permission health
│   ├── common/                # Shared bottom sheets (add handle, daily goal)
│   └── navigation/            # NavHost with transitions, bottom bar
├── worker/                    # Sync worker, ReminderScheduler, alarm + boot receivers
├── KronoApplication.kt
└── MainActivity.kt
```

---

## Getting Started

### Prerequisites

- **Android Studio** Ladybug (2024.2+) or newer
- **JDK 17** (bundled with Android Studio)
- **Android SDK** with `compileSdk 35` and `minSdk 26`
- Android device or emulator running Android 8.0+ (API 26+)

### Setup & Run

```bash
# 1. Clone the repository
git clone https://github.com/MeetThakur/Krono.git
cd Krono

# 2. Build debug APK
./gradlew assembleDebug

# 3. Install on connected device / emulator
./gradlew installDebug
```

You can also simply open the project in **Android Studio** and click **Run** (`Ctrl+R` / `Shift+F10`).

---

## Building APKs

Build directly from the command line using the Gradle wrapper:

```bash
# Debug APK (signed with debug keystore)
./gradlew assembleDebug

# Release APK (R8-minified and resource-shrunk, ~2 MB)
python3 scripts/prepare-release-signing.py
./gradlew assembleRelease
```

Release builds must use the **same certificate as the GitHub v1.6.5 APK**, so Android can install them as an update while preserving data. Run `python3 scripts/prepare-release-signing.py` once to recover the original key from pinned v1.6.5 Git history into the ignored `.signing/` directory. This recovers the existing key; it does not generate a new one. Shallow checkouts must first fetch the commit printed by the script.

Alternatively, configure `KRONO_KEYSTORE_PATH`, `KRONO_KEYSTORE_PASSWORD`, `KRONO_KEY_ALIAS` and `KRONO_KEY_PASSWORD`. Gradle checks the certificate and private key before building a release and **fails if the key is missing or differs from v1.6.5**. There is no fallback to a machine-generated debug key. CI release artifacts use the original key too.

Debug builds use the separate application ID `com.meet11.Krono.debug` and install alongside the published app. To update an existing GitHub installation, use `app-release.apk`.

The store edition uses `com.meet11.Krono.store`. Its private key is generated once with `python3 scripts/prepare-store-signing.py`, kept in the ignored `.signing/` directory, and supplied to tagged-release builds through dedicated GitHub Actions secrets. Build it with `./gradlew assembleStoreRelease`. See [store build and submission instructions](distribution/README.md) for the unsigned source-build option used by packagers.

### Publishing a release

1. Bump `versionCode` / `versionName` in `app/build.gradle.kts` and add a `## [vX.Y.Z]` section to `CHANGELOG.md`.
2. Push a matching tag: `git tag v2.0.0 && git push origin v2.0.0`.
3. The **Release** workflow checks the tag matches `versionName`, builds a signed APK, verifies its certificate fingerprint matches Krono 1.x, and publishes it with that CHANGELOG section as notes.

Repository secrets used by the workflow: `KRONO_KEYSTORE_BASE64`, `KRONO_KEYSTORE_PASSWORD` (`android`), `KRONO_KEY_ALIAS` (`androiddebugkey`), `KRONO_KEY_PASSWORD` (`android`).

Generated outputs:
- **Debug:** `app/build/outputs/apk/debug/app-debug.apk`
- **Release:** `app/build/outputs/apk/release/app-release.apk`

---

## Settings

- **Theme** — System, Light or Dark.
- **Reminder lead time** — 5, 15, 30 or 60 minutes before start. Changing it re-arms existing reminders.
- **Reminder health** — Shows whether notifications and exact alarms are allowed, with a shortcut to fix each.
- **Daily goal** — Set from the Today screen (1–99 problems per day).

Contest schedules sync in the background every 6 hours and on pull-to-refresh.

---

## License

This project is licensed under the **GNU General Public License v3.0** (GPLv3) — see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Meet
