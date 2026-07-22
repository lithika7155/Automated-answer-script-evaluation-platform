from application.dto.question_dto import ListQuestionsDTO
from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository
from domain.enums import SortField


async def list_questions(
    dto: ListQuestionsDTO, repo: QuestionRepository
) -> tuple[list[Question], int]:
    """Return a paginated, filtered, sorted list of questions and total count."""
    try:
        sort_field = SortField(dto.sort_by)
    except ValueError:
        sort_field = SortField.FREQUENCY

    return await repo.list(
        topics=dto.topics or None,
        difficulty=dto.difficulty,
        companies=dto.companies or None,
        tags=dto.tags or None,
        sort_by=sort_field,
        page=dto.page,
        limit=dto.limit,
    )
