from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_users: int = 0
    total_students: int = 0
    total_faculty: int = 0
    total_admins: int = 0
    total_answer_scripts: int = 0
    total_evaluations: int = 0
    overall_average_percentage: float = 0.0
    overall_pass_rate: float = 0.0
    system_status: str = "Healthy"
