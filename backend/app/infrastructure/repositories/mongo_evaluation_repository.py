import uuid
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.models.evaluation import EvaluationResult


class MongoEvaluationRepository(IEvaluationRepository):
    """Concrete MongoEvaluationRepository with in-memory test fallback."""

    _in_memory_store: dict[str, dict] = {}

    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        self.db = db
        self.collection_name = "evaluations"

    @property
    def _collection(self):
        if self.db is not None:
            return self.db[self.collection_name]
        return None

    async def create(self, evaluation: EvaluationResult) -> EvaluationResult:
        eval_dict = evaluation.model_dump()
        if not eval_dict.get("id"):
            eval_dict["id"] = str(uuid.uuid4())

        collection = self._collection
        if collection is not None:
            try:
                mongo_doc = dict(eval_dict)
                mongo_doc["_id"] = eval_dict["id"]
                await collection.insert_one(mongo_doc)
            except Exception:
                self._in_memory_store[eval_dict["id"]] = eval_dict
        else:
            self._in_memory_store[eval_dict["id"]] = eval_dict

        return EvaluationResult(**eval_dict)

    async def get_by_id(self, evaluation_id: str) -> Optional[EvaluationResult]:
        collection = self._collection
        if collection is not None:
            try:
                doc = await collection.find_one({"_id": evaluation_id})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return EvaluationResult(**doc)
            except Exception:
                pass

        item = self._in_memory_store.get(evaluation_id)
        if item:
            return EvaluationResult(**item)
        return None

    async def get_by_script_id(self, script_id: str) -> Optional[EvaluationResult]:
        collection = self._collection
        if collection is not None:
            try:
                doc = await collection.find_one({"answer_script_id": script_id})
                if doc:
                    doc["id"] = str(doc["_id"])
                    return EvaluationResult(**doc)
            except Exception:
                pass

        for item in self._in_memory_store.values():
            if item.get("answer_script_id") == script_id:
                return EvaluationResult(**item)
        return None

    async def list_all(
        self,
        student_id: Optional[str] = None,
        exam_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[EvaluationResult]:
        query = {}
        if student_id:
            query["student_id"] = student_id
        if exam_id:
            query["exam_id"] = exam_id

        collection = self._collection
        results = []
        if collection is not None:
            try:
                cursor = collection.find(query).skip(skip).limit(limit)
                async for doc in cursor:
                    doc["id"] = str(doc["_id"])
                    results.append(EvaluationResult(**doc))
                if results:
                    return results
            except Exception:
                pass

        filtered = []
        for item in self._in_memory_store.values():
            if student_id and item.get("student_id") != student_id:
                continue
            if exam_id and item.get("exam_id") != exam_id:
                continue
            filtered.append(EvaluationResult(**item))

        return filtered[skip : skip + limit]

    async def delete(self, evaluation_id: str) -> None:
        collection = self._collection
        if collection is not None:
            try:
                await collection.delete_one({"_id": evaluation_id})
            except Exception:
                pass
        self._in_memory_store.pop(evaluation_id, None)
