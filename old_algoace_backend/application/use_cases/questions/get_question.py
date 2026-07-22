from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository
from core.exceptions import QuestionNotFoundError


async def get_question(slug: str, repo: QuestionRepository) -> Question:
    """Fetch a single question by slug and increment its view count."""
    question = await repo.get_by_slug(slug)
    if not question:
        raise QuestionNotFoundError(slug)
    await repo.increment_view_count(slug)
    return question
