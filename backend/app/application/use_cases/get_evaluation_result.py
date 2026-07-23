from app.application.dtos.evaluation import (
    EvaluationResultResponseDTO,
    QuestionEvaluationDTO,
)
from app.domain.exceptions.evaluation import EvaluationNotFoundException
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.services.grading_service import GradingService


class GetEvaluationResultUseCase:
    def __init__(self, eval_repository: IEvaluationRepository):
        self.eval_repository = eval_repository

    async def execute_by_id(self, evaluation_id: str) -> EvaluationResultResponseDTO:
        result = await self.eval_repository.get_by_id(evaluation_id)
        if not result:
            raise EvaluationNotFoundException(evaluation_id)
        return self._map_to_dto(result)

    async def execute_by_script_id(self, script_id: str) -> EvaluationResultResponseDTO:
        result = await self.eval_repository.get_by_script_id(script_id)
        if not result:
            raise EvaluationNotFoundException(f"for script '{script_id}'")
        return self._map_to_dto(result)

    def _map_to_dto(self, result) -> EvaluationResultResponseDTO:
        grade, status = GradingService.calculate_grade_and_status(result.percentage)
        return EvaluationResultResponseDTO(
            id=result.id,
            answer_script_id=result.answer_script_id,
            student_id=result.student_id,
            exam_id=result.exam_id,
            total_max_marks=result.total_max_marks,
            total_score=result.total_score,
            percentage=result.percentage,
            grade=grade.value,
            pass_fail_status=status.value,
            question_evaluations=[
                QuestionEvaluationDTO(
                    question_number=q.question_number,
                    max_marks=q.max_marks,
                    marks_obtained=q.marks_obtained,
                    relevance_score=q.relevance_score,
                    completeness_score=q.completeness_score,
                    feedback=q.feedback,
                    missing_concepts=q.missing_concepts,
                    incorrect_points=q.incorrect_points,
                )
                for q in result.question_evaluations
            ],
            overall_feedback=result.overall_feedback,
            evaluated_at=result.evaluated_at,
        )
