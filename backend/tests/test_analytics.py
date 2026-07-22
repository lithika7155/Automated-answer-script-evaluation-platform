import pytest
from httpx import AsyncClient
from app.domain.models.analytics import GradeEnum, PassFailStatus
from app.domain.services.grading_service import GradingService


def test_grading_service_rules():
    assert GradingService.calculate_grade_and_status(95.0) == (GradeEnum.A_PLUS, PassFailStatus.PASS)
    assert GradingService.calculate_grade_and_status(85.0) == (GradeEnum.A, PassFailStatus.PASS)
    assert GradingService.calculate_grade_and_status(75.0) == (GradeEnum.B, PassFailStatus.PASS)
    assert GradingService.calculate_grade_and_status(65.0) == (GradeEnum.C, PassFailStatus.PASS)
    assert GradingService.calculate_grade_and_status(55.0) == (GradeEnum.D, PassFailStatus.PASS)
    assert GradingService.calculate_grade_and_status(42.0) == (GradeEnum.F, PassFailStatus.FAIL)


@pytest.mark.anyio
async def test_results_and_analytics_flow(async_client: AsyncClient):
    faculty_reg = {
        "email": "faculty_analytics@example.com",
        "password": "facultyPassword123",
        "full_name": "Prof. Analytics",
        "role": "faculty",
    }
    await async_client.post("/api/v1/auth/register", json=faculty_reg)
    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "faculty_analytics@example.com", "password": "facultyPassword123"},
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    eval_1 = {
        "answer_script_id": "SCRIPT_101",
        "exam_id": "MATH_202",
        "student_id": "STUDENT_A",
        "question_answers": [
            {
                "question_number": "Q1",
                "question_text": "Solve differential equation.",
                "student_answer": "dy/dx = y => y = c * e^x solution.",
                "model_answer": "The solution to dy/dx = y is y = C * e^x.",
                "max_marks": 20.0,
            }
        ],
    }
    eval_2 = {
        "answer_script_id": "SCRIPT_102",
        "exam_id": "MATH_202",
        "student_id": "STUDENT_B",
        "question_answers": [
            {
                "question_number": "Q1",
                "question_text": "Solve differential equation.",
                "student_answer": "dy/dx = x",
                "model_answer": "The solution to dy/dx = y is y = C * e^x.",
                "max_marks": 20.0,
            }
        ],
    }

    res_1 = await async_client.post("/api/v1/evaluations/evaluate", json=eval_1, headers=headers)
    assert res_1.status_code == 201
    eval_id_1 = res_1.json()["id"]

    res_2 = await async_client.post("/api/v1/evaluations/evaluate", json=eval_2, headers=headers)
    assert res_2.status_code == 201

    student_res = await async_client.get("/api/v1/analytics/student/STUDENT_A", headers=headers)
    assert student_res.status_code == 200
    student_data = student_res.json()
    assert len(student_data) >= 1
    assert "grade" in student_data[0]
    assert "status" in student_data[0]

    exam_res = await async_client.get("/api/v1/analytics/exam/MATH_202", headers=headers)
    assert exam_res.status_code == 200
    exam_data = exam_res.json()
    assert exam_data["exam_id"] == "MATH_202"
    assert exam_data["total_students_evaluated"] >= 2
    assert exam_data["highest_score"] >= exam_data["lowest_score"]
    assert "question_distribution" in exam_data
    assert len(exam_data["question_distribution"]) >= 1

    summary_res = await async_client.get("/api/v1/analytics/summary", headers=headers)
    assert summary_res.status_code == 200
    assert summary_res.json()["total_evaluations"] >= 2

    leaderboard_res = await async_client.get("/api/v1/analytics/leaderboard?exam_id=MATH_202", headers=headers)
    assert leaderboard_res.status_code == 200
    lb_items = leaderboard_res.json()
    assert len(lb_items) >= 2
    assert lb_items[0]["rank"] == 1
    assert lb_items[0]["total_score"] >= lb_items[1]["total_score"]

    json_exp_res = await async_client.get(f"/api/v1/analytics/export/json/{eval_id_1}", headers=headers)
    assert json_exp_res.status_code == 200
    assert json_exp_res.headers["content-type"].startswith("application/json")
    assert json_exp_res.json()["id"] == eval_id_1

    pdf_exp_res = await async_client.get(f"/api/v1/analytics/export/pdf/{eval_id_1}", headers=headers)
    assert pdf_exp_res.status_code == 200
    assert pdf_exp_res.headers["content-type"] == "application/pdf"
    assert len(pdf_exp_res.content) > 100
    assert pdf_exp_res.content.startswith(b"%PDF")
