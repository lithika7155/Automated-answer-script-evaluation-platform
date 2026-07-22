from typing import Tuple
from app.domain.models.analytics import GradeEnum, PassFailStatus


class GradingService:
    @staticmethod
    def calculate_grade_and_status(percentage: float) -> Tuple[GradeEnum, PassFailStatus]:
        if percentage >= 90.0:
            grade = GradeEnum.A_PLUS
            status = PassFailStatus.PASS
        elif percentage >= 80.0:
            grade = GradeEnum.A
            status = PassFailStatus.PASS
        elif percentage >= 70.0:
            grade = GradeEnum.B
            status = PassFailStatus.PASS
        elif percentage >= 60.0:
            grade = GradeEnum.C
            status = PassFailStatus.PASS
        elif percentage >= 50.0:
            grade = GradeEnum.D
            status = PassFailStatus.PASS
        else:
            grade = GradeEnum.F
            status = PassFailStatus.FAIL

        return grade, status
