import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
import fakeredis.aioredis

from app.core.db import Base, get_db
from app.core.jwt import create_admin_access_token
from app.core.security import hash_password
from app.main import app
from app.models.admin import Admin
from app.models.user import User
from app.routers.admin_dashboard import router as dashboard_router
import app.core.rate_limit as rate_limit_module

from tests.conftest import TestSessionLocal


@pytest_asyncio.fixture
async def super_admin_token():
    async with TestSessionLocal() as session:
        admin = Admin(
            id="adm-super-01",
            email="superadmin@fastquiz.dev",
            password_hash=hash_password("SuperSecretAdminPass123!"),
            name="Alex Super Admin",
            role="super_admin",
            is_active=True,
            totp_enabled=True,
        )
        session.add(admin)
        await session.commit()

    token, _ = create_admin_access_token(
        admin_id="adm-super-01",
        email="superadmin@fastquiz.dev",
        role="super_admin",
        name="Alex Super Admin",
    )
    return token


@pytest.mark.asyncio
async def test_dashboard_summary_unauthorized(client):
    response = await client.get("/admin/dashboard/summary")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_summary_authorized(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    response = await client.get("/admin/dashboard/summary?range=7d", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["period"] == "7d"
    assert "dau" in data
    assert "revenue" in data
    assert "new_signups" in data
    assert data["dau"]["current"] > 0


@pytest.mark.asyncio
async def test_dashboard_timeseries(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    res_signups = await client.get(
        "/admin/dashboard/timeseries?metric=signups", headers=headers
    )
    assert res_signups.status_code == 200
    data = res_signups.json()
    assert data["metric"] == "signups"
    assert len(data["points"]) == 14

    res_rev = await client.get(
        "/admin/dashboard/timeseries?metric=revenue", headers=headers
    )
    assert res_rev.status_code == 200
    assert res_rev.json()["metric"] == "revenue"


@pytest.mark.asyncio
async def test_dashboard_funnel(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    response = await client.get("/admin/dashboard/funnel?range=7d", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["steps"]) == 4
    assert data["steps"][0]["step"] == "Signed Up"
    assert data["overall_conversion_rate"] >= 0


@pytest.mark.asyncio
async def test_dashboard_top_quizzes(client, super_admin_token):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    res_rev = await client.get(
        "/admin/dashboard/top-quizzes?by=revenue&limit=3", headers=headers
    )
    assert res_rev.status_code == 200
    items = res_rev.json()
    assert isinstance(items, list)

    res_att = await client.get(
        "/admin/dashboard/top-quizzes?by=attempts&limit=3", headers=headers
    )
    assert res_att.status_code == 200
    items_att = res_att.json()
    assert isinstance(items_att, list)


@pytest.mark.asyncio
async def test_dashboard_attention_and_feeds(client, super_admin_token, sample_user):
    headers = {"Authorization": f"Bearer {super_admin_token}"}
    att_res = await client.get("/admin/dashboard/attention", headers=headers)
    assert att_res.status_code == 200
    assert "pending_reviews" in att_res.json()

    purchases_res = await client.get(
        "/admin/dashboard/recent-purchases?limit=5", headers=headers
    )
    assert purchases_res.status_code == 200
    assert len(purchases_res.json()) <= 5

    signups_res = await client.get(
        "/admin/dashboard/recent-signups?limit=5", headers=headers
    )
    assert signups_res.status_code == 200
    assert len(signups_res.json()) <= 5

    audit_res = await client.get(
        "/admin/dashboard/audit-activity?limit=5", headers=headers
    )
    assert audit_res.status_code == 200
    assert isinstance(audit_res.json(), list)

    # Test alias route /recent-audit
    alias_res = await client.get(
        "/admin/dashboard/recent-audit?limit=5", headers=headers
    )
    assert alias_res.status_code == 200
    assert isinstance(alias_res.json(), list)
