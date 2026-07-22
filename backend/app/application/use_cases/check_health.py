from app.core.config import settings
from app.domain.models.health import HealthStatus


class CheckHealthUseCase:
    """Use Case interactor for system health evaluation."""

    def execute(self) -> HealthStatus:
        return HealthStatus(
            status="healthy",
            environment=settings.ENVIRONMENT,
            version="1.0.0",
            details={
                "database": "operational",
                "api": "online",
            },
        )
