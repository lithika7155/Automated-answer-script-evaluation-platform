from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class AnswerScriptStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    EVALUATED = "evaluated"
    FAILED = "failed"


class AnswerScript(BaseModel):
    id: Optional[str] = None
    student_id: str
    exam_id: str
    original_filename: str
    stored_filename: str
    file_path: str
    content_type: str
    file_size_bytes: int
    upload_time: datetime = Field(default_factory=datetime.utcnow)
    status: AnswerScriptStatus = AnswerScriptStatus.UPLOADED
