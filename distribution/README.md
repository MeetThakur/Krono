# Distribution

## Channels

| Channel | App ID | Signing identity | Status |
| --- | --- | --- | --- |
| Original GitHub edition | `com.meet11.Krono` | Original 1.x certificate | Published on GitHub; existing installations can update |
| Store edition | `com.meet11.Krono.store` | Separate private release key, pinned in `store-certificate.sha256` | Published on GitHub; F-Droid request pending packaging review |
| Development | `com.meet11.Krono.debug` | Local debug key | Development only |

Krono Store installs separately and does not import another package's private app storage. Existing GitHub users should continue using `app-release.apk` unless they intentionally want a new store installation.

## Signing and builds

Generate the store key only once:

```sh
python3 scripts/prepare-store-signing.py
./gradlew assembleStoreRelease
```

The key and local credential file are ignored by Git. Keep a secure backup of both. The pinned certificate fingerprint is public; the private key and passwords must never be committed. Tagged releases use the `KRONO_STORE_KEYSTORE_BASE64`, `KRONO_STORE_KEYSTORE_PASSWORD`, `KRONO_STORE_KEY_ALIAS` and `KRONO_STORE_KEY_PASSWORD` repository secrets. `KRONO_STORE_KEYSTORE_PATH` selects an external key file when building locally or in CI.

Output: `app/build/outputs/apk/storeRelease/app-storeRelease.apk`. Published filename: `krono-store-vX.Y.Z.apk`.

Packagers can build an unsigned store APK without the private key:

```sh
./gradlew assembleStoreRelease -PkronoStoreUnsigned=true
```

Output: `app/build/outputs/apk/storeRelease/app-storeRelease-unsigned.apk`. This option applies only to the store package. Original GitHub releases still enforce the original certificate. Unsigned APKs are never attached to GitHub Releases.

Upstream validation: a clean v2.0.1 checkout built without signing keys, and `apksigcopier compare --unsigned` verified it against the published GitHub CI store APK across Linux and macOS builders. This is not an F-Droid build-server verification. Repeat the comparison for the next release containing the review fixes.

## Store readiness

- Fastlane descriptions, screenshots, icon and feature graphic: `fastlane/metadata/android/en-US/`.
- Privacy information: `PRIVACY.md`.
- Font license notices: `app/src/main/assets/licenses/` and `THIRD_PARTY_NOTICES.md`.
- Prepared F-Droid request: `fdroid-request.md`.
- Promotion drafts: `PROMOTION.md`.
- Release verification and publication links: `releases/v2.0.2-verification.md`.
- Full code and policy review: `STORE_REVIEW.md` (including fixes, verification and remaining blockers).

F-Droid requires maintainer review and a successful source build. A developer-signed listing also requires its reproducible-build checks; no such acceptance is claimed here. A separately F-Droid-signed APK would not be interchangeable with the developer-signed store APK, so the signing plan must be settled during packaging.

IzzyOnDroid rejects public/debug keys and generally rejects apps containing AI-generated code. The new key resolves the signing issue, but Krono includes assistant-authored code. Do not claim compliance with its AI policy or submit a declaration that no AI-generated code is included. No IzzyOnDroid acceptance is claimed.

Sources checked 12 November 2026:

- https://f-droid.org/en/docs/Submitting_to_F-Droid_Quick_Start_Guide/
- https://f-droid.org/en/docs/All_About_Descriptions_Graphics_and_Screenshots/
- https://izzyondroid.org/about/security/SigningKeys/
- https://izzyondroid.org/docs/general/AppInclusionPolicy/#ai-policy
