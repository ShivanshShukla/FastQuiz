import base64
import hashlib
import os
import secrets

import pyotp
import segno
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.core.config import settings


def _get_encryption_key() -> bytes:
    """Derives a fixed 32-byte key from settings.TOTP_ENCRYPTION_KEY using SHA-256."""
    return hashlib.sha256(settings.TOTP_ENCRYPTION_KEY.encode("utf-8")).digest()


def encrypt_totp_secret(secret: str) -> str:
    """Encrypts a base32 TOTP secret using AES-256-GCM.
    Returns base64 encoded string: nonce(12 bytes) + ciphertext + tag(16 bytes)."""
    aesgcm = AESGCM(_get_encryption_key())
    nonce = os.urandom(12)
    encrypted_bytes = aesgcm.encrypt(nonce, secret.encode("utf-8"), None)
    return base64.b64encode(nonce + encrypted_bytes).decode("utf-8")


def decrypt_totp_secret(encrypted_b64: str) -> str:
    """Decrypts an AES-256-GCM encrypted TOTP secret."""
    raw_data = base64.b64decode(encrypted_b64.encode("utf-8"))
    nonce = raw_data[:12]
    ciphertext = raw_data[12:]
    aesgcm = AESGCM(_get_encryption_key())
    decrypted_bytes = aesgcm.decrypt(nonce, ciphertext, None)
    return decrypted_bytes.decode("utf-8")


def generate_totp_secret() -> str:
    """Generates a secure random 32-character base32 secret."""
    return pyotp.random_base32()


def generate_recovery_codes(count: int = 8) -> tuple[list[str], list[str]]:
    """Generates one-time backup recovery codes.
    Returns (plaintext_codes_for_user, hashed_codes_for_db)."""
    plain_codes: list[str] = []
    hashed_codes: list[str] = []

    for _ in range(count):
        # Format: 5 alphanumeric - 5 alphanumeric (e.g. A3F8K-92J1P)
        chunk1 = secrets.token_hex(3).upper()[:5]
        chunk2 = secrets.token_hex(3).upper()[:5]
        code = f"{chunk1}-{chunk2}"
        plain_codes.append(code)
        # Store normalized lowercase SHA-256 hash
        hash_val = hashlib.sha256(
            code.replace("-", "").strip().lower().encode("utf-8")
        ).hexdigest()
        hashed_codes.append(hash_val)

    return plain_codes, hashed_codes


def verify_recovery_code(
    entered_code: str, stored_hashes: list[str]
) -> tuple[bool, list[str]]:
    """Checks if entered_code matches any stored hashed recovery code.
    If matched, removes the used code and returns (True, updated_hashes)."""
    norm = entered_code.replace("-", "").strip().lower()
    candidate_hash = hashlib.sha256(norm.encode("utf-8")).hexdigest()

    if candidate_hash in stored_hashes:
        remaining_hashes = [h for h in stored_hashes if h != candidate_hash]
        return True, remaining_hashes
    return False, stored_hashes


def verify_totp_code(secret: str, code: str) -> bool:
    """Verifies a 6-digit TOTP code against the secret (allowing +-30s clock drift)."""
    totp = pyotp.TOTP(secret)
    cleaned = code.strip().replace(" ", "")
    return bool(totp.verify(cleaned, valid_window=1))


def generate_totp_provisioning_uri(email: str, secret: str) -> str:
    """Builds an otpauth:// provisioning URI for authenticator apps."""
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name="FastQuiz Admin")


def generate_qr_code_svg(uri: str) -> str:
    """Generates an inline SVG string for the QR code using Segno."""
    qr = segno.make(uri, error="m")
    # Generates a clean standalone SVG string
    return qr.svg_inline(scale=4, border=2)
