from domain.interfaces.question_repository import QuestionRepository
from core.exceptions import QuestionNotFoundError


async def delete_question(slug: str, repo: QuestionRepository) -> dict:
    """Delete a question by slug. Returns confirmation."""
    deleted = await repo.delete(slug)
    if not deleted:
        raise QuestionNotFoundError(slug)
    return {"deleted": True, "slug": slug}
