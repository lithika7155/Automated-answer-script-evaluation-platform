from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse, Response

from app.api.dependencies.auth import get_current_active_user, get_user_repository
from app.application.dtos.analytics import (
    ExamAnalyticsDTO,
    LeaderboardEntryDTO,
    OverallPlatformSummaryDTO,
    StudentResultDTO,
)
from app.application.use_cases.export_results import ExportResultsUseCase
from app.application.use_cases.get_exam_analytics import GetExamAnalyticsUseCase
from app.application.use_cases.get_leaderboard import GetLeaderboardUseCase
from app.application.use_cases.get_student_results import GetStudentResultsUseCase
from app.domain.exceptions.evaluation import EvaluationNotFoundException
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_evaluation_repository import (
    MongoEvaluationRepository,
)

router = APIRouter()


def get_evaluation_repository() -> IEvaluationRepository:
    db = get_mongo_db()
    return MongoEvaluationRepository(db=db)


@router.get(
    "/student/{student_id}",
    response_model=List[StudentResultDTO],
    status_code=status.HTTP_200_OK,
    summary="Get all evaluation results, grades, and pass/fail statuses for a student",
)
async def get_student_results(
    student_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> List[StudentResultDTO]:
    use_case = GetStudentResultsUseCase(eval_repository=eval_repo)
    return await use_case.execute(student_id)


@router.get(
    "/exam/{exam_id}",
    response_model=ExamAnalyticsDTO,
    status_code=status.HTTP_200_OK,
    summary="Get exam analytics summary (highest, lowest, average, pass rate, question distribution)",
)
async def get_exam_analytics(
    exam_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> ExamAnalyticsDTO:
    use_case = GetExamAnalyticsUseCase(eval_repository=eval_repo)
    return await use_case.execute_for_exam(exam_id)


@router.get(
    "/summary",
    response_model=OverallPlatformSummaryDTO,
    status_code=status.HTTP_200_OK,
    summary="Get overall platform evaluation result summary",
)
async def get_overall_summary(
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> OverallPlatformSummaryDTO:
    use_case = GetExamAnalyticsUseCase(eval_repository=eval_repo)
    return await use_case.execute_overall_summary()


@router.get(
    "/leaderboard",
    response_model=List[LeaderboardEntryDTO],
    status_code=status.HTTP_200_OK,
    summary="Get student leaderboard ranked by total score (filtered by exam_id)",
)
async def get_leaderboard(
    exam_id: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
    user_repo: IUserRepository = Depends(get_user_repository),
) -> List[LeaderboardEntryDTO]:
    use_case = GetLeaderboardUseCase(
        eval_repository=eval_repo, user_repository=user_repo
    )
    return await use_case.execute(exam_id=exam_id)


@router.get(
    "/export/json/{evaluation_id}",
    summary="Export evaluation result report as a downloadable JSON file",
)
async def export_json(
    evaluation_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
):
    use_case = ExportResultsUseCase(eval_repository=eval_repo)
    try:
        data = await use_case.export_json(evaluation_id)
        headers = {
            "Content-Disposition": f'attachment; filename="evaluation_{evaluation_id}.json"'
        }
        return JSONResponse(content=data, headers=headers)
    except EvaluationNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/export/pdf/{evaluation_id}",
    summary="Export evaluation report as a downloadable PDF document",
)
async def export_pdf(
    evaluation_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
):
    use_case = ExportResultsUseCase(eval_repository=eval_repo)
    try:
        pdf_bytes = await use_case.export_pdf(evaluation_id)
        headers = {
            "Content-Disposition": f'attachment; filename="evaluation_report_{evaluation_id}.pdf"'
        }
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers,
        )
    except EvaluationNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
