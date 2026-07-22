from application.dto.ai_dto import ReviewApproachDTO
from domain.interfaces.question_repository import QuestionRepository
from domain.interfaces.ai_service import AIService
from core.exceptions import QuestionNotFoundError, AIServiceError


async def review_approach(
    dto: ReviewApproachDTO,
    repo: QuestionRepository,
    ai: AIService,
) -> str:
    """Send a user's approach description to Gemini for structured feedback."""
    question = await repo.get_by_slug(dto.slug)
    if not question:
        raise QuestionNotFoundError(dto.slug)

    if not dto.user_text or len(dto.user_text.strip()) < 10:
        return "Please provide a more detailed description of your approach."

    try:
        feedback = await ai.review_approach(question, dto.user_text)
    except Exception as exc:
        raise AIServiceError(str(exc))

    return feedback
