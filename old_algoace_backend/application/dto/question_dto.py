from dataclasses import dataclass, field
from typing import Optional
from domain.enums import DSATopic, Difficulty


@dataclass
class ExampleDTO:
    input: str
    output: str
    explanation: Optional[str] = None


@dataclass
class HintDTO:
    level: int
    content: str


@dataclass
class CreateQuestionDTO:
    title: str
    description: str
    difficulty: Difficulty
    topics: list[DSATopic]
    companies: list[str]
    tags: list[str]
    constraints: str
    examples: list[ExampleDTO]
    hints: list[HintDTO]
    solution_approach: str
    python_solution: str
    java_solution: str
    frequency_score: float = 0.5
    acceptance_rate: Optional[float] = None
    source_url: Optional[str] = None
    is_premium: bool = False


@dataclass
class UpdateQuestionDTO:
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    topics: Optional[list[DSATopic]] = None
    companies: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    constraints: Optional[str] = None
    examples: Optional[list[ExampleDTO]] = None
    hints: Optional[list[HintDTO]] = None
    solution_approach: Optional[str] = None
    python_solution: Optional[str] = None
    java_solution: Optional[str] = None
    frequency_score: Optional[float] = None
    acceptance_rate: Optional[float] = None
    source_url: Optional[str] = None
    is_premium: Optional[bool] = None


@dataclass
class ListQuestionsDTO:
    topics: list[DSATopic] = field(default_factory=list)
    difficulty: Optional[Difficulty] = None
    companies: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    sort_by: str = "frequency_score"
    page: int = 1
    limit: int = 20
