import asyncio
import json
import os
import sys

from motor.motor_asyncio import AsyncIOMotorClient
from slugify import slugify

# Add the backend root to the python path so imports work
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.config import get_settings
from domain.entities.question import Question, Example, Hint, AIExplanationCache
from domain.enums import Difficulty, DSATopic
from infrastructure.repositories.mongo_question_repo import MongoQuestionRepository

async def import_questions_from_json(filepath: str):
    settings = get_settings()
    client = AsyncIOMotorClient(settings.mongo_uri)
    db = client[settings.mongo_db_name]
    collection = db["questions"]
    repo = MongoQuestionRepository(collection)
    
    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    questions_data = data.get("questions", []) if isinstance(data, dict) else data
    
    print(f"Found {len(questions_data)} questions in {filepath}")
    
    imported = 0
    skipped = 0
    
    for q_data in questions_data:
        title = q_data.get("title")
        slug = q_data.get("slug") or slugify(title)
        
        if await repo.slug_exists(slug):
            print(f"Skipping '{title}' (slug '{slug}' already exists)")
            skipped += 1
            continue
            
        try:
            difficulty_val = q_data.get("difficulty")
            difficulty = Difficulty(difficulty_val) if difficulty_val else Difficulty.MEDIUM
            
            topics_val = q_data.get("topics", [])
            topics = [DSATopic(t) for t in topics_val if t in [e.value for e in DSATopic]]
            
            examples = []
            for e in q_data.get("examples", []):
                examples.append(Example(input=e["input"], output=e["output"], explanation=e.get("explanation")))
                
            hints = []
            for h in q_data.get("hints", []):
                hints.append(Hint(level=h["level"], content=h["content"]))
                
            q = Question(
                title=title,
                slug=slug,
                description=q_data.get("description", ""),
                difficulty=difficulty,
                topics=topics,
                companies=q_data.get("companies", []),
                tags=q_data.get("tags", []),
                constraints=q_data.get("constraints", ""),
                examples=examples,
                hints=hints,
                solution_approach=q_data.get("solution_approach", ""),
                python_solution=q_data.get("python_solution", ""),
                java_solution=q_data.get("java_solution", ""),
                frequency_score=q_data.get("frequency_score", 0.5),
                is_premium=q_data.get("is_premium", False)
            )
            
            await repo.create(q)
            imported += 1
            print(f"Imported '{title}'")
            
        except Exception as e:
            print(f"Error importing '{title}': {e}")
            skipped += 1
            
    print(f"\nImport complete. Imported: {imported}, Skipped/Errors: {skipped}")
    client.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python import_json.py <path_to_json_file>")
        sys.exit(1)
        
    filepath = sys.argv[1]
    asyncio.run(import_questions_from_json(filepath))
