from typing import List, Optional
from app.application.dtos.analytics import LeaderboardEntryDTO
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.services.grading_service import GradingService


class GetLeaderboardUseCase:
    def __init__(
        self,
        eval_repository: IEvaluationRepository,
        user_repository: Optional[IUserRepository] = None,
    ):
        self.eval_repository = eval_repository
        self.user_repository = user_repository

    async def execute(self, exam_id: Optional[str] = None) -> List[LeaderboardEntryDTO]:
        evaluations = await self.eval_repository.list_all(exam_id=exam_id)

        sorted_evals = sorted(
            evaluations,
            key=lambda x: (x.percentage, x.total_score),
            reverse=True,
        )

        entries = []
        for rank, ev in enumerate(sorted_evals, start=1):
            student_name = "Student"
            if self.user_repository:
                user = await self.user_repository.get_by_id(ev.student_id)
                if user:
                    student_name = user.full_name

            grade, status = GradingService.calculate_grade_and_status(ev.percentage)
            entries.append(
                LeaderboardEntryDTO(
                    rank=rank,
                    student_id=ev.student_id,
                    student_name=student_name,
                    exam_id=ev.exam_id,
                    total_score=ev.total_score,
                    percentage=ev.percentage,
                    grade=grade,
                    status=status,
                )
            )
        return entries
