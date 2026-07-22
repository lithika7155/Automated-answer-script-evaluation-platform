from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse

from app.core.logging import logger
from app.domain.exceptions import DomainException
from app.domain.exceptions.answer_script import (
    AnswerScriptNotFoundException,
    FileTooLargeException,
    InvalidFileTypeException,
)
from app.domain.exceptions.evaluation import (
    EvaluationFailedException,
    EvaluationNotFoundException,
)
from app.domain.exceptions.user import (
    InvalidCredentialsException,
    UnauthorizedException,
    UserAlreadyExistsException,
    UserNotFoundException,
)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(UserNotFoundException)
    @app.exception_handler(AnswerScriptNotFoundException)
    @app.exception_handler(EvaluationNotFoundException)
    async def not_found_exception_handler(request: Request, exc: DomainException):
        logger.warning(f"Resource Not Found [{request.method} {request.url.path}]: {exc}")
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"error": "Not Found", "detail": str(exc)},
        )

    @app.exception_handler(UserAlreadyExistsException)
    @app.exception_handler(InvalidFileTypeException)
    @app.exception_handler(FileTooLargeException)
    async def bad_request_exception_handler(request: Request, exc: DomainException):
        logger.warning(f"Bad Request [{request.method} {request.url.path}]: {exc}")
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "Bad Request", "detail": str(exc)},
        )

    @app.exception_handler(InvalidCredentialsException)
    @app.exception_handler(UnauthorizedException)
    async def unauthorized_exception_handler(request: Request, exc: DomainException):
        logger.warning(f"Unauthorized [{request.method} {request.url.path}]: {exc}")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": "Unauthorized", "detail": str(exc)},
        )

    @app.exception_handler(EvaluationFailedException)
    async def internal_exception_handler(request: Request, exc: DomainException):
        logger.error(f"Internal Evaluation Failure [{request.method} {request.url.path}]: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "Evaluation Failed", "detail": str(exc)},
        )
