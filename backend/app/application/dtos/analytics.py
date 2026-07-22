from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.domain.models.analytics import GradeEnum, PassFailStatus


class StudentResultDTO(BaseModel):
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


class QuestionDistributionDTO(BaseModel):
    question_number: str
    max_marks: float
    average_marks_obtained: float
    average_relevance: float
    average_completeness: float


class ExamAnalyticsDTO(BaseModel):
    exam_id: str
    total_students_evaluated: int
    highest_score: float
    lowest_score: float
    average_score: float
    average_percentage: float
    pass_count: int
    fail_count: int
    pass_percentage: float
    question_distribution: List[QuestionDistributionDTO]


class LeaderboardEntryDTO(BaseModel):
    rank: int
    student_id: str
    student_name: Optional[str] = "Student"
    exam_id: str
    total_score: float
    percentage: float
    grade: GradeEnum
    status: PassFailStatus


class OverallPlatformSummaryDTO(BaseModel):
    total_evaluations: int
    total_exams: int
    overall_average_percentage: float
    total_passed: int
    total_failed: int
    overall_pass_rate: float
