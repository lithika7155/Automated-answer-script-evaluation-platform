from app.application.dtos.evaluation import (
    EvaluateScriptRequestDTO,
    EvaluationResultResponseDTO,
    QuestionEvaluationDTO,
)
from app.domain.interfaces.ai_evaluator import IAIEvaluatorService
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.models.answer_script import AnswerScriptStatus
from app.domain.models.evaluation import EvaluationResult, QuestionEvaluation


class EvaluateAnswerScriptUseCase:
    def __init__(
        self,
        ai_evaluator: IAIEvaluatorService,
        eval_repository: IEvaluationRepository,
        script_repository: IAnswerScriptRepository,
    ):
        self.ai_evaluator = ai_evaluator
        self.eval_repository = eval_repository
        self.script_repository = script_repository

    async def execute(
        self,
        dto: EvaluateScriptRequestDTO,
        current_student_id: str,
    ) -> EvaluationResultResponseDTO:
        student_id = dto.student_id or current_student_id

        script = await self.script_repository.get_by_id(dto.answer_script_id)
        if script:
            student_id = script.student_id

        question_evaluations = []
        total_max_marks = 0.0
        total_score = 0.0

        for item in dto.question_answers:
            q_eval = await self.ai_evaluator.evaluate_question_answer(
                question_number=item.question_number,
                question_text=item.question_text,
                student_answer=item.student_answer,
                model_answer=item.model_answer,
                max_marks=item.max_marks,
            )
            question_evaluations.append(q_eval)
            total_max_marks += q_eval.max_marks
            total_score += q_eval.marks_obtained

        total_max_marks = round(total_max_marks, 2)
        total_score = round(total_score, 2)
        percentage = (
            round((total_score / total_max_marks) * 100.0, 2)
            if total_max_marks > 0
            else 0.0
        )

        overall_feedback = (
            f"Evaluated {len(question_evaluations)} questions. "
            f"Total Score: {total_score}/{total_max_marks} ({percentage}%)."
        )

        result_entity = EvaluationResult(
            answer_script_id=dto.answer_script_id,
            student_id=student_id,
            exam_id=dto.exam_id,
            total_max_marks=total_max_marks,
            total_score=total_score,
            percentage=percentage,
            question_evaluations=question_evaluations,
            overall_feedback=overall_feedback,
        )

        saved_result = await self.eval_repository.create(result_entity)

        if script:
            script.status = AnswerScriptStatus.EVALUATED
            await self.script_repository.create(script)

        return EvaluationResultResponseDTO(
            id=saved_result.id,
            answer_script_id=saved_result.answer_script_id,
            student_id=saved_result.student_id,
            exam_id=saved_result.exam_id,
            total_max_marks=saved_result.total_max_marks,
            total_score=saved_result.total_score,
            percentage=saved_result.percentage,
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
                for q in saved_result.question_evaluations
            ],
            overall_feedback=saved_result.overall_feedback,
            evaluated_at=saved_result.evaluated_at,
        )
