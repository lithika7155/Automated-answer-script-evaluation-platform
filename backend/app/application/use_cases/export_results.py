import json
from app.domain.exceptions.evaluation import EvaluationNotFoundException
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.services.grading_service import GradingService
from app.infrastructure.reports.pdf_generator import PDFReportGenerator


class ExportResultsUseCase:
    def __init__(self, eval_repository: IEvaluationRepository):
        self.eval_repository = eval_repository

    async def export_json(self, evaluation_id: str) -> dict:
        evaluation = await self.eval_repository.get_by_id(evaluation_id)
        if not evaluation:
            raise EvaluationNotFoundException(evaluation_id)

        grade, status = GradingService.calculate_grade_and_status(evaluation.percentage)
        eval_dict = evaluation.model_dump()
        eval_dict["grade"] = grade.value
        eval_dict["pass_fail_status"] = status.value
        eval_dict["evaluated_at"] = evaluation.evaluated_at.isoformat()
        return eval_dict

    async def export_pdf(self, evaluation_id: str) -> bytes:
        evaluation = await self.eval_repository.get_by_id(evaluation_id)
        if not evaluation:
            raise EvaluationNotFoundException(evaluation_id)

        return PDFReportGenerator.generate_evaluation_pdf(evaluation)
