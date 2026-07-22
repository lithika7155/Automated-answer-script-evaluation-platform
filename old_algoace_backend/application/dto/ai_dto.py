from dataclasses import dataclass
from typing import Optional
from domain.enums import DSATopic, Difficulty


@dataclass
class ExplainDTO:
    slug: str


@dataclass
class GetHintDTO:
    slug: str
    hint_level: int  # 1, 2, or 3


@dataclass
class ReviewApproachDTO:
    slug: str
    user_text: str


@dataclass
class RecommendDTO:
    topics: list[DSATopic]
    difficulty: Optional[Difficulty] = None
    exclude_slugs: list[str] = None
    tags: list[str] = None
    companies: list[str] = None
    limit: int = 10

    def __post_init__(self):
        if self.exclude_slugs is None:
            self.exclude_slugs = []
        if self.tags is None:
            self.tags = []
        if self.companies is None:
            self.companies = []
