# Krono launch copy

The Krono 2.0 launch announcement was published on Reddit on 13 November 2026: https://www.reddit.com/r/droidappshowcase/comments/1xv45yf/krono_20_contests_profiles_and_reminders/

The other posts below remain drafts. The announcement links to v2.0.2, which includes the latest fixes.

## Developer-community post

**Krono: an open-source Android app for competitive programming**

I built Krono to keep coding contests and practice in one place.

It tracks Codeforces, LeetCode, CodeChef and AtCoder contests, with local-time schedules and reminders. You can connect public profiles, check rating history, compare rivals and log progress toward a daily practice goal.

The app is native Kotlin and Jetpack Compose, free under GPLv3, and doesn't need a Krono account. There are no ads or analytics SDKs.

Source and screenshots: https://github.com/MeetThakur/Krono

Download: https://github.com/MeetThakur/Krono/releases/latest

If you try it, I'd like feedback on contest reminders and platform syncing. Bugs and contributions are welcome.

## Short post

Krono is my open-source Android app for competitive programming: contest countdowns, reminders, coding profiles and daily practice tracking. Native Kotlin + Compose, GPLv3, no Krono account required.

Try it: https://github.com/MeetThakur/Krono

## Screenshots

Use the existing images in `fastlane/metadata/android/en-US/images/phoneScreenshots/`. They show synthetic demo accounts. The feature graphic is in the same metadata directory under `images/featureGraphic.png`.

## Publishing order

1. Publish a tagged release containing both the original GitHub APK and the separately signed store APK.
2. Update the existing F-Droid request with the release and verification evidence. Skip IzzyOnDroid while its AI-code policy excludes this project. Describe F-Droid inclusion as pending until the maintainers accept and publish it.
3. Share a post with the direct GitHub download and screenshots. Add store links only after the listings exist.
4. Follow up with a short update based on actual feedback or a new release.

Before posting in a community, check its current self-promotion rules and disclose that you are the developer. Do not describe an unaccepted store submission as a published listing.

## v2.0.2 announcement

Krono v2.0.2 is out with fixes for profile syncing, contest reminders and a Rivals crash. It also adds bundled library notices and privacy links.

If you already use the GitHub app, download **app-release.apk** to update without reinstalling. **Krono Store** is a separate installation with its own data.

Release: https://github.com/MeetThakur/Krono/releases/tag/v2.0.2

F-Droid inclusion is pending maintainer review. Feedback on reminder delivery and platform syncing is welcome.
