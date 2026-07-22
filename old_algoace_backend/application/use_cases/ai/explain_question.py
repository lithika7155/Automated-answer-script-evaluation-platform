from datetime import datetime, timedelta

from application.dto.ai_dto import ExplainDTO
from domain.interfaces.question_repository import QuestionRepository
from domain.interfaces.ai_service import AIService
from core.exceptions import QuestionNotFoundError, AIServiceError
from core.config import get_settings


async def explain_question(
    dto: ExplainDTO,
    repo: QuestionRepository,
    ai: AIService,
) -> str:
    """
    Return an AI explanation for the given question.
    - First checks DB cache (TTL = AI_CACHE_TTL_DAYS).
    - On cache miss, calls Gemini and stores the result.
    """
    question = await repo.get_by_slug(dto.slug)
    if not question:
        raise QuestionNotFoundError(dto.slug)

    settings = get_settings()
    ttl = timedelta(days=settings.ai_cache_ttl_days)

    # Cache hit check
    cache = question.ai_explanation
    if cache.cached_text and cache.generated_at:
        age = datetime.utcnow() - cache.generated_at
        if age < ttl:
            return cache.cached_text

    # Cache miss — call Gemini
    try:
        explanation = await ai.explain(question)
    except Exception as exc:
        raise AIServiceError(str(exc))

    # Persist to DB cache
    await repo.update_ai_cache(dto.slug, explanation)

    return explanation
