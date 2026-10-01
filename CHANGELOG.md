# Changelog

All notable changes to Krono are documented in this file.

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
