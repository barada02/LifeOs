"""
Life OS MCP Server
==================
Self-contained FastMCP server for the Life OS project.
Exposes tools for managing Tasks and Notes stored in MongoDB.

Transport:
  - Local / stdio  : python mcp_server.py
  - Cloud Run / SSE: MCP_TRANSPORT=sse python mcp_server.py
                     (listens on PORT env var, default 8080)
"""

from fastmcp import FastMCP
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List
import os
import json

from database import get_database, connect_to_mongo

# ---------------------------------------------------------------------------
# FastMCP instance
# ---------------------------------------------------------------------------
mcp = FastMCP("Life OS MCP Server",host="0.0.0.0",port=8080)


# ---------------------------------------------------------------------------
# DB helper
# ---------------------------------------------------------------------------
async def ensure_db():
    """Return a live DB handle, connecting lazily if needed."""
    if get_database() is None:
        await connect_to_mongo()
    return get_database()


# ---------------------------------------------------------------------------
# Task tools
# ---------------------------------------------------------------------------

@mcp.tool()
async def create_task(
    title: str,
    description: Optional[str] = None,
    priority: str = "medium",
    due_date: Optional[str] = None,
) -> str:
    """Create a new task in the database."""
    if not title or not title.strip():
        return "Error: Task title is required"

    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    task_dict = {
        "title": title.strip(),
        "description": description.strip() if description else None,
        "status": "todo",
        "priority": priority if priority in ["low", "medium", "high"] else "medium",
        "due_date": datetime.fromisoformat(due_date) if due_date else None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }

    result = await db.tasks.insert_one(task_dict)
    return f"Task created successfully with ID: {result.inserted_id}"


@mcp.tool()
async def read_all_tasks() -> str:
    """Get all tasks from the database."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    tasks = await db.tasks.find().to_list(length=100)
    for task in tasks:
        task["_id"] = str(task["_id"])
        if task.get("created_at"):
            task["created_at"] = task["created_at"].isoformat()
        if task.get("updated_at"):
            task["updated_at"] = task["updated_at"].isoformat()
        if task.get("due_date"):
            task["due_date"] = task["due_date"].isoformat()
    return json.dumps(tasks)


@mcp.tool()
async def update_task(
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
) -> str:
    """Update task details."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    update_dict: dict = {}
    if title is not None:
        update_dict["title"] = title.strip()
    if description is not None:
        update_dict["description"] = description.strip()
    if status is not None:
        update_dict["status"] = status
    if priority is not None:
        update_dict["priority"] = priority
    if due_date is not None:
        update_dict["due_date"] = datetime.fromisoformat(due_date)
    update_dict["updated_at"] = datetime.now(timezone.utc)

    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)}, {"$set": update_dict}
    )
    if result.matched_count == 0:
        return "Error: Task not found"
    return "Task updated successfully"


@mcp.tool()
async def delete_task(task_id: str) -> str:
    """Delete a task by its ID."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        return "Error: Task not found"
    return "Task deleted successfully"


# ---------------------------------------------------------------------------
# Note tools
# ---------------------------------------------------------------------------

@mcp.tool()
async def create_note(
    title: str,
    content: str,
    tags: Optional[List[str]] = None,
) -> str:
    """Create a new note in the database."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    note_dict = {
        "title": title.strip(),
        "content": content.strip(),
        "tags": [tag.strip() for tag in (tags or [])],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.notes.insert_one(note_dict)
    return f"Note created successfully with ID: {result.inserted_id}"


@mcp.tool()
async def read_all_notes() -> str:
    """Get all notes from the database."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    notes = await db.notes.find().to_list(length=100)
    for note in notes:
        note["_id"] = str(note["_id"])
        if note.get("created_at"):
            note["created_at"] = note["created_at"].isoformat()
        if note.get("updated_at"):
            note["updated_at"] = note["updated_at"].isoformat()
    return json.dumps(notes)


@mcp.tool()
async def update_note(
    note_id: str,
    title: Optional[str] = None,
    content: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> str:
    """Update a note."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    update_dict: dict = {}
    if title is not None:
        update_dict["title"] = title.strip()
    if content is not None:
        update_dict["content"] = content.strip()
    if tags is not None:
        update_dict["tags"] = [tag.strip() for tag in tags]
    update_dict["updated_at"] = datetime.now(timezone.utc)

    result = await db.notes.update_one(
        {"_id": ObjectId(note_id)}, {"$set": update_dict}
    )
    if result.matched_count == 0:
        return "Error: Note not found"
    return "Note updated successfully"


@mcp.tool()
async def delete_note(note_id: str) -> str:
    """Delete a note by its ID."""
    db = await ensure_db()
    if db is None:
        return "Error: Database not connected"

    result = await db.notes.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        return "Error: Note not found"
    return "Note deleted successfully"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    transport = os.getenv("MCP_TRANSPORT", "stdio").lower()

    if transport == "sse":
        # SSE mode — used on Cloud Run
        mcp.run(transport="sse")
    else:
        # stdio mode — used locally / with Claude Desktop
        mcp.run()
