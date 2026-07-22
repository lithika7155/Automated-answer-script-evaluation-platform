from dataclasses import dataclass
from typing import Optional, Any
from domain.enums import DSATopic, Difficulty


@dataclass
class Example:
    input: str
    output: str
    explanation: Optional[str] = None


@dataclass
class Hint:
    level: int
    text: str


@dataclass
class AIExplanationCache:
    text: str
    created_at: Optional[Any] = None


@dataclass
class Question:
    id: Optional[str]
    title: str
    description: str
    topic: Optional[DSATopic] = None
    difficulty: Optional[Difficulty] = None
    companies: list[str] | None = None
    tags: list[str] | None = None
    examples: list[Example] | None = None
    hints: list[Hint] | None = None
    ai_explanation_cache: Optional[AIExplanationCache] = None