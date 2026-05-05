from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from bson import ObjectId
from datetime import datetime, timezone
from database import connect_to_mongo, close_mongo_connection, get_database
from schemas import TaskCreate, TaskResponse, TaskUpdate, NoteCreate, NoteResponse, NoteUpdate
from typing import List

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title="Life OS Backend API", version="0.1.0", lifespan=lifespan)

# Allow React UI to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Life OS Phase 1 API is up and running!"}

# ==========================================
# Task Routes
# ==========================================

@app.post("/tasks/", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    db = get_database()
    task_dict = task.model_dump()
    task_dict["created_at"] = datetime.now(timezone.utc)
    task_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tasks.insert_one(task_dict)
    task_dict["_id"] = str(result.inserted_id)
    return task_dict

@app.get("/tasks/", response_model=List[TaskResponse])
async def get_tasks():
    db = get_database()
    tasks = await db.tasks.find().to_list(length=100)
    for task in tasks:
        task["_id"] = str(task["_id"])
    return tasks

@app.get("/tasks/{task_id}", response_model=TaskResponse)
async def get_task(task_id: str):
    db = get_database()
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task["_id"] = str(task["_id"])
    return task

@app.put("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_update: TaskUpdate):
    db = get_database()
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
        
    result["_id"] = str(result["_id"])
    return result

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    db = get_database()
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}

# ==========================================
# Note Routes
# ==========================================

@app.post("/notes/", response_model=NoteResponse)
async def create_note(note: NoteCreate):
    db = get_database()
    note_dict = note.model_dump()
    note_dict["created_at"] = datetime.now(timezone.utc)
    note_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.notes.insert_one(note_dict)
    note_dict["_id"] = str(result.inserted_id)
    return note_dict

@app.get("/notes/", response_model=List[NoteResponse])
async def get_notes():
    db = get_database()
    notes = await db.notes.find().to_list(length=100)
    for note in notes:
        note["_id"] = str(note["_id"])
    return notes

@app.get("/notes/{note_id}", response_model=NoteResponse)
async def get_note(note_id: str):
    db = get_database()
    note = await db.notes.find_one({"_id": ObjectId(note_id)})
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note["_id"] = str(note["_id"])
    return note

@app.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note_update: NoteUpdate):
    db = get_database()
    update_data = {k: v for k, v in note_update.model_dump().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.notes.find_one_and_update(
        {"_id": ObjectId(note_id)},
        {"$set": update_data},
        return_document=True
    )
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")
        
    result["_id"] = str(result["_id"])
    return result

@app.delete("/notes/{note_id}")
async def delete_note(note_id: str):
    db = get_database()
    result = await db.notes.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

