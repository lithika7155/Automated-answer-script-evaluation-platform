from app.application.dtos.admin import AdminDashboardDTO
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import UserRole
from app.domain.services.grading_service import GradingService


class GetAdminDashboardUseCase:
    def __init__(
        self,
        user_repo: IUserRepository,
        script_repo: IAnswerScriptRepository,
        eval_repo: IEvaluationRepository,
    ):
        self.user_repo = user_repo
        self.script_repo = script_repo
        self.eval_repo = eval_repo

    async def execute(self) -> AdminDashboardDTO:
        users = await self.user_repo.list_all(skip=0, limit=1000)
        scripts = await self.script_repo.list_all(skip=0, limit=1000)
        evaluations = await self.eval_repo.list_all(skip=0, limit=1000)

        students_count = sum(1 for u in users if u.role == UserRole.STUDENT)
        faculty_count = sum(1 for u in users if u.role == UserRole.FACULTY)
        admin_count = sum(1 for u in users if u.role == UserRole.ADMIN)

        overall_avg = 0.0
        pass_rate = 0.0
        if evaluations:
            percentages = [ev.percentage for ev in evaluations]
            overall_avg = round(sum(percentages) / len(percentages), 2)
            passed = sum(
                1
                for ev in evaluations
                if GradingService.calculate_grade_and_status(ev.percentage)[1].value == "Pass"
            )
            pass_rate = round((passed / len(evaluations)) * 100.0, 2)

        return AdminDashboardDTO(
            total_users=len(users),
            total_students=students_count,
            total_faculty=faculty_count,
            total_admins=admin_count,
            total_answer_scripts=len(scripts),
            total_evaluations=len(evaluations),
            overall_average_percentage=overall_avg,
            overall_pass_rate=pass_rate,
            system_status="Healthy",
        )
