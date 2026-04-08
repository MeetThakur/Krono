# Krono

A sleek, modern mobile app for competitive programmers — track contests, sync profiles, and monitor your rating across **Codeforces**, **LeetCode**, **AtCoder**, and **CodeChef**.

Built with **React Native (Expo)** and **Material Design 3**.

---

## Screenshots

<p align="center">
  <img src="assets/images/dashboard.jpg" width="200" alt="Dashboard" />
  <img src="assets/images/schedule.jpg" width="200" alt="Contest Schedule" />
  <img src="assets/images/profile1.jpg" width="200" alt="Profile Overview" />
  <img src="assets/images/profile2.jpg" width="200" alt="Contest History" />
</p>

---

## Features

- **Multi-Platform Contests** — Live, upcoming, and past contests from Codeforces, LeetCode, AtCoder, and CodeChef in one view.
- **Profile Sync** — Connect your handles to see live ratings, global ranks, and solved problem counts.
- **Total Stats** — View your combined stats across all platforms: total problems solved, total submissions, and total contests participated.
- **Rating Graphs** — Interactive rating history charts for every platform powered by native APIs.
- **Contest History** — Browse your recent contest results with rank and rating change.
- **Smart Reminders** — Get notified before contests start.
- **Accent Colors** — Choose from 6 curated accent colors (Monochrome, Blue, Emerald, Violet, Rose, Amber) to personalize the app.
- **Dark & Light Mode** — Beautiful UI with Material You theming.

---

## Tech Stack

| Layer      | Technology                                                  |
| ---------- | ----------------------------------------------------------- |
| Framework  | React Native + Expo SDK 52                                  |
| UI         | React Native Paper (Material Design 3)                      |
| State      | Zustand                                                     |
| Navigation | Expo Router                                                 |
| APIs       | Codeforces API, LeetCode GraphQL, AtCoder JSON, CodeChef Scraper |
| Storage    | SQLite + AsyncStorage                                       |

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm or yarn
- Android Emulator / iOS Simulator / Expo Go on a physical device

### Setup

```bash
# Clone
git clone https://github.com/MeetThakur/Krono.git
cd Krono

# Install dependencies
npm install

# Configure environment variables (optional — only needed for upcoming contests)
cp .env.example .env
# Edit .env and add your Clist.by API key

# Start development server
npm start
```

Press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

### Local APK Build (arm64-v8a)

Requires **Android Studio** to be installed.

```powershell
# Generate native Android project
npx expo prebuild --platform android

# Build release APK for arm64-v8a
cd android
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path
.\gradlew.bat assembleRelease "-PreactNativeArchitectures=arm64-v8a" "-Dorg.gradle.java.home=C:\Program Files\Android\Android Studio\jbr"
```

Output APK: `android/app/build/outputs/apk/release/app-release.apk`

### Environment Variables

| Variable                     | Description                               |
| ---------------------------- | ----------------------------------------- |
| `EXPO_PUBLIC_CLIST_API_KEY`  | Your [Clist.by](https://clist.by) API key *(optional)* |
| `EXPO_PUBLIC_CLIST_USERNAME` | Your Clist.by username *(optional)*       |

> **Note:** Clist.by is only required for the upcoming contests feed. Profile stats (ratings, contest history, and charts) are fetched natively from each platform's official API.

Get your API key at [clist.by/api/v4/doc](https://clist.by/api/v4/doc/).

---

## Configuration

Customize via the in-app **Settings** screen:

- Toggle Dark / Light mode
- Pick your accent color theme
- Enable background sync
- Manage notification timing
- Add / remove connected platform profiles

---

## Changelog

### v1.2.0 — April 2026

#### ✨ New Features
- **Total Stats Panel** — Dashboard now shows a combined "Total Stats" panel aggregating solved problems, total submissions, and total contests participated across all connected platforms.
- **Accent Color Themes** — Added 6 curated color accents (Monochrome, Blue, Emerald, Violet, Rose, Amber) selectable from the Settings screen. Your choice is persisted across app restarts.

#### ⚡ API & Performance Improvements
- **Codeforces** — Contest history and rating charts now use the official Codeforces `user.rating` API directly, eliminating the Clist.by dependency for profile data.
- **AtCoder** — Contest history and rating charts now use AtCoder's official `/history/json` endpoint directly.
- **CodeChef** — Rating history is now scraped natively from the CodeChef profile page (`all_rating` JSON array), removing the last Clist.by dependency for profile stats.
- **Auto-refresh on launch** — Profiles are automatically synced when the app opens so stats are always up to date.

#### 🐛 Bug Fixes
- Fixed **Total Contests showing 0** — Added `totalContests` column to the SQLite schema with auto-migration for existing users.
- Fixed **AtCoder contest history not loading** — Now fetched directly from the official API.
- Fixed `401 Unauthorized` warnings from Clist.by appearing in logs for Codeforces and CodeChef profile data.

---

### v1.1.0 — March 2026

- Initial release with Codeforces, LeetCode, AtCoder, and CodeChef profile sync.
- Contest schedule with live, upcoming, and past contest listing.
- Rating history charts.
- Push notification reminders for upcoming contests.
- Dark / Light mode toggle.

---

Made with ❤️ by Meet
