from dataclasses import dataclass
from typing import Dict


@dataclass
class HealthStatus:
    status: str
    environment: str
    version: str
    details: Dict[str, str]
