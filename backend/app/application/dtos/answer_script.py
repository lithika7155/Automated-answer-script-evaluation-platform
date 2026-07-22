from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from app.domain.models.answer_script import AnswerScriptStatus


class AnswerScriptResponseDTO(BaseModel):
    id: str
    student_id: str
    exam_id: str
    original_filename: str
    file_path: str
    content_type: str
    file_size_bytes: int
    upload_time: datetime
    status: AnswerScriptStatus
