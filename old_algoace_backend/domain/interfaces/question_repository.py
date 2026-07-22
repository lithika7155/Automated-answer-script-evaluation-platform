from __future__ import annotations

from typing import Optional, Protocol, runtime_checkable

from domain.entities.question import Question
from domain.enums import DSATopic, Difficulty, SortField


@runtime_checkable
class QuestionRepository(Protocol):
    """Abstract contract for the question persistence layer."""

    async def create(self, question: Question) -> Question: ...

    async def get_by_slug(self, slug: str) -> Optional[Question]: ...

    async def list(
        self,
        topics: list[DSATopic] | None,
        difficulty: Difficulty | None,
        companies: list[str] | None,
        tags: list[str] | None,
        sort_by: SortField,
        page: int,
        limit: int,
    ) -> tuple[list[Question], int]: ...

    async def search(
        self,
        query: str,
        page: int,
        limit: int,
    ) -> tuple[list[Question], int]: ...

    async def update(self, slug: str, updates: dict) -> Optional[Question]: ...

    async def delete(self, slug: str) -> bool: ...

    async def get_random(
        self,
        count: int,
        difficulty: Difficulty | None,
        topics: list[DSATopic] | None,
    ) -> list[Question]: ...

    async def get_recommendations(
        self,
        topics: list[DSATopic],
        difficulty: Difficulty | None,
        exclude_slugs: list[str],
        limit: int,
    ) -> list[Question]: ...

    async def update_ai_cache(
        self,
        slug: str,
        cached_text: str,
    ) -> None: ...

    async def increment_view_count(self, slug: str) -> None: ...

    async def slug_exists(self, slug: str) -> bool: ...