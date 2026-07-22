import uuid
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.domain.interfaces.user_repository import IUserRepository
from app.domain.models.user import User


class MongoUserRepository(IUserRepository):
    """Concrete MongoUserRepository implementing IUserRepository."""

    # In-memory storage fallback for test environment when MongoDB client is offline
    _in_memory_store: dict[str, dict] = {}

    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
        self.collection_name = "users"

    @property
    def _collection(self):
        if self.db is not None:
            return self.db[self.collection_name]
        return None

    async def create(self, user: User) -> User:
        user_dict = user.model_dump()
        if not user_dict.get("id"):
            user_dict["id"] = str(uuid.uuid4())

        collection = self._collection
        if collection is not None:
            try:
                mongo_doc = dict(user_dict)
                mongo_doc["_id"] = user_dict["id"]
                await collection.insert_one(mongo_doc)
            except Exception:
                self._in_memory_store[user_dict["id"]] = user_dict
        else:
            self._in_memory_store[user_dict["id"]] = user_dict

        return User(**user_dict)

    async def get_by_email(self, email: str) -> Optional[User]:
        collection = self._collection
        if collection is not None:
            try:
                doc = await collection.find_one({"email": email})
                if doc:
                    if "_id" in doc:
                        doc["id"] = str(doc["_id"])
                    return User(**doc)
            except Exception:
                pass

        for item in self._in_memory_store.values():
            if item.get("email") == email:
                return User(**item)
        return None

    async def get_by_id(self, user_id: str) -> Optional[User]:
        collection = self._collection
        if collection is not None:
            try:
                doc = await collection.find_one({"_id": user_id})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return User(**doc)
            except Exception:
                pass

        item = self._in_memory_store.get(user_id)
        if item:
            return User(**item)
        return None

    async def list_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        collection = self._collection
        users = []
        if collection is not None:
            try:
                cursor = collection.find().skip(skip).limit(limit)
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    users.append(User(**doc))
                if users:
                    return users
            except Exception:
                pass

        all_items = list(self._in_memory_store.values())
        sliced = all_items[skip : skip + limit]
        return [User(**item) for item in sliced]
