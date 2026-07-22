from fastapi import APIRouter, Depends, Query, Response, Header
from typing import Optional

from presentation.api.dependencies import get_question_repository
import presentation.api.dependencies
from domain.interfaces.question_repository import QuestionRepository
from domain.enums import DSATopic, Difficulty
from application.dto.question_dto import ListQuestionsDTO
from application.use_cases.export import export_json

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/json", response_class=Response)
async def export_filtered_questions_json(
    topics: list[DSATopic] = Query(default=[]),
    difficulty: Optional[Difficulty] = Query(default=None),
    companies: list[str] = Query(default=[]),
    tags: list[str] = Query(default=[]),
    repo: QuestionRepository = Depends(get_question_repository)
):
    """Export questions matching filters as a JSON file download."""
    dto = ListQuestionsDTO(
        topics=topics,
        difficulty=difficulty,
        companies=companies,
        tags=tags,
        sort_by="frequency_score",
        page=1,
        limit=1000 # Max export size
    )
    
    json_bytes = await export_json.export_questions_json(dto, repo)
    
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=questions_export.json"}
    )

@router.get("/json/{slug}", response_class=Response)
async def export_single_question_json(
    slug: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    repo: QuestionRepository = Depends(get_question_repository),
    user_repo = Depends(presentation.api.dependencies.get_user_repository)
):
    """Export a single question as a JSON file download."""
    json_bytes = await export_json.export_single_question_json(slug, repo)
    
    if x_user_id:
        from application.use_cases.users import user_use_cases
        await user_use_cases.record_user_download(x_user_id, [slug], user_repo)
    
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=question_{slug}.json"}
    )

from pydantic import BaseModel
class BulkExportRequest(BaseModel):
    slugs: list[str]

@router.post("/json/bulk", response_class=Response)
async def export_bulk_questions_json(
    request: BulkExportRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    repo: QuestionRepository = Depends(get_question_repository),
    user_repo = Depends(presentation.api.dependencies.get_user_repository)
):
    """Export specifically selected questions as a JSON file download."""
    json_bytes = await export_json.export_bulk_questions_json(request.slugs, repo)
    
    if x_user_id:
        from application.use_cases.users import user_use_cases
        await user_use_cases.record_user_download(x_user_id, request.slugs, user_repo)
    
    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={"Content-Disposition": "attachment; filename=questions_bulk_export.json"}
    )
