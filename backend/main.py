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

origins = [
    "http://localhost:3000",
]

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
