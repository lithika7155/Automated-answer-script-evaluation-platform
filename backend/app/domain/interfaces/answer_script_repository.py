from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.models.answer_script import AnswerScript


class IAnswerScriptRepository(ABC):
    @abstractmethod
    async def create(self, script: AnswerScript) -> AnswerScript:
        pass

    @abstractmethod
    async def get_by_id(self, script_id: str) -> Optional[AnswerScript]:
        pass

    @abstractmethod
    async def list_all(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AnswerScript]:
        pass

    @abstractmethod
    async def delete(self, script_id: str) -> bool:
        pass
