import uuid
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.domain.interfaces.answer_script_repository import IAnswerScriptRepository
from app.domain.models.answer_script import AnswerScript


class MongoAnswerScriptRepository(IAnswerScriptRepository):
    """Concrete MongoAnswerScriptRepository with automated in-memory test fallback."""

    _in_memory_store: dict[str, dict] = {}

    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
        self.collection_name = "answer_scripts"

    @property
    def _collection(self):
        if self.db is not None:
            return self.db[self.collection_name]
        return None

    async def create(self, script: AnswerScript) -> AnswerScript:
        script_dict = script.model_dump()
        if not script_dict.get("id"):
            script_dict["id"] = str(uuid.uuid4())

        collection = self._collection
        if collection is not None:
            try:
                mongo_doc = dict(script_dict)
                mongo_doc["_id"] = script_dict["id"]
                await collection.insert_one(mongo_doc)
            except Exception:
                self._in_memory_store[script_dict["id"]] = script_dict
        else:
            self._in_memory_store[script_dict["id"]] = script_dict

        return AnswerScript(**script_dict)

    async def get_by_id(self, script_id: str) -> Optional[AnswerScript]:
        collection = self._collection
        if collection is not None:
            try:
                doc = await collection.find_one({"_id": script_id})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return AnswerScript(**doc)
            except Exception:
                pass

        item = self._in_memory_store.get(script_id)
        if item:
            return AnswerScript(**item)
        return None

    async def list_all(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[AnswerScript]:
        query = {}
        if student_id:
            query["student_id"] = student_id
        if exam_id:
            query["exam_id"] = exam_id

        collection = self._collection
        scripts = []
        if collection is not None:
            try:
                cursor = collection.find(query).skip(skip).limit(limit)
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    scripts.append(AnswerScript(**doc))
                if scripts:
                    return scripts
            except Exception:
                pass

        filtered = []
        for item in self._in_memory_store.values():
            if student_id and item.get("student_id") != student_id:
                continue
            if exam_id and item.get("exam_id") != exam_id:
                continue
            filtered.append(AnswerScript(**item))

        return filtered[skip : skip + limit]

    async def delete(self, script_id: str) -> bool:
        collection = self._collection
        deleted = False
        if collection is not None:
            try:
                res = await collection.delete_one({"_id": script_id})
                if res.deleted_count > 0:
                    deleted = True
            except Exception:
                pass

        if script_id in self._in_memory_store:
            del self._in_memory_store[script_id]
            deleted = True

        return deleted
