from application.dto.ai_dto import GetHintDTO
from domain.interfaces.question_repository import QuestionRepository
from domain.interfaces.ai_service import AIService
from core.exceptions import QuestionNotFoundError, InvalidHintLevelError, AIServiceError


async def get_hint(
    dto: GetHintDTO,
    repo: QuestionRepository,
    ai: AIService,
) -> dict:
    """
    Return a progressive hint at the requested level (1, 2, or 3).

    Strategy:
    1. If the question has a static hint for the requested level in DB → return it.
    2. Otherwise, call Gemini to generate a dynamic hint at that level.
    """
    if dto.hint_level not in (1, 2, 3):
        raise InvalidHintLevelError()

    question = await repo.get_by_slug(dto.slug)
    if not question:
        raise QuestionNotFoundError(dto.slug)

    # 1. Look for a static hint in DB
    for hint in question.hints:
        if hint.level == dto.hint_level:
            return {
                "slug": dto.slug,
                "hint_level": dto.hint_level,
                "hint": hint.content,
                "source": "static",
            }

    # 2. Fallback: generate via Gemini
    try:
        hint_text = await ai.get_hint(question, dto.hint_level)
    except Exception as exc:
        raise AIServiceError(str(exc))

    return {
        "slug": dto.slug,
        "hint_level": dto.hint_level,
        "hint": hint_text,
        "source": "ai",
    }
