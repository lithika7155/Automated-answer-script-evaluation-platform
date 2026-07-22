from app.domain.exceptions import DomainException


class UserAlreadyExistsException(DomainException):
    def __init__(self, email: str):
        self.email = email
        super().__init__(f"User with email '{email}' already exists.")


class UserNotFoundException(DomainException):
    def __init__(self, identifier: str):
        self.identifier = identifier
        super().__init__(f"User '{identifier}' not found.")


class InvalidCredentialsException(DomainException):
    def __init__(self):
        super().__init__("Invalid email or password.")


class UnauthorizedException(DomainException):
    def __init__(self, detail: str = "Unauthorized access"):
        super().__init__(detail)
