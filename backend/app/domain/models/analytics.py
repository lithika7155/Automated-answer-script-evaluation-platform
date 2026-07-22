from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class GradeEnum(str, Enum):
    A_PLUS = "A+"
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class PassFailStatus(str, Enum):
    PASS = "Pass"
    FAIL = "Fail"


class StudentResultSummary(BaseModel):
    evaluation_id: str
    answer_script_id: str
    student_id: str
    exam_id: str
    total_max_marks: float
    total_score: float
    percentage: float
    grade: GradeEnum
    status: PassFailStatus
    evaluated_at: datetime


class QuestionDistributionStats(BaseModel):
    question_number: str
    max_marks: float
    average_marks_obtained: float
    average_relevance: float
    average_completeness: float


class ExamAnalyticsSummary(BaseModel):
    exam_id: str
    total_students_evaluated: int
    highest_score: float
    lowest_score: float
    average_score: float
    average_percentage: float
    pass_count: int
    fail_count: int
    pass_percentage: float
    question_distribution: List[QuestionDistributionStats] = Field(default_factory=list)


class LeaderboardEntry(BaseModel):
    rank: int
    student_id: str
    student_name: Optional[str] = "Student"
    exam_id: str
    total_score: float
    percentage: float
    grade: GradeEnum
    status: PassFailStatus
