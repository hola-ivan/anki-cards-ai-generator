from fastapi import FastAPI, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import uuid
import json
import asyncio
from generator.entities import WordWithContext, CardRawDataV1
from generator.anki.genanki_exporter import export_to_apkg
from backend.service import GenerationService

app = FastAPI()

# Get allowed origins from env or default to localhost
# In production, you should set ALLOWED_ORIGINS to your Vercel domain
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
origins = allowed_origins_env.split(",") if allowed_origins_env else [
    "http://localhost:3000",
    "https://*.vercel.app", # Wildcard for Vercel preview deployments (requires extra logic usually, but FastAPI middleware handles exact matches. For pattern matching we might need regex or just allow keys)
    # Since FastAPI Starlette CORSMiddleware regex support is specific, we might just want to allow all for this demo or specific domains.
    # Let's keep it simple and safe-ish.
]

# If we want to allow everything (easier for initial deploy), we can check a flag
if os.getenv("ALLOW_ALL_ORIGINS", "false").lower() == "true":
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TASKS_DIR = "temp_tasks"
os.makedirs(TASKS_DIR, exist_ok=True)

class GenerateRequest(BaseModel):
    words: List[dict] # [{"word": "foo", "context": "bar"}]
    language: str = "english"
    level: str = "B2"
    deck_name: str = "Anki Deck"

@app.post("/api/generate")
async def generate_cards(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(None),
    words: Optional[str] = Form(None), # JSON string of words if file not provided
    language: str = Form("english"),
    level: str = Form("B2"),
    deck_name: str = Form("Generated Deck")
):
    task_id = str(uuid.uuid4())
    task_dir = os.path.join(TASKS_DIR, task_id)
    os.makedirs(task_dir, exist_ok=True)
    
    # Validation and Parsing logic here (simplified)
    input_words = []
    if file:
        # Save file temporarily and parse it
        temp_input = os.path.join(task_dir, "input.csv")
        with open(temp_input, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        # We would need a parser here, reusing existing one or simple CSV read
        # For now assuming simple usage of service
    
    # Mock is now implicitly true/handled by service which defaults to mock flag
    service = GenerationService(task_dir=task_dir, language=language, level=level, openai_key=None)
    
    # Add background task
    background_tasks.add_task(service.process_task, task_id, deck_name, input_words, file_path=os.path.join(task_dir, "input.csv") if file else None)

    return {"task_id": task_id, "status": "processing"}

@app.get("/api/download/{task_id}")
async def download_deck(task_id: str):
    file_path = os.path.join(TASKS_DIR, task_id, "deck.apkg")
    if os.path.exists(file_path):
        return FileResponse(file_path, filename="deck.apkg", media_type="application/octet-stream")
    return {"error": "File not found or processing not complete"}

@app.get("/api/status/{task_id}")
async def get_status(task_id: str):
    task_dir = os.path.join(TASKS_DIR, task_id)
    status_file = os.path.join(task_dir, "status.json")
    
    if os.path.exists(status_file):
        with open(status_file, "r") as f:
            try:
                status = json.load(f)
                return status
            except json.JSONDecodeError:
                return {"state": "processing", "progress": 0} # File being written
    
    # If folder exists but no status file yet, assumed initializing
    if os.path.exists(task_dir):
        return {"state": "initializing", "progress": 0}
        
    return JSONResponse(status_code=404, content={"error": "Task not found"})

@app.get("/api/tasks/{task_id}/cards")
async def get_cards(task_id: str):
    file_path = os.path.join(TASKS_DIR, task_id, "cards.json")
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
             return json.load(f)
    return JSONResponse(status_code=404, content={"error": "Cards not found"})

@app.get("/api/tasks/{task_id}/media/{filename}")
async def get_media(task_id: str, filename: str):
    # Security: ensure no traversal
    if ".." in filename or "/" in filename:
         return JSONResponse(status_code=400, content={"error": "Invalid filename"})
         
    file_path = os.path.join(TASKS_DIR, task_id, filename) # logic in worker was saving to task_dir directly for simple mock/gen
    # Wait, generate_cards logic saves to processing_dir aka task_dir.
    
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return JSONResponse(status_code=404, content={"error": "File not found"})
