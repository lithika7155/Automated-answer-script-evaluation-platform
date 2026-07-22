from pydantic import BaseModel, Field

class ReviewApproachRequest(BaseModel):
    user_text: str = Field(..., min_length=10)

class ReviewApproachResponse(BaseModel):
    slug: str
    feedback_markdown: str

class HintResponse(BaseModel):
    slug: str
    hint_level: int
    hint: str
    source: str

class ExplainResponse(BaseModel):
    slug: str
    explanation_markdown: str

class RecommendResponse(BaseModel):
    recommended_slugs: list[str]

class RoadmapResponse(BaseModel):
    company: str
    roadmap_markdown: str
