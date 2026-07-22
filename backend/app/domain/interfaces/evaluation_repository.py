from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.models.evaluation import EvaluationResult


class IEvaluationRepository(ABC):
    @abstractmethod
    async def create(self, evaluation: EvaluationResult) -> EvaluationResult:
        pass

    @abstractmethod
    async def get_by_id(self, evaluation_id: str) -> Optional[EvaluationResult]:
        pass

    @abstractmethod
    async def get_by_script_id(self, script_id: str) -> Optional[EvaluationResult]:
        pass

    @abstractmethod
    async def list_all(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EvaluationResult]:
        pass
