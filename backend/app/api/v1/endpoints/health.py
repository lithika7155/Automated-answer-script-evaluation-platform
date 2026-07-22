from typing import Dict
from fastapi import APIRouter, status
from pydantic import BaseModel, ConfigDict

from app.application.use_cases.check_health import CheckHealthUseCase

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    environment: str
    version: str
    details: Dict[str, str]

    model_config = ConfigDict(from_attributes=True)


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Check API & System Health",
    description="Returns the health status of the backend application and its components.",
)
async def check_health() -> HealthResponse:
    use_case = CheckHealthUseCase()
    health_status = use_case.execute()
    return HealthResponse(
        status=health_status.status,
        environment=health_status.environment,
        version=health_status.version,
        details=health_status.details,
    )
