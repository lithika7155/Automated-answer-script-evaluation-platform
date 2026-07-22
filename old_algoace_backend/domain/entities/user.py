from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

@dataclass
class DownloadRecord:
    timestamp: datetime
    slugs: list[str]

@dataclass
class UserProfile:
    user_id: str  # The unique anonymous identifier from X-User-ID
    bookmarks: list[str] = field(default_factory=list)
    recently_viewed: list[str] = field(default_factory=list)
    download_history: list[DownloadRecord] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    id: Optional[str] = None
