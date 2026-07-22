from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings
from app.core.logging import logger


class MongoDBManager:
    """Async MongoDB Connection Manager using Motor."""

    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls) -> None:
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URL}...")
            cls.client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            # Verify ping
            await cls.client.admin.command('ping')
            logger.info("MongoDB connected successfully.")
        except Exception as e:
            logger.warning(f"MongoDB live connection check failed: {e}. Repositories will fallback to in-memory mode if DB is unreachable during testing.")

    @classmethod
    async def disconnect(cls) -> None:
        if cls.client:
            logger.info("Closing MongoDB connection...")
            cls.client.close()
            cls.client = None
            cls.db = None
            logger.info("MongoDB connection closed.")


mongodb_manager = MongoDBManager()


def get_mongo_db() -> Optional[AsyncIOMotorDatabase]:
    return mongodb_manager.db
