# Store readiness review

Reviewed 13 November 2026 against the F-Droid and IzzyOnDroid policies linked below. Baseline: published v2.0.1, commit `ae6d8420d4151b4607dde4f7f0eeb5d32423329e`. The fixes in this review are subsequent source changes; they are not in the v2.0.1 APKs.

## Decision

**F-Droid: technically ready for packaging review, with acceptance and signing arrangements pending. IzzyOnDroid: blocked by its policy on AI-generated code.** Passing a local audit does not establish store acceptance or guarantee the absence of defects.

The F-Droid packaging request already exists at https://gitlab.com/fdroid/rfp/-/work_items/4789. It references v2.0.1. Before maintainers package the fixes below, publish a new version and update that request to the new immutable source commit and APK. Do not replace v2.0.1 assets in place. No further store submission was made during this audit.

## Scope

Reviewed the active Android module: application and activity startup; navigation and Compose screens/components; ViewModels; domain models; repositories; platform API clients, DTOs and HTML/JSON parsers; Room entities/DAOs; preferences; legacy data import; notification delivery, alarms and background workers; manifest and resources; Gradle configuration; signing scripts; CI/release workflows; and distribution metadata, privacy and license material.

`legacy-rn/` is an archived predecessor, not a module in `settings.gradle.kts`. Its code and bundled binaries must be removed from the disposable F-Droid build checkout before scanning/building. This review does not certify the archived app as a separate distributable product. Removing it from a packaging checkout does not remove the source from project history.

## Requirements and evidence

| Area | Result | Evidence / remaining action |
| --- | --- | --- |
| Public source and license | Pass for packaging review | Public GitHub source and version tag; GPLv3 `LICENSE`, now also bundled in APK assets. History begins January 2026, exceeding F-Droid's normal three-month development period. |
| Build without private credentials | Pass locally | A fresh v2.0.1 checkout with no signing files built `assembleStoreRelease -PkronoStoreUnsigned=true`, with both signing paths pointing to nonexistent files. No API key, login, Play Services or proprietary build service is required. |
| Reproducibility | Pass between upstream CI and local clean checkout for v2.0.1 | `apksigcopier compare --unsigned` succeeded comparing the published GitHub Linux-built store APK to the fresh macOS unsigned rebuild. This is upstream verification, not an F-Droid build-server result. Repeat for the next release containing these fixes. |
| Dependency provenance | Pass inventory check | `distribution/dependency-licenses.json` records 111 distinct runtime modules and versioned POM URLs. All declare Apache 2.0 or BSD 3-Clause; Guava ListenableFuture inherits Apache 2.0 from its parent POM. Repositories are Google Maven and Maven Central. |
| License redistribution | Improved in this review | Retained distinct runtime artifact license/notice texts, Jakarta notice, Protobuf BSD notice, Public Suffix List notice/MPL 2.0, GPLv3 and existing font OFL notices in APK assets. `THIRD_PARTY_NOTICES.md` points to sources and the inventory. |
| Proprietary components / trackers | No scanner findings | fdroidserver 2.4.5 source scan returned 0 fatal findings on the v2.0.1 packaging checkout after excluding the unused archive; published v2.0.1 and audited store APK binary scans returned 0 findings. Source inspection found no ad/analytics SDK, dynamic code loader or silent APK updater in the active app. |
| Known dependency vulnerabilities | No listed OSV matches | Queried the 113 resolved runtime artifacts (111 distinct modules) against OSV's Maven database on review day: 0 matched vulnerable artifacts. This does not cover unknown vulnerabilities or certify all application logic. |
| Signing | Pass, separate channels | Original `com.meet11.Krono` keeps its v1.6.5 certificate for updates. Store package `com.meet11.Krono.store` uses the separate private pinned certificate. Gradle and release CI reject missing/mismatched keys. The original historic key is public and unsuitable for store submission. |
| Native compatibility | Pass alignment checks | Every PT_LOAD segment in all eight bundled native libraries has 16 KiB alignment. Android `zipalign -c -P 16 -v 4` passes on the store APK. This is not a device test on every ABI/page-size combination. |
| Permissions and privacy | Pass source review | Network, notification, boot, alarm, wake-lock and vibration permissions have documented functions. No platform password/token is requested. `PRIVACY.md` discloses direct requests, public handles, IP exposure, local storage and Android backups. Privacy/notices links added in Settings. |
| Listing metadata | Pass local validation | Fastlane title 11/50 characters, summary 68/80, full description 1366/4000; changelog within 500; PNG icon, feature graphic and six screenshots present. Descriptions disclose network availability and reminder restrictions. |
| F-Droid anti-features | Maintainer decision | Platform requests use third-party services; `NonFreeNet` and/or `TetheredNet` may apply. Services were disclosed in the existing request. Anti-features must not be omitted to obtain approval. |
| F-Droid packaging/signing | Pending | Maintainers must verify the actual build-server recipe and decide whether reproducible upstream signing is used. To preserve store-channel interoperability, configure the upstream versioned `Binaries` URL and pinned `AllowedAPKSigningKeys` if they accept reproducible builds. An F-Droid-signed package would use a different update key. |
| IzzyOnDroid AI policy | Blocked | Krono contains assistant-authored code. A separate private signing key resolves the debug-key rejection, but does not resolve the AI-code policy. Do not submit a false no-AI declaration. |
| Acceptance and third-party rights | Maintainer/publisher review | Stores retain discretion over usefulness, licensing and service branding. An independence disclaimer is present; it is not a grant of trademark rights. No claim of store approval is made. |

## Reliability fixes

1. **Incomplete profile refreshes could overwrite cached statistics with zero/null values.** Required Codeforces submission/rating responses, LeetCode solved/contest data and AtCoder solved counts now fail the snapshot when unavailable. Repositories keep failed rows, preserve imported submission/badge metadata and report partial failures while still saving successful rows. Legitimately unrated LeetCode profiles remain supported.
2. **Outages could appear as nonexistent users.** CodeChef 403/429/5xx and challenge/unrecognized HTML now propagate as temporary failures; explicit missing-user responses remain distinct. Codeforces HTTP 400 rate limits are distinguished from its missing-handle error.
3. **Notification denial still enabled a reminder.** Enabling now waits for a granted permission and checks the notification channel. Denial leaves the reminder disabled and explains how to enable notifications. The receiver does not mark delivery when notifications/channel are blocked.
4. **Changing lead time could cancel an existing alarm and leave its enabled database state without a replacement.** Future contests whose chosen lead already passed now schedule immediately; existing lead-time state changes only after scheduling succeeds. Foreground contest refreshes re-arm changed schedules, and late alarms do not announce a contest that has already started.
5. **Hash collisions could replace another contest's alarm/notification.** Alarm PendingIntents now include the complete contest ID in their data URI; notifications use the full contest ID as their tag. Cancel/re-arm also removes old hash-only alarm identities.
6. **Daily practice could remain on yesterday while the screen stayed open.** Daily goal state now reevaluates on the minute tick. Undo captures the date of the original solve, including across midnight.
7. **Adding your own profile as a rival could crash the list.** Profile/rival rows now have distinct Compose keys even when their platform and handle match.
8. **A release tag could publish without tests/lint.** The release job now runs unit tests and both release lint variants before publishing. CI retains both lint reports and test results; the Gradle distribution is SHA-256 pinned.

## Validation

- `./gradlew testDebugUnitTest lintRelease lintStoreRelease assembleDebug assembleRelease assembleStoreRelease -PkronoStoreUnsigned=true` passed locally. 38 JVM tests, including real Retrofit/MockWebServer outage and partial-refresh tests, pass. Test fixtures do not contact live platforms.
- Both release lint variants: **0 errors, 72 warnings**. Warnings are 62 dependency-version suggestions, two AGP-version suggestions, five duplicate launcher icon images, two redundant SDK checks and one target-SDK recency suggestion. Target SDK is 35, minimum SDK 26. This review did not introduce a broad dependency/toolchain upgrade.
- Android emulator: denied the actual notification permission dialog, observed the explanatory snackbar and confirmed `reminderSet=0` in the debug database. Opened Rivals with the same fixture handle in both profile and rival tables: both rows rendered without an AndroidRuntime crash. Fixtures were confined to the separate debug package.
- Live smoke requests on review day: Codeforces user info, CodeChef profile HTML, AtCoder official history, AtCoder Problems count and LeetCode profile GraphQL each returned HTTP 200. HTTP success alone does not prove every field/parser or future availability.
- The baseline signed store APK SHA-256 is `acc3c02a1cf7ac0c4800e69ed67ce50dea14369077f470be00334542680c3b8f`; its matching clean unsigned rebuild SHA-256 is `8abeece7c0d1fad7a3d8ab25256486cccf226712826783c3b4d3d0fe8b83b409`. Different file hashes are expected because the second APK is unsigned; signature-copy verification passed.

### Build instructions for maintainers

Use a FLOSS JDK 17, Android SDK platform 35 and the Gradle version pinned in `gradle/wrapper/gradle-wrapper.properties` (9.3.1). Exclude `legacy-rn/` from the disposable packaging checkout. The active project does not depend on it.

```sh
./gradlew assembleStoreRelease -PkronoStoreUnsigned=true
```

The unsigned output is `app/build/outputs/apk/storeRelease/app-storeRelease-unsigned.apk`. F-Droid may remove the wrapper and invoke its installed matching Gradle directly. `storeRelease` is a custom **build type**, not a Gradle product flavor: a recipe must invoke `assembleStoreRelease` explicitly, rather than constructing `assembleStoreReleaseRelease` from a flavor name. The build needs no signing secrets.

```sh
apksigcopier compare --unsigned published-store.apk rebuilt-store-unsigned.apk
zipalign -c -P 16 -v 4 rebuilt-store-unsigned.apk
```

These are useful upstream checks. F-Droid's own build/verification and inclusion decision remain outstanding.

## Remaining product limitations

- Platform HTML/GraphQL contracts can change. CodeChef uses HTML extraction; successful HTTP responses do not guarantee a recognized profile. Cached data and failure messages mitigate outages, but do not remove the dependency.
- Codeforces solved count currently covers distinct accepted problems in the latest 10,000 submissions; it can undercount lifetime solves on very active accounts.
- Without exact-alarm access, Android can defer a reminder. Battery restrictions, force-stop and device settings can prevent delivery. The app exposes timing/notification settings and the listing discloses this limitation.
- Room is currently schema version 1 with destructive migration fallback. No schema change is in this review; before increasing the database version, implement/test migrations and export the schema rather than relying on destructive fallback.
- This review does not include exhaustive testing on every Android version, OEM, ABI, accessibility setting or platform account state.

## Primary requirements checked

- https://f-droid.org/en/docs/Inclusion_Policy/
- https://f-droid.org/en/docs/Anti-Features/
- https://f-droid.org/en/docs/Submitting_to_F-Droid_Quick_Start_Guide/
- https://f-droid.org/en/docs/All_About_Descriptions_Graphics_and_Screenshots/
- https://f-droid.org/en/docs/Build_Metadata_Reference/
- https://f-droid.org/en/docs/Reproducible_Builds/
- https://izzyondroid.org/docs/general/AppInclusionPolicy/#ai-policy
- https://izzyondroid.org/about/security/SigningKeys/
