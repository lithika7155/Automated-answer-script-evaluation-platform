from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository


async def search_questions(
    query: str,
    page: int,
    limit: int,
    repo: QuestionRepository,
) -> tuple[list[Question], int]:
    """Full-text search over title and description."""
    return await repo.search(query=query, page=page, limit=limit)
