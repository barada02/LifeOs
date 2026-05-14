"""
main.py — Life OS Backend API (Phase 1 + Auth)

Features
--------
• POST /auth/signup   — create an account
• POST /auth/login    — get a JWT
• GET  /auth/me       — current user info  (protected)

• Full CRUD on /tasks/ and /notes/ — all protected, scoped per user

MCP/AI integration lives in the separate `mcpserver/` service.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from auth import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import close_mongo_connection, connect_to_mongo, get_database
from schemas import (
    NoteCreate,
    NoteResponse,
    NoteUpdate,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    TokenResponse,
    UserResponse,
    UserSignup,
)

load_dotenv()


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    # Ensure unique index on users.email so duplicate accounts are impossible
    db = get_database()
    await db.users.create_index("email", unique=True)
    yield
    await close_mongo_connection()


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Life OS Backend API",
    version="1.0.0",
    description="Personal productivity OS — backend service",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"status": "ok", "service": "Life OS Backend API", "version": "1.0.0"}


# ── Auth Routes ───────────────────────────────────────────────────────────────

@app.post("/auth/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
async def signup(payload: UserSignup):
    """Register a new user. Returns a JWT so the client is immediately logged in."""
    db = get_database()

    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists.",
        )

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "hashed_password": hash_password(payload.password),
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = str(result.inserted_id)

    token = create_access_token({"sub": str(result.inserted_id), "email": payload.email})
    return TokenResponse(
        access_token=token,
        user=UserResponse(**user_doc),
    )


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Standard OAuth2 password flow.
    Send `username` (= email) and `password` as form fields.
    Returns a JWT + user info.
    """
    db = get_database()
    user = await db.users.find_one({"email": form_data.username})

    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user["_id"] = str(user["_id"])
    token = create_access_token({"sub": user["_id"], "email": user["email"]})
    return TokenResponse(
        access_token=token,
        user=UserResponse(**user),
    )


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the currently authenticated user's profile."""
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(current_user["user_id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    return UserResponse(**user)


# ── Task Routes ───────────────────────────────────────────────────────────────

@app.post("/tasks/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED, tags=["Tasks"])
async def create_task(task: TaskCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now = datetime.now(timezone.utc)
    task_dict = task.model_dump()
    task_dict["user_id"] = current_user["user_id"]
    task_dict["created_at"] = now
    task_dict["updated_at"] = now

    result = await db.tasks.insert_one(task_dict)
    task_dict["_id"] = str(result.inserted_id)
    return task_dict


@app.get("/tasks/", response_model=List[TaskResponse], tags=["Tasks"])
async def get_tasks(current_user: dict = Depends(get_current_user)):
    db = get_database()
    tasks = await db.tasks.find({"user_id": current_user["user_id"]}).to_list(length=500)
    for t in tasks:
        t["_id"] = str(t["_id"])
    return tasks


@app.get("/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    task = await db.tasks.find_one(
        {"_id": ObjectId(task_id), "user_id": current_user["user_id"]}
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task["_id"] = str(task["_id"])
    return task


@app.put("/tasks/{task_id}", response_model=TaskResponse, tags=["Tasks"])
async def update_task(task_id: str, task_update: TaskUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in task_update.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.tasks.find_one_and_update(
        {"_id": ObjectId(task_id), "user_id": current_user["user_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    result["_id"] = str(result["_id"])
    return result


@app.delete("/tasks/{task_id}", tags=["Tasks"])
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.tasks.delete_one(
        {"_id": ObjectId(task_id), "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# ── Note Routes ───────────────────────────────────────────────────────────────

@app.post("/notes/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED, tags=["Notes"])
async def create_note(note: NoteCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    now = datetime.now(timezone.utc)
    note_dict = note.model_dump()
    note_dict["user_id"] = current_user["user_id"]
    note_dict["created_at"] = now
    note_dict["updated_at"] = now

    result = await db.notes.insert_one(note_dict)
    note_dict["_id"] = str(result.inserted_id)
    return note_dict


@app.get("/notes/", response_model=List[NoteResponse], tags=["Notes"])
async def get_notes(current_user: dict = Depends(get_current_user)):
    db = get_database()
    notes = await db.notes.find({"user_id": current_user["user_id"]}).to_list(length=500)
    for n in notes:
        n["_id"] = str(n["_id"])
    return notes


@app.get("/notes/{note_id}", response_model=NoteResponse, tags=["Notes"])
async def get_note(note_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    note = await db.notes.find_one(
        {"_id": ObjectId(note_id), "user_id": current_user["user_id"]}
    )
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    note["_id"] = str(note["_id"])
    return note


@app.put("/notes/{note_id}", response_model=NoteResponse, tags=["Notes"])
async def update_note(note_id: str, note_update: NoteUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    update_data = {k: v for k, v in note_update.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    update_data["updated_at"] = datetime.now(timezone.utc)

    result = await db.notes.find_one_and_update(
        {"_id": ObjectId(note_id), "user_id": current_user["user_id"]},
        {"$set": update_data},
        return_document=True,
    )
    if not result:
        raise HTTPException(status_code=404, detail="Note not found")
    result["_id"] = str(result["_id"])
    return result


@app.delete("/notes/{note_id}", tags=["Notes"])
async def delete_note(note_id: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.notes.delete_one(
        {"_id": ObjectId(note_id), "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"message": "Note deleted successfully"}


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
