from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from app.api.dependencies.auth import get_current_active_user, require_roles
from app.application.dtos.answer_script import AnswerScriptResponseDTO
from app.application.use_cases.delete_answer_script import DeleteAnswerScriptUseCase
from app.application.use_cases.get_answer_script import GetAnswerScriptUseCase
from app.application.use_cases.list_answer_scripts import ListAnswerScriptsUseCase
from app.application.use_cases.upload_answer_script import UploadAnswerScriptUseCase
from app.domain.exceptions.answer_script import (
    AnswerScriptNotFoundException,
    FileTooLargeException,
    InvalidFileTypeException,
)
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.file_storage import IFileStorage
from app.domain.models.user import User, UserRole
from app.infrastructure.database.mongodb import get_mongo_db
from app.infrastructure.repositories.mongo_answer_script_repository import (
    MongoAnswerScriptRepository,
)
from app.infrastructure.storage.local_file_storage import LocalFileStorage

router = APIRouter()


def get_answer_script_repository() -> IAnswerScriptRepository:
    db = get_mongo_db()
    return MongoAnswerScriptRepository(db=db)


def get_file_storage() -> IFileStorage:
    return LocalFileStorage()


@router.post(
    "/upload",
    response_model=AnswerScriptResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a single student answer script (Faculty/Admin)",
)
async def upload_answer_script(
    exam_id: str = Form(...),
    student_id: str = Form(..., description="Student roll number / ID provided by faculty"),
    file: UploadFile = File(...),
    question_paper: Optional[UploadFile] = File(None),
    answer_key: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
    storage: IFileStorage = Depends(get_file_storage),
) -> AnswerScriptResponseDTO:
    content = await file.read()
    qp_content = await question_paper.read() if question_paper else None
    qp_name = question_paper.filename if question_paper else None
    ak_content = await answer_key.read() if answer_key else None
    ak_name = answer_key.filename if answer_key else None

    use_case = UploadAnswerScriptUseCase(repository=repo, storage=storage)
    try:
        return await use_case.execute(
            student_id=student_id,
            exam_id=exam_id,
            filename=file.filename,
            content_type=file.content_type or "application/octet-stream",
            content=content,
            question_paper_content=qp_content,
            question_paper_filename=qp_name,
            answer_key_content=ak_content,
            answer_key_filename=ak_name,
        )
    except (InvalidFileTypeException, FileTooLargeException) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/batch-upload",
    response_model=List[AnswerScriptResponseDTO],
    status_code=status.HTTP_201_CREATED,
    summary="Batch upload multiple student answer scripts for one exam (Faculty/Admin)",
)
async def batch_upload_answer_scripts(
    exam_id: str = Form(...),
    student_ids: str = Form(
        ...,
        description="Comma-separated student IDs matching the order of files uploaded",
    ),
    files: List[UploadFile] = File(...),
    question_paper: Optional[UploadFile] = File(None),
    answer_key: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
    storage: IFileStorage = Depends(get_file_storage),
) -> List[AnswerScriptResponseDTO]:
    sid_list = [s.strip() for s in student_ids.split(",") if s.strip()]
    if len(sid_list) != len(files):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Number of student_ids ({len(sid_list)}) must match number of files ({len(files)}).",
        )

    qp_content = await question_paper.read() if question_paper else None
    qp_name = question_paper.filename if question_paper else None
    ak_content = await answer_key.read() if answer_key else None
    ak_name = answer_key.filename if answer_key else None

    use_case = UploadAnswerScriptUseCase(repository=repo, storage=storage)
    results: List[AnswerScriptResponseDTO] = []

    for file, sid in zip(files, sid_list):
        content = await file.read()
        try:
            result = await use_case.execute(
                student_id=sid,
                exam_id=exam_id,
                filename=file.filename,
                content_type=file.content_type or "application/octet-stream",
                content=content,
                question_paper_content=qp_content,
                question_paper_filename=qp_name,
                answer_key_content=ak_content,
                answer_key_filename=ak_name,
            )
            results.append(result)
        except (InvalidFileTypeException, FileTooLargeException) as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}': {str(e)}",
            )

    return results


@router.get(
    "/{script_id}",
    response_model=AnswerScriptResponseDTO,
    status_code=status.HTTP_200_OK,
    summary="Get answer script details by ID",
)
async def get_answer_script(
    script_id: str,
    current_user: User = Depends(get_current_active_user),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
) -> AnswerScriptResponseDTO:
    use_case = GetAnswerScriptUseCase(repository=repo)
    try:
        return await use_case.execute(script_id)
    except AnswerScriptNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "/{script_id}/download",
    summary="Download uploaded answer script file",
)
async def download_answer_script(
    script_id: str,
    current_user: User = Depends(get_current_active_user),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
):
    use_case = GetAnswerScriptUseCase(repository=repo)
    try:
        script_dto = await use_case.execute(script_id)
        return FileResponse(
            path=script_dto.file_path,
            filename=script_dto.original_filename,
            media_type=script_dto.content_type,
        )
    except AnswerScriptNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get(
    "",
    response_model=List[AnswerScriptResponseDTO],
    status_code=status.HTTP_200_OK,
    summary="List uploaded answer scripts with optional filters",
)
async def list_answer_scripts(
    student_id: Optional[str] = None,
    exam_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
) -> List[AnswerScriptResponseDTO]:
    use_case = ListAnswerScriptsUseCase(repository=repo)
    return await use_case.execute(
        student_id=student_id,
        exam_id=exam_id,
        skip=skip,
        limit=limit,
    )


@router.delete(
    "/{script_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete answer script record and stored file",
)
async def delete_answer_script(
    script_id: str,
    current_user: User = Depends(require_roles([UserRole.FACULTY, UserRole.ADMIN])),
    repo: IAnswerScriptRepository = Depends(get_answer_script_repository),
    storage: IFileStorage = Depends(get_file_storage),
):
    use_case = DeleteAnswerScriptUseCase(repository=repo, storage=storage)
    try:
        await use_case.execute(script_id)
        return {"detail": "Answer script deleted successfully", "id": script_id}
    except AnswerScriptNotFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
