from abc import ABC, abstractmethod
from app.domain.models.evaluation import QuestionEvaluation


class IAIEvaluatorService(ABC):
    @abstractmethod
    async def evaluate_question_answer(
        self,
        question_number: str,
        question_text: str,
        student_answer: str,
        model_answer: str,
        max_marks: float,
    ) -> QuestionEvaluation:
        """Evaluates a single student answer against the model answer key using AI."""
        pass
