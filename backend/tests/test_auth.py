import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_user_registration_and_login_flow(async_client: AsyncClient):
    register_payload = {
        "email": "student@example.com",
        "password": "studentpassword123",
        "full_name": "Test Student",
        "role": "student",
    }
    register_res = await async_client.post("/api/v1/auth/register", json=register_payload)
    assert register_res.status_code == 201
    reg_data = register_res.json()
    assert reg_data["email"] == "student@example.com"
    assert reg_data["role"] == "student"
    assert "id" in reg_data

    login_payload = {
        "email": "student@example.com",
        "password": "studentpassword123",
    }
    login_res = await async_client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    me_res = await async_client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "student@example.com"
    assert me_data["full_name"] == "Test Student"


@pytest.mark.anyio
async def test_role_based_access_control(async_client: AsyncClient):
    admin_reg = {
        "email": "admin@example.com",
        "password": "adminsecretpassword",
        "full_name": "System Admin",
        "role": "admin",
    }
    res_admin = await async_client.post("/api/v1/auth/register", json=admin_reg)
    assert res_admin.status_code == 201

    res_admin_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "admin@example.com", "password": "adminsecretpassword"},
    )
    admin_token = res_admin_login.json()["access_token"]

    student_reg = {
        "email": "student2@example.com",
        "password": "student2password",
        "full_name": "Second Student",
        "role": "student",
    }
    res_student = await async_client.post("/api/v1/auth/register", json=student_reg)
    assert res_student.status_code == 201

    res_student_login = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "student2@example.com", "password": "student2password"},
    )
    student_token = res_student_login.json()["access_token"]

    forbidden_res = await async_client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {student_token}"},
    )
    assert forbidden_res.status_code == 403

    admin_access_res = await async_client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert admin_access_res.status_code == 200
    users_list = admin_access_res.json()
    assert len(users_list) >= 2
