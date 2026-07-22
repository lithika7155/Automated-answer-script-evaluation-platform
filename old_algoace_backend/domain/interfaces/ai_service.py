from typing import Protocol, runtime_checkable
from domain.entities.question import Question


@runtime_checkable
class AIService(Protocol):
    """Abstract contract for the AI/LLM integration layer."""

    async def explain(self, question: Question) -> str:
        """Return a conceptual explanation of the question."""
        ...

    async def get_hint(self, question: Question, hint_level: int) -> str:
        """
        Return a progressive hint at the requested abstraction level.
        hint_level: 1 = vague nudge, 2 = algorithmic clue, 3 = approach skeleton.
        """
        ...

    async def review_approach(self, question: Question, user_text: str) -> str:
        """Critique a user's described solution approach."""
        ...

    async def recommend_slugs(
        self,
        topic: str,
        difficulty: str,
        exclude_slugs: list[str],
    ) -> list[str]:
        """Return recommended question slugs from the AI (fallback to DB query)."""
        ...

    async def generate_roadmap(self, company: str) -> str:
        """Generate a 4-week interview preparation roadmap for a specific company."""
        ...
