from application.dto.ai_dto import RecommendDTO
from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository


async def recommend_questions(
    dto: RecommendDTO,
    repo: QuestionRepository,
) -> list[Question]:
    """
    Recommend questions based on shared topics and similar difficulty.

    Pure MongoDB aggregation pipeline — no LLM call needed:
    1. Match questions that share at least one topic.
    2. Optionally filter by difficulty.
    3. Exclude already-seen slugs.
    4. Sort by frequency_score descending.
    5. Return top N.
    """
    return await repo.get_recommendations(
        topics=dto.topics,
        difficulty=dto.difficulty,
        exclude_slugs=dto.exclude_slugs,
        limit=dto.limit,
        tags=dto.tags,
        companies=dto.companies,
    )
