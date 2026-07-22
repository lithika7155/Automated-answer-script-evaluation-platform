import pytest
import pytest_asyncio
from mongomock_motor import AsyncMongoMockClient

from fastapi.testclient import TestClient

from main import app
from presentation.api.dependencies import get_question_repository, get_user_repository
from infrastructure.repositories.mongo_question_repo import MongoQuestionRepository
from infrastructure.repositories.mongo_user_repo import MongoUserRepository

@pytest_asyncio.fixture(scope="session")
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture
async def mock_db():
    client = AsyncMongoMockClient()
    db = client["test_db"]
    yield db

@pytest.fixture
def client(mock_db):
    def override_get_question_repo():
        return MongoQuestionRepository(mock_db["questions"])
        
    def override_get_user_repo():
        return MongoUserRepository(mock_db["users"])

    app.dependency_overrides[get_question_repository] = override_get_question_repo
    app.dependency_overrides[get_user_repository] = override_get_user_repo
    
    with TestClient(app) as test_client:
        yield test_client
        
    app.dependency_overrides.clear()
