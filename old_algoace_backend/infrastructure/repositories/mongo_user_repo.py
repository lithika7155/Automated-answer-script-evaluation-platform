from datetime import datetime
from typing import Any
from motor.motor_asyncio import AsyncIOMotorCollection

from domain.entities.user import UserProfile, DownloadRecord
from domain.interfaces.user_repository import UserRepository

def _doc_to_user(doc: dict[str, Any]) -> UserProfile:
    downloads = []
    for d in doc.get("download_history", []):
        downloads.append(DownloadRecord(
            timestamp=d["timestamp"],
            slugs=d["slugs"]
        ))
    
    return UserProfile(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        bookmarks=doc.get("bookmarks", []),
        recently_viewed=doc.get("recently_viewed", []),
        download_history=downloads,
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )

class MongoUserRepository(UserRepository):
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def get_by_user_id(self, user_id: str) -> UserProfile:
        doc = await self.collection.find_one({"user_id": user_id})
        if not doc:
            # Upsert on first access
            new_user = {
                "user_id": user_id,
                "bookmarks": [],
                "recently_viewed": [],
                "download_history": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            res = await self.collection.insert_one(new_user)
            new_user["_id"] = res.inserted_id
            return _doc_to_user(new_user)
            
        return _doc_to_user(doc)

    async def toggle_bookmark(self, user_id: str, slug: str) -> UserProfile:
        user = await self.get_by_user_id(user_id)
        if slug in user.bookmarks:
            update = {"$pull": {"bookmarks": slug}}
        else:
            update = {"$addToSet": {"bookmarks": slug}}
            
        update["$set"] = {"updated_at": datetime.utcnow()}
        
        doc = await self.collection.find_one_and_update(
            {"user_id": user_id},
            update,
            return_document=True
        )
        return _doc_to_user(doc)

    async def record_view(self, user_id: str, slug: str) -> None:
        # Keep only the last 50 recently viewed. We remove it first if it exists, then push to the front.
        # MongoDB doesn't easily let us pull and push in the same update for the same array.
        # So we do a multi-step operation or use an aggregation pipeline, but for simplicity:
        await self.collection.update_one(
            {"user_id": user_id},
            {"$pull": {"recently_viewed": slug}}
        )
        await self.collection.update_one(
            {"user_id": user_id},
            {
                "$push": {
                    "recently_viewed": {
                        "$each": [slug],
                        "$slice": -50  # Keep last 50 (newest at the end)
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )

    async def record_download(self, user_id: str, slugs: list[str]) -> None:
        record = {
            "timestamp": datetime.utcnow(),
            "slugs": slugs
        }
        await self.collection.update_one(
            {"user_id": user_id},
            {
                "$push": {"download_history": record},
                "$set": {"updated_at": datetime.utcnow()}
            },
            upsert=True
        )

    async def create_indexes(self) -> None:
        from pymongo import ASCENDING
        await self.collection.create_index([("user_id", ASCENDING)], unique=True)
