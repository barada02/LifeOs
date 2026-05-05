from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Annotated
from datetime import datetime, timezone

# Custom type for handling MongoDB ObjectIds
PyObjectId = Annotated[str, BeforeValidator(str)]

class TaskBase(BaseModel):
    title: str = Field(..., description="The title or summary of the task")
    description: Optional[str] = Field(None, description="Detailed description of the task")
    status: str = Field("todo", description="Task status: todo, in_progress, or done")
    priority: str = Field("medium", description="Task priority: low, medium, or high")
    due_date: Optional[datetime] = Field(None, description="When the task is due")

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class TaskInDB(TaskBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TaskResponse(TaskInDB):
    pass

class NoteBase(BaseModel):
    title: str = Field(..., description="Title of the note")
    content: str = Field(..., description="Markdown or text content of the note")
    tags: List[str] = Field(default_factory=list, description="List of tags for categorization")

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None

class NoteInDB(NoteBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteResponse(NoteInDB):
    pass
