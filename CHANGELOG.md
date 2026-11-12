# Changelog

All notable changes to Krono are documented in this file.

---

## [v2.0.1] - 2026-11-12

- Added a separate store edition (`com.meet11.Krono.store`) signed with a private release key. It installs as Krono Store and has separate app data.
- The original GitHub edition keeps `com.meet11.Krono` and its existing certificate, so installed versions continue to update normally.
- Added app-store descriptions, screenshots, privacy information and bundled font license notices.
- Added store builds to CI and the tagged-release workflow. Store approval and listing are handled by the respective repositories.

## [v2.0.0] - 2026-11-09

Krono 2.0 is a ground-up redesign with its own look, plus a long list of reliability fixes. Every contest on one clock, your ratings across platforms, and a head-to-head with your rivals.

### Highlights
- A new "pebble" identity in light and dark, with platform logos and a new app icon.
- One reminder per contest at the lead time you choose, armed the moment you tap the bell.
- Your streak, profiles and rivals from 1.x carry over automatically.
- A much smaller, faster release build.

### Upgrading from 1.x
- 2.0 installs **over** 1.x as an update (same package name, same signing certificate), so no uninstall is needed.
- Release builds now reject missing or mismatched signing keys instead of silently using a machine-generated debug key. Local and CI release APKs use the original v1.6.5 certificate; development builds install separately as `com.meet11.Krono.debug`.
- Your streak history, best streak and daily goal, your connected profiles (in their saved order) and your rivals are carried over automatically on first launch, then refreshed from the platforms. Only Codeforces, LeetCode, CodeChef and AtCoder accounts are kept; anything else 2.0 can't track is skipped. This runs once, so profiles you remove later don't come back.
- 1.x scheduled **two** notifications per contest (60 and 15 minutes before). 2.0 sends **one**, at the lead time you choose in Settings, and never repeats a reminder for the same contest start.

### Redesign
- New "pebble" visual identity: cream/navy canvas, chunky outlined cards with a hard shadow, butter/sky/mint/coral fills, platform logos, Fredoka and Nunito type, and a new adaptive launcher icon.
- Today screen leads with a live next-contest chronograph (counts to end-of-contest while live).
- Goal dial with per-problem segments, stats strip, compact "Coming up" rows.
- Contests grouped Live / Today / Tomorrow / This week / Later with sticky filters, live progress bars and per-card countdowns.
- Rivals head-to-head with gap-to-close and ranked standings.
- Bottom sheets replace dialogs for adding handles and setting the daily goal; snackbars replace error dialogs.
- Light theme now works everywhere (previously most screens hard-coded dark colours). The accent picker and Material You option were removed in favour of the fixed palette.
- Pull-to-refresh on Today, Contests and Rivals; screen transitions and press feedback throughout.

### Fixes
- Reminders are scheduled/cancelled immediately when toggled (previously only armed by the 6-hourly sync, and never cancelled).
- Reminder lead time setting is honoured and re-applied to existing reminders.
- Android 13+ notification permission is requested; reminder notifications use the proper monochrome icon and open the contest.
- Streak now breaks correctly after a missed day (was cached from the last solve). Added undo for logged solves.
- Codeforces "solved" counted distinct contests instead of distinct problems.
- Profile rating history chart showed fabricated points; it now uses real Codeforces / LeetCode history.
- Refreshing profiles reset their order; profile refresh never ran at all from the UI.
- LeetCode peak rating now derived from contest history instead of equalling current rating.
- Contest schedule wasn't synced from Today on first launch; finished contests were never pruned.
- "Reorder" button did nothing (removed); contest filters for platforms with no data removed.
- Startup crash risk in navigation item initialisation; theme flash on cold start (now held behind the splash).
- Launch splash no longer clips the "K" (it follows light/dark); Today no longer flashes "Connect your first profile" while saved profiles load.
- Clear messages for offline / not-found / rate-limited errors.

### Performance
- R8 minification + resource shrinking for release (APK ~20 MB debug → ~2 MB release).
- Codeforces contest list filtered to live/upcoming before writing (was upserting ~2,000 rows every sync).
- Parallel per-profile/per-rival refresh and parallel Codeforces/LeetCode requests.
- Countdowns recompose only their own text; far-off contests tick every 30 s instead of every second.
- HTTP cache, and network logging disabled in release builds.
- Removed `USE_EXACT_ALARM` (Play policy risk); exact-alarm permission state is surfaced in Settings instead.

---

## [v1.6.5] - 2026-10-02

### Streak & Daily Goals (Feature 5)
- **Unified Daily Streak Engine**: Added cross-platform activity synchronization across LeetCode calendars, Codeforces submissions, and problem solve deltas.
- **Material 3 Daily Goal Card**: Interactive overview card featuring a dynamic flame streak badge, daily target selector (1, 2, 3, or 5 problems/day), and live completion progress.
- **1-Tap Manual Logging**: Added instant problem solve logging with haptic feedback and real-time streak updating.
- **Grace Window & Best Streak Calculation**: Seamless multi-day tracking with automatic streak freeze/grace period and record-keeping for personal best streaks.
- **POTD Quick-Launch**: Direct 1-tap navigation from the streak card to the active Problem of the Day.

### Bug Fixes & Reliability
- **Rivals Persistence & ID Mismatch**: Fixed platform delimiter mismatch (`platformId:handle` vs `platformId-handle`) between SQLite repository and Zustand store, preventing deleted rivals from resurrecting on app restart.
- **Contest Reminders Preservation**: Replaced SQLite `INSERT OR REPLACE` with `ON CONFLICT(id) DO UPDATE SET` upsert query to prevent contest syncs from wiping active user reminders and alarms.
- **Notification Flooding Prevention**: Filtered reminder scheduling by `contest.reminderSet` and enforced a strict 50-notification cap to eliminate system notification starvation and respect the iOS 64-notification limit.
- **Background Worker Efficiency**: Removed redundant secondary reminder scheduler invocation in background fetch task.
- **Contest Tab Initialization**: Resolved empty contest list bug by ensuring `loadContests()` runs on initial component mount.
- **Profile Ordering Stability**: Ensured custom card arrangements persist reliably across profile additions and removals.
- **Rivals Mixed-Unit Sorting**: Fixed leaderboard sorting bug where unrated profiles (`rating: 0`) fell back to solved count without unit separation.

### Performance & Android Native Build
- **Parallel Contest Ingestion**: Converted sequential platform fetches into concurrent `Promise.allSettled` network execution, cutting contest sync latency dramatically.
- **Android Native Development Build**: Pinned OpenJDK 17 toolchain for robust NDK CMake C++ compilation across `react-native-worklets`, `react-native-reanimated` 4.5, and `react-native-screens`.
- **SDK 57 Architecture**: Standardized launch configurations for React Native New Architecture (Fabric & TurboModules).

---

## [v1.6.0] - 2026-08-23

### Contests & Calendar
- Added 1-tap "Add to Calendar" button for Google Calendar and native calendar apps.
- Enabled offline contest caching with instant local retrieval.
- Spacious platform filter chips with improved touch padding.

### UI Improvements
- Complete Material 3 Expressive UI overhaul across all tabs.
- New Bento Grid cumulative stats layout on Home screen.
- Pixel-style profile cards with vibrant platform accents.

### Rivals & Leaderboard
- New Head-to-Head Arena for side-by-side rival comparisons.
- Live rating differential badges on platform leaderboards.

### Platforms & Profiles
- Added support for GeeksforGeeks, HackerRank, and TopCoder.
- Added profile reordering modal to rearrange cards on Home screen.
- Updated rating chart and activity heatmap styling.

### Branding
- New minimal geometric Material 3 "K" app icon.
- Synced adaptive icons across all native Android mipmap resolutions.

### Bug Fixes
- Fixed duplicate Android resource files breaking release APK builds.
- Fixed TypeScript `maxRating` type error for unrated profiles.
- Fixed contest sync race conditions when toggling platform filters.

---

## [v1.5.0] - 2026-07-16

### Platform
- Upgraded to Expo SDK 57.
- Fixed `expo-notifications` crash in Expo Go (dynamic import with graceful fallback).

### UI Improvements
- Redesigned Contests page — new card layout, colored left accents, "Register" pill button, platform filter chips with icons.
- Home page upcoming section now uses solid surface cards with platform accents.
- Fixed excessive top padding on Home & Contests using `useSafeAreaInsets()`.

### Dark Mode
- Replaced pitch-black with softer neutral grey (`#121212` background, `#1E1E1E` surfaces).
- Stronger card borders for better depth and separation.

### Colors
- LeetCode card color updated to bright amber-yellow (`#FFBF00`).
- Smart contrast — light-background cards automatically switch to dark text.

### Bug Fixes
- Fixed `Pressable` and `Timeout` type errors.
- Fixed missing default export warning in `_layout.tsx`.

---

## [v1.4.0] - 2026-05-21
- Replaced app branding and logo assets.
- Improved profile detail modal with statistics and contest history.

---

## [v1.3.0] - 2026-04-18
- Initial dashboard layout with contest lists and profile components.

---

## [v1.2.0] - 2026-04-05
- Implemented dynamic theming and Material Design tokens.

---

## [v1.1.0] - 2026-03-20
- Core UI components, theming, and tab navigation for profile and contest features.
