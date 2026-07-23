from pydantic import BaseModel


class AdminDashboardDTO(BaseModel):
    total_users: int
    total_students: int
    total_faculty: int
    total_admins: int
    total_exams: int = 0
    total_answer_scripts: int
    total_evaluations: int
    overall_average_percentage: float
    overall_pass_rate: float
    system_status: str


class UserStatusUpdateDTO(BaseModel):
    is_active: bool
