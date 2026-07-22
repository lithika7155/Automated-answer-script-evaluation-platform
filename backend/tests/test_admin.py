import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_admin_dashboard_and_security_flow(async_client: AsyncClient):
    admin_reg = {
        "email": "super_admin@example.com",
        "password": "adminsecretpassword123",
        "full_name": "Super Admin",
        "role": "admin",
    }
    await async_client.post("/api/v1/auth/register", json=admin_reg)
    admin_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "super_admin@example.com", "password": "adminsecretpassword123"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    student_reg = {
        "email": "student_managed@example.com",
        "password": "studentpassword123",
        "full_name": "Managed Student",
        "role": "student",
    }
    reg_student_res = await async_client.post("/api/v1/auth/register", json=student_reg)
    assert reg_student_res.status_code == 201
    target_student_id = reg_student_res.json()["id"]

    student_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "student_managed@example.com", "password": "studentpassword123"},
    )
    student_token = student_login.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    forbidden_res = await async_client.get("/api/v1/admin/dashboard", headers=student_headers)
    assert forbidden_res.status_code == 403

    dash_res = await async_client.get("/api/v1/admin/dashboard", headers=admin_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_users"] >= 2
    assert dash_data["total_admins"] >= 1
    assert dash_data["system_status"] == "Healthy"

    deactivate_res = await async_client.patch(
        f"/api/v1/admin/users/{target_student_id}/status",
        json={"is_active": False},
        headers=admin_headers,
    )
    assert deactivate_res.status_code == 200
    assert deactivate_res.json()["is_active"] is False

    inactive_me_res = await async_client.get("/api/v1/auth/me", headers=student_headers)
    assert inactive_me_res.status_code == 400

    reactivate_res = await async_client.patch(
        f"/api/v1/admin/users/{target_student_id}/status",
        json={"is_active": True},
        headers=admin_headers,
    )
    assert reactivate_res.status_code == 200
    assert reactivate_res.json()["is_active"] is True

    not_found_res = await async_client.get(
        "/api/v1/answer-scripts/NON_EXISTENT_ID_9999",
        headers=admin_headers,
    )
    assert not_found_res.status_code == 404
    assert "error" in not_found_res.json() or "detail" in not_found_res.json()
