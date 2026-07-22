from app.domain.exceptions.answer_script import AnswerScriptNotFoundException
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.file_storage import IFileStorage


class DeleteAnswerScriptUseCase:
    def __init__(
        self,
        repository: IAnswerScriptRepository,
        storage: IFileStorage,
    ):
        self.repository = repository
        self.storage = storage

    async def execute(self, script_id: str) -> bool:
        script = await self.repository.get_by_id(script_id)
        if not script:
            raise AnswerScriptNotFoundException(script_id)

        await self.storage.delete_file(script.file_path)
        return await self.repository.delete(script_id)
