import json
import re
from typing import Optional
from google import genai
from google.genai import types

from app.core.config import settings
from app.core.logging import logger
from app.domain.interfaces.ai_evaluator import IAIEvaluatorService
from app.domain.models.evaluation import QuestionEvaluation


class GeminiAIEvaluator(IAIEvaluatorService):
    """Gemini AI Evaluator Service Adapter."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model_name = model or settings.GEMINI_MODEL
        self.client: Optional[genai.Client] = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini Client: {e}")

    async def evaluate_question_answer(
        self,
        question_number: str,
        question_text: str,
        student_answer: str,
        model_answer: str,
        max_marks: float,
    ) -> QuestionEvaluation:
        if self.client:
            try:
                return await self._call_gemini(
                    question_number=question_number,
                    question_text=question_text,
                    student_answer=student_answer,
                    model_answer=model_answer,
                    max_marks=max_marks,
                )
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}. Falling back to evaluation engine.")

        return self._heuristic_evaluation(
            question_number=question_number,
            question_text=question_text,
            student_answer=student_answer,
            model_answer=model_answer,
            max_marks=max_marks,
        )

    async def _call_gemini(
        self,
        question_number: str,
        question_text: str,
        student_answer: str,
        model_answer: str,
        max_marks: float,
    ) -> QuestionEvaluation:
        prompt = f"""
You are an expert academic evaluator. Evaluate the student's answer against the model answer key.

Question Number: {question_number}
Question Text: {question_text}
Maximum Marks: {max_marks}

Model Answer (Answer Key):
\"\"\"{model_answer}\"\"\"

Student's OCR-Extracted Answer:
\"\"\"{student_answer}\"\"\"

Provide your evaluation as a valid JSON object matching this exact schema:
{{
  "marks_obtained": <float between 0.0 and {max_marks}>,
  "relevance_score": <float between 0.0 and 1.0>,
  "completeness_score": <float between 0.0 and 1.0>,
  "feedback": "<detailed feedback string>",
  "missing_concepts": ["<concept 1>", "<concept 2>"],
  "incorrect_points": ["<incorrect statement 1>"]
}}
Return ONLY JSON. No markdown backticks or commentary outside JSON.
"""
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )

        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()

        data = json.loads(text)
        marks_obtained = min(float(data.get("marks_obtained", 0.0)), max_marks)

        return QuestionEvaluation(
            question_number=question_number,
            max_marks=max_marks,
            marks_obtained=round(marks_obtained, 2),
            relevance_score=round(min(max(float(data.get("relevance_score", 0.0)), 0.0), 1.0), 2),
            completeness_score=round(min(max(float(data.get("completeness_score", 0.0)), 0.0), 1.0), 2),
            feedback=str(data.get("feedback", "Automated evaluation completed.")),
            missing_concepts=list(data.get("missing_concepts", [])),
            incorrect_points=list(data.get("incorrect_points", [])),
        )

    def _heuristic_evaluation(
        self,
        question_number: str,
        question_text: str,
        student_answer: str,
        model_answer: str,
        max_marks: float,
    ) -> QuestionEvaluation:
        model_words = set(re.findall(r"\b\w{4,}\b", model_answer.lower()))
        student_words = set(re.findall(r"\b\w{4,}\b", student_answer.lower()))

        if not model_words:
            relevance = 1.0
            completeness = 1.0
            missing = []
        else:
            intersection = model_words.intersection(student_words)
            relevance = len(intersection) / len(model_words) if model_words else 0.0
            completeness = min(len(student_words) / max(len(model_words), 1), 1.0)
            missing = list(model_words - student_words)[:3]

        score_ratio = (relevance * 0.6) + (completeness * 0.4)
        marks_obtained = round(max_marks * score_ratio, 2)

        incorrect = []
        if len(student_answer.strip()) < 5:
            incorrect.append("Answer is empty or insufficient.")

        feedback = (
            f"Question {question_number}: Answer covers {int(relevance * 100)}% of core concepts. "
            f"Assigned {marks_obtained}/{max_marks} marks."
        )

        return QuestionEvaluation(
            question_number=question_number,
            max_marks=max_marks,
            marks_obtained=marks_obtained,
            relevance_score=round(relevance, 2),
            completeness_score=round(completeness, 2),
            feedback=feedback,
            missing_concepts=missing,
            incorrect_points=incorrect,
        )
