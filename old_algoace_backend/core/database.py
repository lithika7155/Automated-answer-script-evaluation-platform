from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from core.config import get_settings

_client: AsyncIOMotorClient | None = None


async def connect_db() -> None:
    """Open Motor connection — called in app lifespan startup."""
    global _client
    settings = get_settings()
    _client = AsyncIOMotorClient(settings.mongo_uri)
    # Ping to verify connectivity early
    await _client.admin.command("ping")


async def close_db() -> None:
    """Close Motor connection — called in app lifespan shutdown."""
    global _client
    if _client:
        _client.close()
        _client = None


def get_db() -> AsyncIOMotorDatabase:
    if _client is None:
        raise RuntimeError("Database not connected. Call connect_db() first.")
    return _client[get_settings().mongo_db_name]


def get_collection(name: str) -> AsyncIOMotorCollection:
    return get_db()[name]
