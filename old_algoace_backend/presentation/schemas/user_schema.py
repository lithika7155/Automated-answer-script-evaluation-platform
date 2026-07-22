from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DownloadRecordSchema(BaseModel):
    timestamp: datetime
    slugs: list[str]

class UserProfileResponse(BaseModel):
    user_id: str
    bookmarks: list[str]
    recently_viewed: list[str]
    download_history: list[DownloadRecordSchema]
    
    model_config = {
        "from_attributes": True
    }
