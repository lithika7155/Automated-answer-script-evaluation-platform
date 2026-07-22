import json
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

from domain.entities.question import Question
from domain.interfaces.ai_service import AIService
from infrastructure.ai.prompt_templates import (
    EXPLAIN_PROMPT, HINT_LEVEL_1_PROMPT, HINT_LEVEL_2_PROMPT,
    HINT_LEVEL_3_PROMPT, REVIEW_APPROACH_PROMPT, RECOMMEND_PROMPT,
    ROADMAP_PROMPT
)
from core.config import get_settings


class GeminiService(AIService):
    def __init__(self):
        settings = get_settings()
        genai.configure(api_key=settings.gemini_api_key)
        self.model = genai.GenerativeModel(settings.gemini_model)
        
        # Safe defaults for coding assistant
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

    async def _generate_content(self, prompt: str, is_json: bool = False) -> str:
        # Run synchronous call in threadpool (since genai SDK is mostly sync)
        import asyncio
        loop = asyncio.get_running_loop()
        
        kwargs = {"safety_settings": self.safety_settings}
        if is_json:
            kwargs["generation_config"] = {"response_mime_type": "application/json"}

        response = await loop.run_in_executor(
            None, 
            lambda: self.model.generate_content(prompt, **kwargs)
        )
        return response.text

    async def explain(self, question: Question) -> str:
        prompt = EXPLAIN_PROMPT.format(
            title=question.title,
            difficulty=question.difficulty.value if question.difficulty else "Unknown",
            topics=", ".join([t.value for t in question.topics]),
            description=question.description,
            constraints=question.constraints,
        )
        return await self._generate_content(prompt)

    async def get_hint(self, question: Question, hint_level: int) -> str:
        if hint_level == 1:
            prompt_template = HINT_LEVEL_1_PROMPT
        elif hint_level == 2:
            prompt_template = HINT_LEVEL_2_PROMPT
        else:
            prompt_template = HINT_LEVEL_3_PROMPT

        prompt = prompt_template.format(
            title=question.title,
            description=question.description,
        )
        return await self._generate_content(prompt)

    async def review_approach(self, question: Question, user_text: str) -> str:
        prompt = REVIEW_APPROACH_PROMPT.format(
            title=question.title,
            description=question.description,
            user_text=user_text,
        )
        return await self._generate_content(prompt)

    async def recommend_slugs(
        self,
        topic: str,
        difficulty: str,
        exclude_slugs: list[str],
    ) -> list[str]:
        prompt = RECOMMEND_PROMPT.format(
            topics=topic,
            difficulty=difficulty,
            exclude_slugs=", ".join(exclude_slugs) if exclude_slugs else "none",
        )
        
        response_text = await self._generate_content(prompt, is_json=True)
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            return []

    async def generate_roadmap(self, company: str) -> str:
        prompt = ROADMAP_PROMPT.format(company=company)
        return await self._generate_content(prompt)
