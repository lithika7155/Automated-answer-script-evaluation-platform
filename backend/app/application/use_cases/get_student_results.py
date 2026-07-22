from typing import List
from app.application.dtos.analytics import StudentResultDTO
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.services.grading_service import GradingService


class GetStudentResultsUseCase:
    def __init__(self, eval_repository: IEvaluationRepository):
        self.eval_repository = eval_repository

    async def execute(self, student_id: str) -> List[StudentResultDTO]:
        evaluations = await self.eval_repository.list_all(student_id=student_id)
        results = []
        for ev in evaluations:
            grade, status = GradingService.calculate_grade_and_status(ev.percentage)
            results.append(
                StudentResultDTO(
                    evaluation_id=ev.id,
                    answer_script_id=ev.answer_script_id,
                    student_id=ev.student_id,
                    exam_id=ev.exam_id,
                    total_max_marks=ev.total_max_marks,
                    total_score=ev.total_score,
                    percentage=ev.percentage,
                    grade=grade,
                    status=status,
                    evaluated_at=ev.evaluated_at,
                )
            )
        return results
