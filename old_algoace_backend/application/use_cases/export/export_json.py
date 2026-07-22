import json
from dataclasses import asdict
from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository
from domain.enums import DSATopic, Difficulty, SortField
from application.dto.question_dto import ListQuestionsDTO


def _question_to_dict(q: Question) -> dict:
    """Serialize a Question entity to a JSON-serializable dict."""
    d = {
        "id": q.id,
        "title": q.title,
        "slug": q.slug,
        "description": q.description,
        "difficulty": q.difficulty.value if q.difficulty else None,
        "topics": [t.value for t in q.topics],
        "companies": q.companies,
        "tags": q.tags,
        "constraints": q.constraints,
        "examples": [
            {"input": e.input, "output": e.output, "explanation": e.explanation}
            for e in q.examples
        ],
        "hints": [{"level": h.level, "content": h.content} for h in q.hints],
        "solution_approach": q.solution_approach,
        "python_solution": q.python_solution,
        "java_solution": q.java_solution,
        "frequency_score": q.frequency_score,
        "acceptance_rate": q.acceptance_rate,
        "source_url": q.source_url,
        "is_premium": q.is_premium,
        "view_count": q.view_count,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "updated_at": q.updated_at.isoformat() if q.updated_at else None,
    }
    return d


async def export_questions_json(
    dto: ListQuestionsDTO,
    repo: QuestionRepository,
) -> bytes:
    """
    Export all matched questions as a formatted JSON bytes payload.
    Fetches up to 1000 questions in one shot for export.
    """
    from domain.enums import SortField as SF
    try:
        sort_field = SF(dto.sort_by)
    except ValueError:
        sort_field = SF.FREQUENCY

    questions, _ = await repo.list(
        topics=dto.topics or None,
        difficulty=dto.difficulty,
        companies=dto.companies or None,
        tags=dto.tags or None,
        sort_by=sort_field,
        page=1,
        limit=1000,
    )

    payload = {
        "count": len(questions),
        "questions": [_question_to_dict(q) for q in questions],
    }
    return json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")


async def export_single_question_json(slug: str, repo: QuestionRepository) -> bytes:
    """Export a single question as JSON bytes."""
    from core.exceptions import QuestionNotFoundError
    question = await repo.get_by_slug(slug)
    if not question:
        raise QuestionNotFoundError(slug)
    return json.dumps(_question_to_dict(question), indent=2, ensure_ascii=False).encode("utf-8")

async def export_bulk_questions_json(slugs: list[str], repo: QuestionRepository) -> bytes:
    """Export specifically selected questions as a JSON bytes payload."""
    questions = []
    for slug in slugs:
        q = await repo.get_by_slug(slug)
        if q:
            questions.append(q)
            
    payload = {
        "count": len(questions),
        "questions": [_question_to_dict(q) for q in questions],
    }
    return json.dumps(payload, indent=2, ensure_ascii=False).encode("utf-8")
