# AI Interview Preparation Platform Backend

A clean-architecture FastAPI backend powered by MongoDB and Google Gemini 1.5 Flash.

## Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your values.
   ```bash
   cp .env.example .env
   ```
   - Need a MongoDB Atlas URI (or local MongoDB).
   - Need a Google Gemini API Key.

3. **Run the Server**
   ```bash
   uvicorn main:app --reload
   ```

4. **Seed Data (Optional)**
   Generate 200 realistic interview questions and load them into MongoDB:
   ```bash
   python scripts/seed_data.py
   ```

## Architecture
This project follows Clean Architecture:
- **Presentation**: FastAPI routers and Pydantic schemas.
- **Application**: Pure Python use-cases mapping domain entities to DTOs.
- **Domain**: Pure Python entities, Enums, and Repository/Service Interfaces.
- **Infrastructure**: Motor (MongoDB) and Gemini integrations.

## Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
