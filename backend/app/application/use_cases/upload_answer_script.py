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


from typing import Optional


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
        question_paper_content: Optional[bytes] = None,
        question_paper_filename: Optional[str] = None,
        answer_key_content: Optional[bytes] = None,
        answer_key_filename: Optional[str] = None,
    ) -> AnswerScriptResponseDTO:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise InvalidFileTypeException(filename, settings.ALLOWED_EXTENSIONS)

        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if len(content) > max_bytes:
            raise FileTooLargeException(settings.MAX_UPLOAD_SIZE_MB)

        saved_path = await self.storage.save_file(content, filename)
        stored_filename = os.path.basename(saved_path)

        qp_path = None
        if question_paper_content and question_paper_filename:
            qp_ext = os.path.splitext(question_paper_filename)[1].lower()
            if qp_ext in settings.ALLOWED_EXTENSIONS:
                qp_path = await self.storage.save_file(question_paper_content, question_paper_filename)

        ak_path = None
        if answer_key_content and answer_key_filename:
            ak_ext = os.path.splitext(answer_key_filename)[1].lower()
            if ak_ext in settings.ALLOWED_EXTENSIONS:
                ak_path = await self.storage.save_file(answer_key_content, answer_key_filename)

        script = AnswerScript(
            student_id=student_id,
            exam_id=exam_id,
            original_filename=filename,
            stored_filename=stored_filename,
            file_path=saved_path,
            content_type=content_type,
            file_size_bytes=len(content),
            status=AnswerScriptStatus.UPLOADED,
            question_paper_filename=question_paper_filename if qp_path else None,
            question_paper_path=qp_path,
            answer_key_filename=answer_key_filename if ak_path else None,
            answer_key_path=ak_path,
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
            question_paper_filename=saved_script.question_paper_filename,
            answer_key_filename=saved_script.answer_key_filename,
        )
