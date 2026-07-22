from domain.interfaces.ai_service import AIService
from core.exceptions import AIServiceError

async def generate_company_roadmap(company: str, ai: AIService) -> str:
    """Generate a 4-week interview preparation roadmap for a company."""
    if not company or len(company.strip()) < 2:
        raise ValueError("Valid company name is required.")
        
    try:
        roadmap = await ai.generate_roadmap(company)
    except Exception as exc:
        raise AIServiceError(str(exc))
        
    return roadmap
