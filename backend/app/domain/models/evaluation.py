from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class QuestionEvaluation(BaseModel):
    question_number: str
    max_marks: float
    marks_obtained: float
    relevance_score: float = Field(..., ge=0.0, le=1.0)
    completeness_score: float = Field(..., ge=0.0, le=1.0)
    feedback: str
    missing_concepts: List[str] = Field(default_factory=list)
    incorrect_points: List[str] = Field(default_factory=list)


class EvaluationResult(BaseModel):
    id: Optional[str] = None
    answer_script_id: str
    student_id: str
    exam_id: str
    total_max_marks: float
    total_score: float
    percentage: float
    question_evaluations: List[QuestionEvaluation]
    overall_feedback: str
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
