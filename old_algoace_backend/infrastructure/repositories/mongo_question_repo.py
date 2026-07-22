from __future__ import annotations
from datetime import datetime
from typing import Optional, Any, List
from bson import ObjectId

from motor.motor_asyncio import AsyncIOMotorCollection

from domain.entities.question import Question, Example, Hint, AIExplanationCache
from domain.interfaces.question_repository import QuestionRepository
from domain.enums import DSATopic, Difficulty, SortField


def _doc_to_entity(doc: dict[str, Any]) -> Question:
    """Convert a MongoDB document dict back to a Question entity."""
    return Question(
        id=str(doc["_id"]),
        title=doc["title"],
        slug=doc["slug"],
        description=doc["description"],
        difficulty=Difficulty(doc["difficulty"]) if doc.get("difficulty") else None,
        topics=[DSATopic(t) for t in doc.get("topics", [])],
        companies=doc.get("companies", []),
        tags=doc.get("tags", []),
        constraints=doc.get("constraints", ""),
        examples=[
            Example(
                input=e["input"],
                output=e["output"],
                explanation=e.get("explanation")
            ) for e in doc.get("examples", [])
        ],
        hints=[
            Hint(level=h["level"], content=h["content"])
            for h in doc.get("hints", [])
        ],
        solution_approach=doc.get("solution_approach", ""),
        python_solution=doc.get("python_solution", ""),
        java_solution=doc.get("java_solution", ""),
        frequency_score=doc.get("frequency_score", 0.0),
        acceptance_rate=doc.get("acceptance_rate"),
        source_url=doc.get("source_url"),
        is_premium=doc.get("is_premium", False),
        view_count=doc.get("view_count", 0),
        ai_explanation=AIExplanationCache(
            cached_text=doc.get("ai_explanation", {}).get("cached_text"),
            generated_at=doc.get("ai_explanation", {}).get("generated_at")
        ),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at"),
    )


class MongoQuestionRepository(QuestionRepository):
    def __init__(self, collection: AsyncIOMotorCollection):
        self.collection = collection

    async def create(self, question: Question) -> Question:
        doc = {
            "title": question.title,
            "slug": question.slug,
            "description": question.description,
            "difficulty": question.difficulty.value if question.difficulty else None,
            "topics": [t.value for t in question.topics],
            "companies": question.companies,
            "tags": question.tags,
            "constraints": question.constraints,
            "examples": [
                {"input": e.input, "output": e.output, "explanation": e.explanation}
                for e in question.examples
            ],
            "hints": [{"level": h.level, "content": h.content} for h in question.hints],
            "solution_approach": question.solution_approach,
            "python_solution": question.python_solution,
            "java_solution": question.java_solution,
            "frequency_score": question.frequency_score,
            "acceptance_rate": question.acceptance_rate,
            "source_url": question.source_url,
            "is_premium": question.is_premium,
            "view_count": question.view_count,
            "ai_explanation": {
                "cached_text": question.ai_explanation.cached_text,
                "generated_at": question.ai_explanation.generated_at
            },
            "created_at": question.created_at,
            "updated_at": question.updated_at,
        }
        result = await self.collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return _doc_to_entity(doc)

    async def get_by_slug(self, slug: str) -> Optional[Question]:
        doc = await self.collection.find_one({"slug": slug})
        if doc:
            return _doc_to_entity(doc)
        return None

    async def list(
        self,
        topics: list[DSATopic] | None,
        difficulty: Difficulty | None,
        companies: list[str] | None,
        tags: list[str] | None,
        sort_by: SortField,
        page: int,
        limit: int,
    ) -> tuple[list["Question"], int]:
        query = {}
        if topics:
            query["topics"] = {"$in": [t.value for t in topics]}
        if difficulty:
            query["difficulty"] = difficulty.value
        if companies:
            # Case-insensitive company search is often better, but strict match for simplicity here
            query["companies"] = {"$in": companies}
        if tags:
            query["tags"] = {"$in": tags}

        sort_dir = -1  # Descending for frequency, created_at
        if sort_by == SortField.DIFFICULTY:
            # Assuming enum values order or explicit mapping, but descending is fine
            sort_dir = 1
        elif sort_by == SortField.TITLE:
            sort_dir = 1

        cursor = self.collection.find(query).sort(sort_by.value, sort_dir).skip((page - 1) * limit).limit(limit)
        docs = await cursor.to_list(length=limit)
        total = await self.collection.count_documents(query)
        
        return [_doc_to_entity(doc) for doc in docs], total

    async def search(
        self,
        query: str,
        page: int,
        limit: int,
    ) -> tuple[list["Question"], int]:
        # Requires a text index on title and description
        search_query = {"$text": {"$search": query}}
        cursor = self.collection.find(search_query, {"score": {"$meta": "textScore"}})
        cursor = cursor.sort([("score", {"$meta": "textScore"})]).skip((page - 1) * limit).limit(limit)
        
        docs = await cursor.to_list(length=limit)
        total = await self.collection.count_documents(search_query)
        return [_doc_to_entity(doc) for doc in docs], total

    async def update(self, slug: str, updates: dict) -> Optional[Question]:
        result = await self.collection.find_one_and_update(
            {"slug": slug},
            {"$set": updates},
            return_document=True
        )
        if result:
            return _doc_to_entity(result)
        return None

    async def delete(self, slug: str) -> bool:
        result = await self.collection.delete_one({"slug": slug})
        return result.deleted_count > 0

    async def get_random(
        self,
        count: int,
        difficulty: Difficulty | None,
        topics: list[DSATopic] | None,
    ) -> list[Question]:
        match = {}
        if difficulty:
            match["difficulty"] = difficulty.value
        if topics:
            match["topics"] = {"$in": [t.value for t in topics]}

        pipeline = []
        if match:
            pipeline.append({"$match": match})
        pipeline.append({"$sample": {"size": count}})

        cursor = self.collection.aggregate(pipeline)
        docs = await cursor.to_list(length=count)
        return [_doc_to_entity(doc) for doc in docs]

    async def get_recommendations(
        self,
        topics: list[DSATopic],
        difficulty: Difficulty | None,
        exclude_slugs: list[str],
        limit: int,
        tags: list[str] = None,
        companies: list[str] = None,
    ) -> list[Question]:
        match = {
            "slug": {"$nin": exclude_slugs}
        }
        
        if difficulty:
            match["difficulty"] = difficulty.value

        # Base filter: must share at least one topic, tag, or company if provided
        or_conditions = []
        if topics:
            or_conditions.append({"topics": {"$in": [t.value for t in topics]}})
        if tags:
            or_conditions.append({"tags": {"$in": tags}})
        if companies:
            or_conditions.append({"companies": {"$in": companies}})
            
        if or_conditions:
            match["$or"] = or_conditions

        pipeline = [
            {"$match": match},
            {
                "$addFields": {
                    "topic_match": {
                        "$size": {
                            "$setIntersection": [{"$ifNull": ["$topics", []]}, [t.value for t in topics] if topics else []]
                        }
                    },
                    "tag_match": {
                        "$size": {
                            "$setIntersection": [{"$ifNull": ["$tags", []]}, tags if tags else []]
                        }
                    },
                    "company_match": {
                        "$size": {
                            "$setIntersection": [{"$ifNull": ["$companies", []]}, companies if companies else []]
                        }
                    }
                }
            },
            {
                "$addFields": {
                    "relevance_score": {
                        "$add": [
                            {"$multiply": ["$topic_match", 3]},
                            {"$multiply": ["$tag_match", 2]},
                            {"$multiply": ["$company_match", 2]},
                            "$frequency_score"
                        ]
                    }
                }
            },
            {"$sort": {"relevance_score": -1}},
            {"$limit": limit}
        ]

        cursor = self.collection.aggregate(pipeline)
        docs = await cursor.to_list(length=limit)
        return [_doc_to_entity(doc) for doc in docs]

    async def update_ai_cache(self, slug: str, cached_text: str) -> None:
        await self.collection.update_one(
            {"slug": slug},
            {"$set": {
                "ai_explanation.cached_text": cached_text,
                "ai_explanation.generated_at": datetime.utcnow()
            }}
        )

    async def increment_view_count(self, slug: str) -> None:
        await self.collection.update_one(
            {"slug": slug},
            {"$inc": {"view_count": 1}}
        )

    async def slug_exists(self, slug: str) -> bool:
        count = await self.collection.count_documents({"slug": slug}, limit=1)
        return count > 0

    async def create_indexes(self) -> None:
        """Helper to create necessary indexes."""
        from pymongo import ASCENDING, DESCENDING, TEXT
        await self.collection.create_index([("slug", ASCENDING)], unique=True)
        await self.collection.create_index([("difficulty", ASCENDING)])
        await self.collection.create_index([("topics", ASCENDING)])
        await self.collection.create_index([("companies", ASCENDING)])
        await self.collection.create_index([("frequency_score", DESCENDING)])
        await self.collection.create_index([("created_at", DESCENDING)])
        await self.collection.create_index([
            ("title", TEXT),
            ("description", TEXT)
        ])
