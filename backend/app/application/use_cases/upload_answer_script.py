import os
from app.application.dtos.answer_script import AnswerScriptResponseDTO
from app.core.config import settings
from app.domain.exceptions.answer_script import (
    FileTooLargeException,
    InvalidFileTypeException,
)
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.file_storage import IFileStorage
from app.domain.models.answer_script import AnswerScript, AnswerScriptStatus


class UploadAnswerScriptUseCase:
    def __init__(
        self,
        repository: IAnswerScriptRepository,
        storage: IFileStorage,
    ):
        self.repository = repository
        self.storage = storage

    async def execute(
        self,
        student_id: str,
        exam_id: str,
        filename: str,
        content_type: str,
        content: bytes,
    ) -> AnswerScriptResponseDTO:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise InvalidFileTypeException(filename, settings.ALLOWED_EXTENSIONS)

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise FileTooLargeException(settings.MAX_UPLOAD_SIZE_MB)

        saved_path = await self.storage.save_file(content, filename)
        stored_filename = os.path.basename(saved_path)

        script = AnswerScript(
            student_id=student_id,
            exam_id=exam_id,
            original_filename=filename,
            stored_filename=stored_filename,
            file_path=saved_path,
            content_type=content_type,
            file_size_bytes=len(content),
            status=AnswerScriptStatus.UPLOADED,
        )

        saved_script = await self.repository.create(script)

        return AnswerScriptResponseDTO(
            id=saved_script.id,
            student_id=saved_script.student_id,
            exam_id=saved_script.exam_id,
            original_filename=saved_script.original_filename,
            file_path=saved_script.file_path,
            content_type=saved_script.content_type,
            file_size_bytes=saved_script.file_size_bytes,
            upload_time=saved_script.upload_time,
            status=saved_script.status,
        )
