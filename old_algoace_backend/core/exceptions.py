from fastapi import HTTPException, status


class QuestionNotFoundError(HTTPException):
    def __init__(self, slug: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with slug '{slug}' not found.",
        )


class QuestionAlreadyExistsError(HTTPException):
    def __init__(self, slug: str):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A question with slug '{slug}' already exists.",
        )


class AIServiceError(HTTPException):
    def __init__(self, message: str = "AI service failed to generate a response."):
        super().__init__(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=message,
        )


class InvalidHintLevelError(HTTPException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="hintLevel must be 1, 2, or 3.",
        )


class DatabaseError(HTTPException):
    def __init__(self, message: str = "A database error occurred."):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=message,
        )
