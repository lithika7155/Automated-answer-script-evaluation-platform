from domain.interfaces.user_repository import UserRepository
from domain.entities.user import UserProfile

async def get_user_profile(user_id: str, repo: UserRepository) -> UserProfile:
    """Fetch or create a user profile by user_id."""
    return await repo.get_by_user_id(user_id)

async def toggle_user_bookmark(user_id: str, slug: str, repo: UserRepository) -> UserProfile:
    """Toggle a bookmark for a user."""
    return await repo.toggle_bookmark(user_id, slug)

async def record_user_view(user_id: str, slug: str, repo: UserRepository) -> None:
    """Record a recently viewed question."""
    await repo.record_view(user_id, slug)

async def record_user_download(user_id: str, slugs: list[str], repo: UserRepository) -> None:
    """Record a download event."""
    await repo.record_download(user_id, slugs)
