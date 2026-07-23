import pytest
from httpx import AsyncClient


@pytest.mark.anyio
async def test_ai_evaluation_module_flow(async_client: AsyncClient):
    faculty_reg = {
        "email": "faculty_evaluator@example.com",
        "password": "facultyPassword123",
        "full_name": "Prof. Smith",
        "role": "faculty",
    }
    reg_res = await async_client.post("/api/v1/auth/register", json=faculty_reg)
    assert reg_res.status_code == 201

    login_res = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "faculty_evaluator@example.com", "password": "facultyPassword123"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    pdf_file = ("exam_script.pdf", b"%PDF-1.4 Student Answer Script", "application/pdf")
    upload_res = await async_client.post(
        "/api/v1/answer-scripts/upload",
        data={"exam_id": "CS101_MIDTERM", "student_id": "STU_101"},
        files={"file": pdf_file},
        headers=headers,
    )
    assert upload_res.status_code == 201
    script_id = upload_res.json()["id"]

    eval_payload = {
        "answer_script_id": script_id,
        "exam_id": "CS101_MIDTERM",
        "question_answers": [
            {
                "question_number": "Q1",
                "question_text": "Define Object-Oriented Programming principles.",
                "student_answer": "Object-Oriented Programming uses encapsulation, inheritance, polymorphism, and abstraction to organize code around objects.",
                "model_answer": "Object-Oriented Programming (OOP) is a paradigm based on objects containing data and code. Key principles include Encapsulation, Inheritance, Polymorphism, and Abstraction.",
                "max_marks": 10.0,
            },
            {
                "question_number": "Q2",
                "question_text": "Explain time complexity of Binary Search.",
                "student_answer": "Binary search checks middle element and divides array.",
                "model_answer": "Binary Search operates on a sorted array by repeatedly dividing the search interval in half. The time complexity is O(log n).",
                "max_marks": 5.0,
            },
        ],
    }

    eval_res = await async_client.post(
        "/api/v1/evaluations/evaluate",
        json=eval_payload,
        headers=headers,
    )
    assert eval_res.status_code == 201
    eval_data = eval_res.json()

    assert eval_data["answer_script_id"] == script_id
    assert eval_data["exam_id"] == "CS101_MIDTERM"
    assert eval_data["total_max_marks"] == 15.0
    assert eval_data["total_score"] > 0
    assert eval_data["percentage"] > 0
    assert len(eval_data["question_evaluations"]) == 2
    assert "grade" in eval_data and eval_data["grade"] is not None
    assert "pass_fail_status" in eval_data and eval_data["pass_fail_status"] in ("Pass", "Fail")

    q1_eval = eval_data["question_evaluations"][0]
    assert q1_eval["question_number"] == "Q1"
    assert q1_eval["max_marks"] == 10.0
    assert q1_eval["marks_obtained"] > 0
    assert 0.0 <= q1_eval["relevance_score"] <= 1.0
    assert 0.0 <= q1_eval["completeness_score"] <= 1.0
    assert "feedback" in q1_eval
    assert isinstance(q1_eval["missing_concepts"], list)
    assert isinstance(q1_eval["incorrect_points"], list)

    evaluation_id = eval_data["id"]

    get_res = await async_client.get(
        f"/api/v1/evaluations/{evaluation_id}",
        headers=headers,
    )
    assert get_res.status_code == 200
    assert get_res.json()["id"] == evaluation_id

    get_by_script_res = await async_client.get(
        f"/api/v1/evaluations/script/{script_id}",
        headers=headers,
    )
    assert get_by_script_res.status_code == 200
    assert get_by_script_res.json()["answer_script_id"] == script_id

    list_res = await async_client.get(
        "/api/v1/evaluations?exam_id=CS101_MIDTERM",
        headers=headers,
    )
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    script_check = await async_client.get(
        f"/api/v1/answer-scripts/{script_id}",
        headers=headers,
    )
    assert script_check.status_code == 200
    assert script_check.json()["status"] == "evaluated"
