#!/usr/bin/env python3
"""Recover the existing 1.x signing key from pinned project history, without generating a new key."""

import os
import pathlib
import subprocess
import sys


ROOT = pathlib.Path(__file__).resolve().parent.parent
LEGACY_COMMIT = "fcf13a22dc5c981c27ee05dab66c92af94ffce33"  # v1.6.5
DESTINATION = ROOT / ".signing" / "krono-legacy.keystore"


def main():
    # The key was already committed in 1.x. Recover exactly that blob; never regenerate it.
    result = subprocess.run(
        ["git", "show", f"{LEGACY_COMMIT}:android/app/debug.keystore"],
        cwd=ROOT,
        capture_output=True,
    )
    if result.returncode or not result.stdout:
        sys.exit(
            "The v1.6.5 signing key is absent from this checkout's history. "
            f"Run git fetch origin {LEGACY_COMMIT} and retry, or configure KRONO_KEYSTORE_PATH."
        )
    DESTINATION.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    if DESTINATION.exists() and DESTINATION.read_bytes() != result.stdout:
        sys.exit(f"Refusing to overwrite a different key at {DESTINATION}.")
    # Restrict permissions before writing private-key material.
    with open(DESTINATION, "wb", opener=lambda path, flags: os.open(path, flags, 0o600)) as output:
        output.write(result.stdout)
    DESTINATION.chmod(0o600)
    print(f"Restored the v1.6.5 signing key to {DESTINATION}")
    print("Release builds verify its certificate before packaging.")


if __name__ == "__main__":
    main()
