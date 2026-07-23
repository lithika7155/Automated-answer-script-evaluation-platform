import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_multiple_account_registrations_and_logins(async_client: AsyncClient):
    # Create 3 distinct accounts (Student, Faculty, Admin)
    accounts = [
        {"email": "user1@example.com", "password": "Password123!", "full_name": "User One", "role": "student"},
        {"email": "user2@example.com", "password": "Password123!", "full_name": "User Two", "role": "faculty"},
        {"email": "user3@example.com", "password": "Password123!", "full_name": "User Three", "role": "admin"},
    ]

    tokens = []

    # Step 1: Register all accounts
    for acc in accounts:
        reg_res = await async_client.post("/api/v1/auth/register", json=acc)
        assert reg_res.status_code == 201, f"Failed registering {acc['email']}: {reg_res.text}"

    # Step 2: Login each account and get JWT token
    for acc in accounts:
        login_res = await async_client.post(
            "/api/v1/auth/login",
            json={"email": acc["email"], "password": acc["password"]}
        )
        assert login_res.status_code == 200, f"Failed login for {acc['email']}: {login_res.text}"
        data = login_res.json()
        assert "access_token" in data
        tokens.append(data["access_token"])

    # Step 3: Verify each token resolves to the correct user account via /me endpoint
    for i, token in enumerate(tokens):
        me_res = await async_client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_res.status_code == 200, f"Failed /me check for account {i}: {me_res.text}"
        me_data = me_res.json()
        assert me_data["email"] == accounts[i]["email"]
        assert me_data["full_name"] == accounts[i]["full_name"]
        assert me_data["role"] == accounts[i]["role"]

@pytest.mark.anyio
async def test_case_insensitive_email_login(async_client: AsyncClient):
    reg_payload = {
        "email": "MultiCase@Example.com",
        "password": "Password123!",
        "full_name": "Case Test User",
        "role": "student"
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201

    # Attempt login with lowercase email
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "multicase@example.com", "password": "Password123!"}
    )
    assert login_res.status_code == 200, f"Case-insensitive login failed: {login_res.text}"
