from datetime import datetime
from slugify import slugify

from application.dto.question_dto import UpdateQuestionDTO
from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository
from core.exceptions import QuestionNotFoundError


async def update_question(
    slug: str, dto: UpdateQuestionDTO, repo: QuestionRepository
) -> Question:
    """Apply partial updates to a question."""
    existing = await repo.get_by_slug(slug)
    if not existing:
        raise QuestionNotFoundError(slug)

    updates: dict = {"updated_at": datetime.utcnow()}

    for field_name in [
        "title", "description", "difficulty", "topics", "companies",
        "tags", "constraints", "solution_approach", "python_solution",
        "java_solution", "frequency_score", "acceptance_rate",
        "source_url", "is_premium",
    ]:
        val = getattr(dto, field_name)
        if val is not None:
            updates[field_name] = val

    if dto.examples is not None:
        updates["examples"] = [
            {"input": e.input, "output": e.output, "explanation": e.explanation}
            for e in dto.examples
        ]

    if dto.hints is not None:
        updates["hints"] = [
            {"level": h.level, "content": h.content}
            for h in dto.hints
        ]

    updated = await repo.update(slug, updates)
    if not updated:
        raise QuestionNotFoundError(slug)
    return updated
