from typing import List, Optional
from app.application.dtos.evaluation import (
    EvaluationResultResponseDTO,
    QuestionEvaluationDTO,
)
from app.domain.interfaces.evaluation_repository import IEvaluationRepository


class ListEvaluationsUseCase:
    def __init__(self, eval_repository: IEvaluationRepository):
        self.eval_repository = eval_repository

    async def execute(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EvaluationResultResponseDTO]:
        results = await self.eval_repository.list_all(
            student_id=student_id,
            exam_id=exam_id,
            skip=skip,
            limit=limit,
        )
        return [
            EvaluationResultResponseDTO(
                id=res.id,
                answer_script_id=res.answer_script_id,
                student_id=res.student_id,
                exam_id=res.exam_id,
                total_max_marks=res.total_max_marks,
                total_score=res.total_score,
                percentage=res.percentage,
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
                    for q in res.question_evaluations
                ],
                overall_feedback=res.overall_feedback,
                evaluated_at=res.evaluated_at,
            )
            for res in results
        ]
