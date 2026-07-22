from fastapi import APIRouter, Depends, Query, Header, status
from typing import Optional

from presentation.schemas.question_schema import (
    QuestionCreateRequest, QuestionUpdateRequest, QuestionResponse
)
from presentation.schemas.common import PaginatedResponse
from presentation.api.dependencies import get_question_repository
import presentation.api.dependencies

from domain.interfaces.question_repository import QuestionRepository
from domain.enums import DSATopic, Difficulty
from application.dto.question_dto import (
    CreateQuestionDTO, UpdateQuestionDTO, ListQuestionsDTO
)
from application.use_cases.questions import (
    create_question, get_question, list_questions, 
    search_questions, update_question, delete_question, random_question
)

router = APIRouter(prefix="/questions", tags=["Questions"])

@router.post("", response_model=QuestionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_question(
    request: QuestionCreateRequest,
    repo: QuestionRepository = Depends(get_question_repository)
):
    dto = CreateQuestionDTO(**request.model_dump())
    question = await create_question.create_question(dto, repo)
    return question

@router.get("", response_model=PaginatedResponse[QuestionResponse])
async def list_all_questions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    topics: list[DSATopic] = Query(default=[]),
    difficulty: Optional[Difficulty] = Query(default=None),
    companies: list[str] = Query(default=[]),
    tags: list[str] = Query(default=[]),
    sort_by: str = Query("frequency_score"),
    repo: QuestionRepository = Depends(get_question_repository)
):
    dto = ListQuestionsDTO(
        topics=topics,
        difficulty=difficulty,
        companies=companies,
        tags=tags,
        sort_by=sort_by,
        page=page,
        limit=limit
    )
    questions, total = await list_questions.list_questions(dto, repo)
    
    return PaginatedResponse(
        items=questions,
        total=total,
        page=page,
        limit=limit,
        has_next=(page * limit) < total
    )

@router.get("/search", response_model=PaginatedResponse[QuestionResponse])
async def search_questions_endpoint(
    q: str = Query(..., min_length=2),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    repo: QuestionRepository = Depends(get_question_repository)
):
    questions, total = await search_questions.search_questions(query=q, page=page, limit=limit, repo=repo)
    return PaginatedResponse(
        items=questions,
        total=total,
        page=page,
        limit=limit,
        has_next=(page * limit) < total
    )

@router.get("/random", response_model=list[QuestionResponse])
async def get_random_questions_endpoint(
    count: int = Query(1, ge=1, le=20),
    difficulty: Optional[Difficulty] = Query(default=None),
    topics: list[DSATopic] = Query(default=[]),
    repo: QuestionRepository = Depends(get_question_repository)
):
    return await random_question.get_random_questions(
        count=count, difficulty=difficulty, topics=topics, repo=repo
    )

@router.get("/{slug}", response_model=QuestionResponse)
async def get_single_question(
    slug: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    repo: QuestionRepository = Depends(get_question_repository),
    user_repo = Depends(presentation.api.dependencies.get_user_repository)
):
    question = await get_question.get_question(slug, repo)
    if x_user_id:
        from application.use_cases.users import user_use_cases
        await user_use_cases.record_user_view(x_user_id, slug, user_repo)
    return question

@router.put("/{slug}", response_model=QuestionResponse)
async def update_existing_question(
    slug: str,
    request: QuestionUpdateRequest,
    repo: QuestionRepository = Depends(get_question_repository)
):
    dto = UpdateQuestionDTO(**request.model_dump(exclude_unset=True))
    return await update_question.update_question(slug, dto, repo)

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_question(
    slug: str,
    repo: QuestionRepository = Depends(get_question_repository)
):
    await delete_question.delete_question(slug, repo)
