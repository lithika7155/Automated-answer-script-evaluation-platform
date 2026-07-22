from domain.entities.question import Question
from domain.interfaces.question_repository import QuestionRepository
from domain.enums import DSATopic, Difficulty


async def get_random_questions(
    count: int,
    difficulty: Difficulty | None,
    topics: list[DSATopic] | None,
    repo: QuestionRepository,
) -> list[Question]:
    """Fetch N random questions, optionally filtered by difficulty and topic."""
    count = max(1, min(count, 20))  # clamp 1–20
    return await repo.get_random(count=count, difficulty=difficulty, topics=topics)
