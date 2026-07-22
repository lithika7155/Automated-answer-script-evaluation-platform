import pytest

def test_create_question(client):
    payload = {
        "title": "Two Sum",
        "description": "Given an array of integers...",
        "difficulty": "easy",
        "topics": ["arrays", "two_pointers"],
        "companies": ["Amazon"],
        "tags": ["math"],
        "constraints": "none",
        "examples": [],
        "hints": [],
        "solution_approach": "Hash map",
        "python_solution": "def ...",
        "java_solution": "class ...",
        "frequency_score": 0.9,
        "is_premium": False
    }
    
    response = client.post("/api/v1/questions", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["slug"] == "two-sum"
    assert data["difficulty"] == "easy"
    assert "id" in data

def test_get_question(client):
    # First create
    payload = {
        "title": "Reverse List",
        "description": "reverse it",
        "difficulty": "easy",
        "topics": ["linked_lists"]
    }
    client.post("/api/v1/questions", json=payload)
    
    # Then get
    response = client.get("/api/v1/questions/reverse-list")
    assert response.status_code == 200
    assert response.json()["title"] == "Reverse List"

def test_get_question_not_found(client):
    response = client.get("/api/v1/questions/non-existent-slug")
    assert response.status_code == 404

def test_user_history_recording(client):
    # Create question
    client.post("/api/v1/questions", json={
        "title": "Graph Valid Tree",
        "description": "check if graph is tree",
        "difficulty": "medium",
        "topics": ["graphs"]
    })
    
    # View with user ID
    headers = {"X-User-ID": "test-user-123"}
    client.get("/api/v1/questions/graph-valid-tree", headers=headers)
    
    # Check history
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "test-user-123"
    assert "graph-valid-tree" in data["recently_viewed"]
    
def test_toggle_bookmark(client):
    headers = {"X-User-ID": "user-456"}
    
    # Toggle on
    res = client.post("/api/v1/users/bookmarks/two-sum", headers=headers)
    assert res.status_code == 200
    assert "two-sum" in res.json()["bookmarks"]
    
    # Toggle off
    res = client.post("/api/v1/users/bookmarks/two-sum", headers=headers)
    assert res.status_code == 200
    assert "two-sum" not in res.json()["bookmarks"]
