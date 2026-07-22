from fastapi import APIRouter, Depends, Query, Request
from typing import Optional

from presentation.schemas.ai_schema import (
    ReviewApproachRequest, ReviewApproachResponse, HintResponse,
    ExplainResponse, RecommendResponse, RoadmapResponse
)
from presentation.api.dependencies import get_question_repository, get_ai_service

from domain.interfaces.question_repository import QuestionRepository
from domain.interfaces.ai_service import AIService
from domain.enums import DSATopic, Difficulty
from application.dto.ai_dto import (
    ExplainDTO, GetHintDTO, ReviewApproachDTO, RecommendDTO
)
from application.use_cases.ai import (
    explain_question, get_hint, recommend_questions, review_approach, generate_roadmap
)
from core.rate_limiter import limiter
from core.config import get_settings

settings = get_settings()
router = APIRouter(prefix="/ai", tags=["AI Features"])

@router.get("/explain/{slug}", response_model=ExplainResponse)
@limiter.limit(settings.ai_rate_limit)
async def get_explanation(
    request: Request,
    slug: str,
    repo: QuestionRepository = Depends(get_question_repository),
    ai: AIService = Depends(get_ai_service)
):
    dto = ExplainDTO(slug=slug)
    explanation = await explain_question.explain_question(dto, repo, ai)
    return ExplainResponse(slug=slug, explanation_markdown=explanation)

@router.get("/hint/{slug}", response_model=HintResponse)
@limiter.limit(settings.ai_rate_limit)
async def get_progressive_hint(
    request: Request,
    slug: str,
    level: int = Query(..., ge=1, le=3, description="1=Nudge, 2=Clue, 3=Skeleton"),
    repo: QuestionRepository = Depends(get_question_repository),
    ai: AIService = Depends(get_ai_service)
):
    dto = GetHintDTO(slug=slug, hint_level=level)
    result = await get_hint.get_hint(dto, repo, ai)
    return HintResponse(**result)

@router.post("/review/{slug}", response_model=ReviewApproachResponse)
@limiter.limit(settings.ai_rate_limit)
async def review_user_approach(
    request: Request,
    slug: str,
    body: ReviewApproachRequest,
    repo: QuestionRepository = Depends(get_question_repository),
    ai: AIService = Depends(get_ai_service)
):
    dto = ReviewApproachDTO(slug=slug, user_text=body.user_text)
    feedback = await review_approach.review_approach(dto, repo, ai)
    return ReviewApproachResponse(slug=slug, feedback_markdown=feedback)

@router.get("/recommend", response_model=RecommendResponse)
@limiter.limit(settings.ai_rate_limit)
async def recommend_similar_questions(
    request: Request,
    topics: list[DSATopic] = Query(default=[], description="Topics the user wants to practice"),
    tags: list[str] = Query(default=[], description="Tags to match"),
    companies: list[str] = Query(default=[], description="Companies to match"),
    difficulty: Optional[Difficulty] = Query(default=None),
    exclude: list[str] = Query(default=[], description="Slugs of questions already solved"),
    limit: int = Query(10, ge=1, le=20),
    repo: QuestionRepository = Depends(get_question_repository)
):
    dto = RecommendDTO(
        topics=topics,
        difficulty=difficulty,
        exclude_slugs=exclude,
        tags=tags,
        companies=companies,
        limit=limit
    )
    questions = await recommend_questions.recommend_questions(dto, repo)
    return RecommendResponse(recommended_slugs=[q.slug for q in questions])

@router.get("/roadmap", response_model=RoadmapResponse)
@limiter.limit(settings.ai_rate_limit)
async def get_company_roadmap(
    request: Request,
    company: str = Query(..., min_length=2, description="Target company (e.g., Google, Amazon)"),
    ai: AIService = Depends(get_ai_service)
):
    roadmap = await generate_roadmap.generate_company_roadmap(company, ai)
    return RoadmapResponse(company=company, roadmap_markdown=roadmap)
