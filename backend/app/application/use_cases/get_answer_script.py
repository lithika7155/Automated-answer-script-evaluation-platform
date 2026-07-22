from app.application.dtos.answer_script import AnswerScriptResponseDTO
from app.domain.exceptions.answer_script import AnswerScriptNotFoundException
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository


class GetAnswerScriptUseCase:
    def __init__(self, repository: IAnswerScriptRepository):
        self.repository = repository

    async def execute(self, script_id: str) -> AnswerScriptResponseDTO:
        script = await self.repository.get_by_id(script_id)
        if not script:
            raise AnswerScriptNotFoundException(script_id)

        return AnswerScriptResponseDTO(
            id=script.id,
            student_id=script.student_id,
            exam_id=script.exam_id,
            original_filename=script.original_filename,
            file_path=script.file_path,
            content_type=script.content_type,
            file_size_bytes=script.file_size_bytes,
            upload_time=script.upload_time,
            status=script.status,
        )
