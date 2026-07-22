from app.domain.exceptions import DomainException


class InvalidFileTypeException(DomainException):
    def __init__(self, filename: str, allowed: list):
        super().__init__(f"File '{filename}' has an invalid extension. Allowed extensions: {', '.join(allowed)}")


class FileTooLargeException(DomainException):
    def __init__(self, max_mb: int):
        super().__init__(f"File size exceeds the maximum limit of {max_mb} MB.")


class AnswerScriptNotFoundException(DomainException):
    def __init__(self, script_id: str):
        super().__init__(f"Answer script with ID '{script_id}' was not found.")


class FileStorageException(DomainException):
    def __init__(self, detail: str):
        super().__init__(f"File storage operation failed: {detail}")
