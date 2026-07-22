from pydantic import BaseModel, Field
from typing import Optional
from domain.enums import DSATopic, Difficulty

class ExampleSchema(BaseModel):
    input: str
    output: str
    explanation: Optional[str] = None

class HintSchema(BaseModel):
    level: int = Field(ge=1, le=3)
    content: str

class QuestionCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    difficulty: Difficulty
    topics: list[DSATopic]
    companies: list[str] = []
    tags: list[str] = []
    constraints: str = ""
    examples: list[ExampleSchema] = []
    hints: list[HintSchema] = []
    solution_approach: str = ""
    python_solution: str = ""
    java_solution: str = ""
    frequency_score: float = Field(0.5, ge=0.0, le=1.0)
    acceptance_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    source_url: Optional[str] = None
    is_premium: bool = False

class QuestionUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = Field(None, min_length=10)
    difficulty: Optional[Difficulty] = None
    topics: Optional[list[DSATopic]] = None
    companies: Optional[list[str]] = None
    tags: Optional[list[str]] = None
    constraints: Optional[str] = None
    examples: Optional[list[ExampleSchema]] = None
    hints: Optional[list[HintSchema]] = None
    solution_approach: Optional[str] = None
    python_solution: Optional[str] = None
    java_solution: Optional[str] = None
    frequency_score: Optional[float] = Field(None, ge=0.0, le=1.0)
    acceptance_rate: Optional[float] = Field(None, ge=0.0, le=100.0)
    source_url: Optional[str] = None
    is_premium: Optional[bool] = None

class QuestionResponse(QuestionCreateRequest):
    id: str
    slug: str
    view_count: int
    created_at: str
    updated_at: str

    model_config = {
        "from_attributes": True
    }
