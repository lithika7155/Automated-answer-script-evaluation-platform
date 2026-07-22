from typing import List, Optional
from app.application.dtos.answer_script import AnswerScriptResponseDTO
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository


class ListAnswerScriptsUseCase:
    def __init__(self, repository: IAnswerScriptRepository):
        self.repository = repository

    async def execute(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AnswerScriptResponseDTO]:
        scripts = await self.repository.list_all(
            student_id=student_id,
            exam_id=exam_id,
            skip=skip,
            limit=limit,
        )
        return [
            AnswerScriptResponseDTO(
                id=s.id,
                student_id=s.student_id,
                exam_id=s.exam_id,
                original_filename=s.original_filename,
                file_path=s.file_path,
                content_type=s.content_type,
                file_size_bytes=s.file_size_bytes,
                upload_time=s.upload_time,
                status=s.status,
            )
            for s in scripts
        ]
