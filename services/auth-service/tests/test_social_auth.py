from urllib.parse import urlparse

import jwt
import pytest
import respx
from httpx import Response

from app.core.oauth import (
    consume_oauth_state,
    generate_pkce_pair,
    sanitize_next_url,
    store_oauth_state,
)
from app.core.security import hash_password
from app.models.user import Identity, User
from app.services.account_linker import (
    AccountLinkingRequiredError,
    UnlinkNotAllowedError,
    get_user_identities_and_methods,
    resolve_or_create_social_user,
    unlink_identity_from_user,
)

# =========================================================================
# Unit Tests: Helpers, PKCE, Sanitization, State Storage
# =========================================================================


def test_sanitize_next_url():
    # Valid relative paths
    assert sanitize_next_url("/curriculum") == "/curriculum"
    assert sanitize_next_url("/quizzes/123?filter=all") == "/quizzes/123?filter=all"

    # Open redirect attacks
    assert sanitize_next_url("https://evil.com") == "/curriculum"
    assert sanitize_next_url("http://attacker.com/steal") == "/curriculum"
    assert sanitize_next_url("//evil.com") == "/curriculum"
    assert sanitize_next_url("/\\evil.com") == "/curriculum"
    assert sanitize_next_url("javascript:alert(1)") == "/curriculum"
    assert sanitize_next_url("") == "/curriculum"
    assert sanitize_next_url(None) == "/curriculum"


def test_pkce_generation():
    verifier, challenge = generate_pkce_pair()
    assert len(verifier) >= 43
    assert len(challenge) >= 43
    assert "=" not in challenge  # Unpadded base64url


@pytest.mark.asyncio
async def test_oauth_state_single_use():
    state = "state-test-single-use-123"
    payload = {"provider": "google", "next": "/quizzes"}
    await store_oauth_state(state, payload, ttl_seconds=60)

    # First consumption succeeds
    data = await consume_oauth_state(state)
    assert data is not None
    assert data["provider"] == "google"
    assert data["next"] == "/quizzes"

    # Second consumption returns None (single-use replay defense)
    data_second = await consume_oauth_state(state)
    assert data_second is None


# =========================================================================
# Unit Tests: 6-Case Account Linking Matrix
# =========================================================================


@pytest.mark.asyncio
async def test_linking_rule_1_existing_identity(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        # Pre-create user and identity
        user = User(
            name="Alice",
            email="alice@example.com",
            email_verified=True,
            status="active",
            source="google",
        )
        session.add(user)
        await session.flush()

        identity = Identity(
            user_id=user.id,
            provider="google",
            provider_user_id="google-sub-alice-01",
            email_at_link="alice@example.com",
        )
        session.add(identity)
        await session.commit()

        # Rule 1: Existing identity found -> logs in as existing user
        resolved_user, is_linked, user_status = await resolve_or_create_social_user(
            db=session,
            provider="google",
            provider_user_id="google-sub-alice-01",
            provider_email="alice.updated@example.com",
            email_verified=True,
            name="Alice Updated",
        )
        assert resolved_user.id == user.id
        assert is_linked is False
        assert user_status == "active"


@pytest.mark.asyncio
async def test_linking_rule_2_both_verified_auto_link(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        # Existing user with verified email
        user = User(
            name="Bob",
            email="bob@example.com",
            email_verified=True,
            status="active",
            source="email",
            password_hash=hash_password("BobSecretPassword123!"),
        )
        session.add(user)
        await session.flush()
        ident_pwd = Identity(
            user_id=user.id,
            provider="password",
            provider_user_id=user.id,
            email_at_link=user.email,
        )
        session.add(ident_pwd)
        await session.commit()

        # Rule 2: Bob signs in with GitHub, email matches and both sides verified -> auto-link!
        resolved_user, is_linked, user_status = await resolve_or_create_social_user(
            db=session,
            provider="github",
            provider_user_id="gh-bob-456",
            provider_email="bob@example.com",
            email_verified=True,
            name="Bob on GitHub",
        )
        assert resolved_user.id == user.id
        assert is_linked is True
        assert user_status == "active"

        # Verify identity was saved
        identities, _ = await get_user_identities_and_methods(session, user.id)
        assert len(identities) == 2
        providers = {i.provider for i in identities}
        assert "password" in providers
        assert "github" in providers


@pytest.mark.asyncio
async def test_linking_rule_3_unverified_rejects_auto_link(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        # Existing user with verified email
        user = User(
            name="Charlie",
            email="charlie@example.com",
            email_verified=True,
            status="active",
            source="email",
        )
        session.add(user)
        await session.commit()

        # Attacker signs in with GitHub with same email, but unverified!
        with pytest.raises(AccountLinkingRequiredError):
            await resolve_or_create_social_user(
                db=session,
                provider="github",
                provider_user_id="gh-attacker-789",
                provider_email="charlie@example.com",
                email_verified=False,  # Unverified on provider side
                name="Attacker",
            )

        # Existing user who is unverified on FastQuiz
        user_unverified = User(
            name="Dan",
            email="dan@example.com",
            email_verified=False,  # Unverified locally
            status="pending_consent",
            source="email",
        )
        session.add(user_unverified)
        await session.commit()

        # Social provider sends verified email, but local account unverified -> reject auto-link!
        with pytest.raises(AccountLinkingRequiredError):
            await resolve_or_create_social_user(
                db=session,
                provider="google",
                provider_user_id="google-dan-999",
                provider_email="dan@example.com",
                email_verified=True,
                name="Dan",
            )


@pytest.mark.asyncio
async def test_linking_rule_4_new_user_provisioned_as_pending_consent(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        resolved_user, is_linked, user_status = await resolve_or_create_social_user(
            db=session,
            provider="google",
            provider_user_id="google-eve-555",
            provider_email="eve@example.com",
            email_verified=True,
            name="Eve",
        )
        assert resolved_user.id is not None
        assert resolved_user.status == "pending_consent"
        assert is_linked is False
        assert user_status == "pending_consent"

        identities, _ = await get_user_identities_and_methods(session, resolved_user.id)
        assert len(identities) == 1
        assert identities[0].provider == "google"
        assert identities[0].provider_user_id == "google-eve-555"


@pytest.mark.asyncio
async def test_linking_rule_5_github_unverified_email(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        # GitHub user has no verified email
        resolved_user, is_linked, user_status = await resolve_or_create_social_user(
            db=session,
            provider="github",
            provider_user_id="gh-frank-777",
            provider_email=None,
            email_verified=False,
            name="Frank Developer",
        )
        assert resolved_user.id is not None
        assert resolved_user.email is None
        assert resolved_user.email_verified is False
        assert resolved_user.status == "pending_consent"


@pytest.mark.asyncio
async def test_linking_rule_6_last_login_method_protection(setup_test_db):
    from tests.conftest import TestSessionLocal

    async with TestSessionLocal() as session:
        # User with ONLY google identity (no password)
        user = User(
            name="Grace",
            email="grace@example.com",
            email_verified=True,
            status="active",
            source="google",
            password_hash=None,
        )
        session.add(user)
        await session.flush()
        ident = Identity(
            user_id=user.id,
            provider="google",
            provider_user_id="google-grace-111",
            email_at_link="grace@example.com",
        )
        session.add(ident)
        await session.commit()

        # Rule 6: Attempting to unlink last method must fail
        with pytest.raises(UnlinkNotAllowedError):
            await unlink_identity_from_user(session, user.id, "google")

        # Now link a second method (GitHub)
        ident_gh = Identity(
            user_id=user.id,
            provider="github",
            provider_user_id="gh-grace-222",
            email_at_link="grace@example.com",
        )
        session.add(ident_gh)
        await session.commit()

        # Now unlinking google should succeed because GitHub remains
        await unlink_identity_from_user(session, user.id, "google")
        remaining, _ = await get_user_identities_and_methods(session, user.id)
        assert len(remaining) == 1
        assert remaining[0].provider == "github"


# =========================================================================
# Integration Tests: Auth Endpoints, Consent, Rotation, Logout
# =========================================================================


@pytest.mark.asyncio
async def test_login_redirect_and_state(client):
    resp = await client.get(
        "/auth/google/login?next=/my-quizzes", follow_redirects=False
    )
    assert resp.status_code == 302
    location = resp.headers["location"]
    parsed_location = urlparse(location)
    assert parsed_location.hostname == "accounts.google.com"
    assert "state=" in location
    assert "code_challenge=" in location
    assert "nonce=" in location


@pytest.mark.asyncio
async def test_dpdpa_consent_accept_and_decline(client):
    # 1. Register a new user (enters pending_consent)
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": "consent.user@example.com",
            "password": "StrongPassword123!",
            "name": "Consent User",
        },
    )
    assert reg_resp.status_code == 200
    token = reg_resp.json()["access_token"]
    assert reg_resp.json()["user"]["status"] == "pending_consent"

    # 2. Accept consent
    headers = {"Authorization": f"Bearer {token}"}
    consent_resp = await client.post(
        "/auth/consent",
        headers=headers,
        json={"policy_version": "2026.1", "accepted": True},
    )
    assert consent_resp.status_code == 200
    assert consent_resp.json()["status"] == "accepted"
    assert consent_resp.json()["user_status"] == "active"

    # 3. Create another user and decline consent
    reg_resp2 = await client.post(
        "/auth/register",
        json={
            "email": "decline.user@example.com",
            "password": "StrongPassword123!",
            "name": "Decline User",
        },
    )
    assert reg_resp2.status_code == 200
    token2 = reg_resp2.json()["access_token"]

    decline_resp = await client.post(
        "/auth/consent",
        headers={"Authorization": f"Bearer {token2}"},
        json={"policy_version": "2026.1", "accepted": False},
    )
    assert decline_resp.status_code == 200
    assert decline_resp.json()["status"] == "declined"

    # User was deleted upon declining
    me_resp = await client.get(
        "/auth/me", headers={"Authorization": f"Bearer {token2}"}
    )
    assert me_resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token_rotation_and_reuse_defense(client):
    # Register user
    reg_resp = await client.post(
        "/auth/register",
        json={
            "email": "rotator@example.com",
            "password": "StrongPassword123!",
            "name": "Rotator",
        },
    )
    refresh_token_1 = reg_resp.json()["refresh_token"]

    # 1. First refresh -> succeeds and issues new refresh token
    ref_resp_1 = await client.post(
        "/auth/refresh",
        params={"body_refresh_token": refresh_token_1},
    )
    assert ref_resp_1.status_code == 200
    refresh_token_2 = ref_resp_1.json()["refresh_token"]
    assert refresh_token_2 != refresh_token_1

    # 2. Replay the first (revoked) refresh token -> REUSE DETECTED!
    replay_resp = await client.post(
        "/auth/refresh",
        params={"body_refresh_token": refresh_token_1},
    )
    assert replay_resp.status_code == 401
    assert "reuse detected" in replay_resp.json()["detail"].lower()

    # 3. Even the newly issued token_2 is now revoked because family was compromised!
    compromised_resp = await client.post(
        "/auth/refresh",
        params={"body_refresh_token": refresh_token_2},
    )
    assert compromised_resp.status_code == 401


@pytest.mark.asyncio
@respx.mock
async def test_google_callback_flow(client):
    # Setup state in redis
    state = "test-google-state-ok"
    verifier, challenge = generate_pkce_pair()
    nonce = "test-google-nonce-123"
    await store_oauth_state(
        state=state,
        payload={
            "provider": "google",
            "code_verifier": verifier,
            "nonce": nonce,
            "next": "/dashboard",
            "redirect_uri": "http://test/auth/google/callback",
        },
    )

    # Mock Google Token endpoint
    mock_id_token = jwt.encode(
        {
            "sub": "google-user-sub-001",
            "email": "google.learner@fastquiz.dev",
            "email_verified": True,
            "name": "Google Learner",
            "picture": "https://lh3.googleusercontent.com/avatar.jpg",
            "nonce": nonce,
        },
        "mock-secret",
        algorithm="HS256",
    )
    respx.post("https://oauth2.googleapis.com/token").mock(
        return_value=Response(
            200,
            json={
                "access_token": "mock-google-access-token",
                "id_token": mock_id_token,
                "token_type": "Bearer",
                "expires_in": 3600,
            },
        )
    )

    # Execute callback
    callback_resp = await client.get(
        f"/auth/google/callback?code=mock-google-code&state={state}",
        follow_redirects=False,
    )
    assert callback_resp.status_code == 302
    # Since new user, should redirect to /consent?next=%2Fdashboard
    location = callback_resp.headers["location"]
    assert "/consent" in location
    assert "fastquiz_access_token" in callback_resp.headers.get("set-cookie", "")
    assert "fastquiz_refresh_token" in callback_resp.headers.get("set-cookie", "")


@pytest.mark.asyncio
@respx.mock
async def test_github_callback_primary_verified_email(client):
    # Setup state in redis
    state = "test-github-state-ok"
    verifier, challenge = generate_pkce_pair()
    await store_oauth_state(
        state=state,
        payload={
            "provider": "github",
            "code_verifier": verifier,
            "nonce": None,
            "next": "/curriculum",
            "redirect_uri": "http://test/auth/github/callback",
        },
    )

    # Mock GitHub Token endpoint
    respx.post("https://github.com/login/oauth/access_token").mock(
        return_value=Response(
            200,
            json={"access_token": "mock-gh-access-token", "token_type": "bearer"},
        )
    )

    # Mock GitHub /user
    respx.get("https://api.github.com/user").mock(
        return_value=Response(
            200,
            json={
                "id": 987654321,
                "login": "octocat-dev",
                "name": "Mona Lisa Octocat",
                "avatar_url": "https://avatars.githubusercontent.com/u/987654321",
            },
        )
    )

    # Mock GitHub /user/emails
    respx.get("https://api.github.com/user/emails").mock(
        return_value=Response(
            200,
            json=[
                {
                    "email": "unverified@example.com",
                    "primary": False,
                    "verified": False,
                },
                {"email": "octocat@github.com", "primary": True, "verified": True},
            ],
        )
    )

    callback_resp = await client.get(
        f"/auth/github/callback?code=mock-gh-code&state={state}",
        follow_redirects=False,
    )
    assert callback_resp.status_code == 302
    assert "/consent" in callback_resp.headers["location"]
    assert "fastquiz_access_token" in callback_resp.headers.get("set-cookie", "")
