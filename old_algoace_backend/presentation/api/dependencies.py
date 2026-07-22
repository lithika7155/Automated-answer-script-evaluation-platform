from core.database import get_collection
from infrastructure.repositories.mongo_question_repo import MongoQuestionRepository
from infrastructure.ai.gemini_service import GeminiService
from domain.interfaces.question_repository import QuestionRepository
from domain.interfaces.ai_service import AIService
from domain.interfaces.user_repository import UserRepository
from infrastructure.repositories.mongo_user_repo import MongoUserRepository

def get_question_repository() -> QuestionRepository:
    collection = get_collection("questions")
    return MongoQuestionRepository(collection)

def get_ai_service() -> AIService:
    return GeminiService()

def get_user_repository() -> UserRepository:
    collection = get_collection("users")
    return MongoUserRepository(collection)
