#!/usr/bin/env python3
"""Create Krono's separate store identity once. Never regenerate an existing identity."""

import hashlib
import os
from pathlib import Path
import secrets
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent
SIGNING = ROOT / ".signing"
KEYSTORE = SIGNING / "krono-store.jks"
PROPERTIES = SIGNING / "store-signing.properties"
PIN = ROOT / "distribution" / "store-certificate.sha256"


def private_write(path, data):
    with open(path, "xb", opener=lambda name, flags: os.open(name, flags, 0o600)) as output:
        output.write(data)


def main():
    if any(path.exists() for path in (KEYSTORE, PROPERTIES, PIN)):
        sys.exit("A store identity already exists. Reuse it; do not generate another key.")
    keytool = shutil.which("keytool")
    if not keytool:
        sys.exit("Install/select JDK 17 so keytool is available.")
    SIGNING.mkdir(mode=0o700, exist_ok=True)
    password = secrets.token_hex(32)
    env = os.environ.copy()
    env["KRONO_NEW_STORE_PASSWORD"] = password
    # Reserve the path with private permissions before keytool writes it.
    # keytool needs an absent file, so the containing directory is also private.
    SIGNING.chmod(0o700)
    subprocess.run([
        keytool, "-genkeypair", "-noprompt", "-storetype", "PKCS12",
        "-keystore", str(KEYSTORE), "-alias", "krono-store",
        "-keyalg", "RSA", "-keysize", "4096", "-validity", "10000",
        "-dname", "CN=Krono Store, O=Meet Thakur, C=IN",
        "-storepass:env", "KRONO_NEW_STORE_PASSWORD",
        "-keypass:env", "KRONO_NEW_STORE_PASSWORD",
    ], env=env, check=True, capture_output=True)
    KEYSTORE.chmod(0o600)
    certificate = subprocess.run([
        keytool, "-exportcert", "-keystore", str(KEYSTORE), "-alias", "krono-store",
        "-storepass:env", "KRONO_NEW_STORE_PASSWORD",
    ], env=env, check=True, capture_output=True).stdout
    private_write(PROPERTIES, f"storePassword={password}\nkeyAlias=krono-store\nkeyPassword={password}\n".encode())
    PIN.parent.mkdir(parents=True, exist_ok=True)
    PIN.write_text(hashlib.sha256(certificate).hexdigest() + "\n")
    print("Created the private store key in the ignored .signing directory.")
    print("Only the public certificate fingerprint is stored in distribution/store-certificate.sha256.")
    print("Back up the keystore and credentials securely; future store updates require this key.")


if __name__ == "__main__":
    main()
