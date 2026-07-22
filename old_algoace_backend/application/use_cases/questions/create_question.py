from datetime import datetime
from slugify import slugify

from application.dto.question_dto import CreateQuestionDTO
from domain.entities.question import Question, Example, Hint, AIExplanationCache
from domain.interfaces.question_repository import QuestionRepository
from core.exceptions import QuestionAlreadyExistsError


async def create_question(dto: CreateQuestionDTO, repo: QuestionRepository) -> Question:
    """Create a new question and persist it."""
    slug = slugify(dto.title)

    # Ensure uniqueness — append timestamp suffix if collision
    base_slug = slug
    counter = 1
    while await repo.slug_exists(slug):
        slug = f"{base_slug}-{counter}"
        counter += 1

    examples = [Example(input=e.input, output=e.output, explanation=e.explanation) for e in dto.examples]
    hints = [Hint(level=h.level, content=h.content) for h in dto.hints]

    question = Question(
        title=dto.title,
        slug=slug,
        description=dto.description,
        difficulty=dto.difficulty,
        topics=dto.topics,
        companies=dto.companies,
        tags=dto.tags,
        constraints=dto.constraints,
        examples=examples,
        hints=hints,
        solution_approach=dto.solution_approach,
        python_solution=dto.python_solution,
        java_solution=dto.java_solution,
        frequency_score=dto.frequency_score,
        acceptance_rate=dto.acceptance_rate,
        source_url=dto.source_url,
        is_premium=dto.is_premium,
        ai_explanation=AIExplanationCache(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    return await repo.create(question)
