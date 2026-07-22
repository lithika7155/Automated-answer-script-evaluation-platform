from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies.auth import get_current_active_user
from app.application.dtos.evaluation import (
    EvaluateScriptRequestDTO,
    EvaluationResultResponseDTO,
)
from app.application.use_cases.evaluate_answer_script import EvaluateAnswerScriptUseCase
from app.application.use_cases.get_evaluation_result import GetEvaluationResultUseCase
from app.application.use_cases.list_evaluations import ListEvaluationsUseCase
from app.domain.exceptions.evaluation import (
    EvaluationFailedException,
    EvaluationNotFoundException,
)
from app.domain.interfaces.ai_evaluator import IAIEvaluatorService
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.models.user import User
from app.infrastructure.ai.gemini_evaluator import GeminiAIEvaluator
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_answer_script_repository import (
    MongoAnswerScriptRepository,
)
from app.infrastructure.repositories.mongo_evaluation_repository import (
    MongoEvaluationRepository,
)

router = APIRouter()


def get_ai_evaluator() -> IAIEvaluatorService:
    return GeminiAIEvaluator()


def get_evaluation_repository() -> IEvaluationRepository:
    db = get_mongo_db()
    return MongoEvaluationRepository(db=db)


def get_answer_script_repository() -> IAnswerScriptRepository:
    db = get_mongo_db()
    return MongoAnswerScriptRepository(db=db)


@router.post(
    "/evaluate",
    response_model=EvaluationResultResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Evaluate student answer script against model answer key via AI",
)
async def evaluate_answer_script(
    dto: EvaluateScriptRequestDTO,
    current_user: User = Depends(get_current_active_user),
    ai_evaluator: IAIEvaluatorService = Depends(get_ai_evaluator),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
    script_repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
) -> EvaluationResultResponseDTO:
    use_case = EvaluateAnswerScriptUseCase(
        ai_evaluator=ai_evaluator,
        eval_repository=eval_repo,
        script_repository=script_repo,
    )
    try:
        return await use_case.execute(dto, current_student_id=current_user.id)
    except EvaluationFailedException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.get(
    "/{evaluation_id}",
    response_model=EvaluationResultResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get evaluation result by evaluation ID",
)
async def get_evaluation_by_id(
    evaluation_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> EvaluationResultResponseDTO:
    use_case = GetEvaluationResultUseCase(eval_repository=eval_repo)
    try:
        return await use_case.execute_by_id(evaluation_id)
    except EvaluationNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "/script/{script_id}",
    response_model=EvaluationResultResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get evaluation result by answer script ID",
)
async def get_evaluation_by_script_id(
    script_id: str,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> EvaluationResultResponseDTO:
    use_case = GetEvaluationResultUseCase(eval_repository=eval_repo)
    try:
        return await use_case.execute_by_script_id(script_id)
    except EvaluationNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )


@router.get(
    "",
    response_model=List[EvaluationResultResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List evaluation results with optional filters",
)
async def list_evaluations(
    student_id: Optional[str] = None,
    exam_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    eval_repo: IEvaluationRepository = Depends(get_evaluation_repository),
) -> List[EvaluationResultResponseDTO]:
    use_case = ListEvaluationsUseCase(eval_repository=eval_repo)
    return await use_case.execute(
        student_id=student_id,
        exam_id=exam_id,
        skip=skip,
        limit=limit,
    )
