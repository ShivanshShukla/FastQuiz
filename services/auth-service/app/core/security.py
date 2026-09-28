import hashlib

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

# Configure Argon2id password hasher (OWASP recommended parameters)
_password_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=2,
    hash_len=32,
)

# Pre-computed dummy hash using the same Argon2 parameters to neutralize timing attacks
# when an email does not exist in the database.
DUMMY_ARGON2_HASH: str = _password_hasher.hash(
    "FastQuizTimingAttackDefenseString12345!"
)


def hash_password(password: str) -> str:
    """Hashes a password with Argon2id."""
    return _password_hasher.hash(password)


def verify_password(password: str, hash_str: str) -> bool:
    """Verifies a plaintext password against an Argon2id hash.
    Returns True if valid, False otherwise."""
    try:
        return _password_hasher.verify(hash_str, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def verify_dummy_password(password: str) -> None:
    """Runs a constant-time dummy verification against DUMMY_ARGON2_HASH
    so that timing analysis cannot differentiate between non-existent emails
    and wrong passwords."""
    try:
        _password_hasher.verify(DUMMY_ARGON2_HASH, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        pass


def hash_token(raw_token: str) -> str:
    """Computes a SHA-256 hex digest of a token for database lookup and storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
