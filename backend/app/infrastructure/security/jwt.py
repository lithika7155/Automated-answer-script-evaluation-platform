from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from app.core.config import settings
from app.domain.exceptions.user import UnauthorizedException


class JWTHandler:
    @staticmethod
    def create_access_token(
        subject: str,
        role: str,
        expires_delta: Optional[timedelta] = None,
    ) -> str:
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode: Dict[str, Any] = {
            "sub": str(subject),
            "role": role,
            "exp": expire,
            "iat": datetime.utcnow(),
        }
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM,
        )
        return encoded_jwt

    @staticmethod
    def decode_token(token: str) -> Dict[str, Any]:
        try:
            payload = jwt.decode(
                token,
                settings.SECRET_KEY,
                algorithms=[settings.ALGORITHM],
            )
            return payload
        except jwt.ExpiredSignatureError:
            raise UnauthorizedException("Token has expired.")
        except jwt.PyJWTError:
            raise UnauthorizedException("Invalid authentication token.")
