import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_answer_script_lifecycle(async_client: AsyncClient):
    user_reg = {
        "email": "student_upload@example.com",
        "password": "password123",
        "full_name": "Upload Student",
        "role": "student",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=user_reg)
    assert reg_res.status_code == 201

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "student_upload@example.com", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    invalid_file = ("script.txt", b"text content", "text/plain")
    res_invalid = await async_client.post(
        "/api/v1/answer-scripts/upload",
        data={"exam_id": "EXAM_101"},
        files={"file": invalid_file},
        headers=headers,
    )
    assert res_invalid.status_code == 400
    assert "invalid extension" in res_invalid.json()["detail"].lower()

    pdf_content = b"%PDF-1.4 sample answer script content for automated evaluation"
    valid_pdf = ("student_submission.pdf", pdf_content, "application/pdf")
    upload_res = await async_client.post(
        "/api/v1/answer-scripts/upload",
        data={"exam_id": "EXAM_101"},
        files={"file": valid_pdf},
        headers=headers,
    )
    assert upload_res.status_code == 201
    upload_data = upload_res.json()
    assert upload_data["original_filename"] == "student_submission.pdf"
    assert upload_data["exam_id"] == "EXAM_101"
    assert upload_data["status"] == "uploaded"
    script_id = upload_data["id"]

    png_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR dummy image bytes"
    valid_png = ("answer_page1.png", png_content, "image/png")
    upload_png_res = await async_client.post(
        "/api/v1/answer-scripts/upload",
        data={"exam_id": "EXAM_101"},
        files={"file": valid_png},
        headers=headers,
    )
    assert upload_png_res.status_code == 201

    get_res = await async_client.get(
        f"/api/v1/answer-scripts/{script_id}",
        headers=headers,
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == script_id

    download_res = await async_client.get(
        f"/api/v1/answer-scripts/{script_id}/download",
        headers=headers,
    )
    assert download_res.status_code == 200
    assert download_res.content == pdf_content

    list_res = await async_client.get(
        "/api/v1/answer-scripts?exam_id=EXAM_101",
        headers=headers,
    )
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 2

    delete_res = await async_client.delete(
        f"/api/v1/answer-scripts/{script_id}",
        headers=headers,
    )
    assert delete_res.status_code == 200

    get_after_delete = await async_client.get(
        f"/api/v1/answer-scripts/{script_id}",
        headers=headers,
    )
    assert get_after_delete.status_code == 404
