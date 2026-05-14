"""
schemas.py — Pydantic models for Life OS Backend.

Includes:
  • User (signup / login / response)
  • Task (create / update / response)
  • Note  (create / update / response)

All DB documents include a user_id field so every record is scoped to
the authenticated user.
"""

from pydantic import BaseModel, Field, BeforeValidator, EmailStr
from typing import Optional, List, Annotated
from datetime import datetime, timezone

# ── Shared helpers ────────────────────────────────────────────────────────────

# Maps MongoDB's ObjectId to a plain str for JSON serialisation
PyObjectId = Annotated[str, BeforeValidator(str)]


# ── User ──────────────────────────────────────────────────────────────────────

class UserSignup(BaseModel):
    name: str = Field(..., min_length=2, description="Display name")
    email: EmailStr = Field(..., description="Unique email address")
    password: str = Field(..., min_length=6, description="Plain-text password (hashed before storage)")


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Safe user representation — never exposes the hashed password."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    created_at: datetime

    model_config = {"populate_by_name": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Task ──────────────────────────────────────────────────────────────────────

class TaskBase(BaseModel):
    title: str = Field(..., description="The title or summary of the task")
    description: Optional[str] = Field(None, description="Detailed description")
    status: str = Field("todo", description="todo | in_progress | done")
    priority: str = Field("medium", description="low | medium | high")
    due_date: Optional[datetime] = Field(None, description="When the task is due")


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskResponse(TaskBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str = Field(..., description="Owner's user ID")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}


# ── Note ──────────────────────────────────────────────────────────────────────

class NoteBase(BaseModel):
    title: str = Field(..., description="Title of the note")
    content: str = Field(..., description="Markdown or plain text content")
    tags: List[str] = Field(default_factory=list, description="Categorisation tags")


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(NoteBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str = Field(..., description="Owner's user ID")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    model_config = {"populate_by_name": True}
