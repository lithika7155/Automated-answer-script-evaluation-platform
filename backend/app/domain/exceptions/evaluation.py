from app.domain.exceptions import DomainException


class EvaluationFailedException(DomainException):
    def __init__(self, detail: str):
        super().__init__(f"AI evaluation process failed: {detail}")


class EvaluationNotFoundException(DomainException):
    def __init__(self, identifier: str):
        super().__init__(f"Evaluation result '{identifier}' was not found.")


class GeminiAPIException(DomainException):
    def __init__(self, detail: str):
        super().__init__(f"Gemini AI API error: {detail}")
