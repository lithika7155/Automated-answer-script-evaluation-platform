from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class QuestionAnswerItemDTO(BaseModel):
    question_number: str
    question_text: str
    student_answer: str
    model_answer: str
    max_marks: float = Field(..., gt=0)


class EvaluateScriptRequestDTO(BaseModel):
    answer_script_id: str
    exam_id: str
    student_id: Optional[str] = None
    question_answers: List[QuestionAnswerItemDTO]


class QuestionEvaluationDTO(BaseModel):
    question_number: str
    max_marks: float
    marks_obtained: float
    relevance_score: float
    completeness_score: float
    feedback: str
    missing_concepts: List[str]
    incorrect_points: List[str]


class EvaluationResultResponseDTO(BaseModel):
    id: str
    answer_script_id: str
    student_id: str
    exam_id: str
    total_max_marks: float
    total_score: float
    percentage: float
    question_evaluations: List[QuestionEvaluationDTO]
    overall_feedback: str
    evaluated_at: datetime
