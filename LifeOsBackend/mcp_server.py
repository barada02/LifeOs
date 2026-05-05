"""
MCP Server for Life OS - Exposes database operations as tools

Uses fast-mcp to provide tools for task and note management
"""

from fastmcp import FastMCP
from fastmcp.resources import Resource
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import json


# Initialize the MCP server
mcp = FastMCP("Life OS AI Tools")


# ==========================================
# Task Tools
# ==========================================

@mcp.tool()
def create_task(title: str, description: Optional[str] = None, priority: str = "medium", due_date: Optional[str] = None) -> dict:
    """
    Create a new task in the database
    
    Args:
        title: The task title (required)
        description: Detailed description of the task
        priority: Task priority - low, medium, or high (default: medium)
        due_date: When the task is due (ISO format: YYYY-MM-DDTHH:MM:SS)
    
    Returns:
        Created task with ID
    """
    # Import here to avoid circular imports
    from database import get_database
    
    if not title or not title.strip():
        return {"error": "Task title is required and cannot be empty"}
    
    if priority not in ["low", "medium", "high"]:
        priority = "medium"
    
    task_dict = {
        "title": title.strip(),
        "description": description.strip() if description else None,
        "status": "todo",
        "priority": priority,
        "due_date": datetime.fromisoformat(due_date) if due_date else None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    # This will be async, but for MCP tool compatibility we use sync wrapper
    # The actual async call will be handled by the AI client
    return {"task": task_dict, "_requires_async": True, "_operation": "create_task"}


@mcp.tool()
def read_task(task_id: str) -> dict:
    """
    Retrieve a task by ID
    
    Args:
        task_id: The MongoDB ObjectId of the task
    
    Returns:
        Task details
    """
    if not task_id:
        return {"error": "Task ID is required"}
    
    return {"task_id": task_id, "_requires_async": True, "_operation": "read_task"}


@mcp.tool()
def read_all_tasks() -> dict:
    """
    Get all tasks from the database
    
    Returns:
        List of all tasks
    """
    return {"_requires_async": True, "_operation": "read_all_tasks"}


@mcp.tool()
def update_task(task_id: str, title: Optional[str] = None, description: Optional[str] = None, 
                status: Optional[str] = None, priority: Optional[str] = None, 
                due_date: Optional[str] = None) -> dict:
    """
    Update task details
    
    Args:
        task_id: The MongoDB ObjectId of the task
        title: New task title
        description: New task description
        status: New status - todo, in_progress, or done
        priority: New priority - low, medium, or high
        due_date: New due date (ISO format)
    
    Returns:
        Updated task
    """
    if not task_id:
        return {"error": "Task ID is required"}
    
    if status and status not in ["todo", "in_progress", "done"]:
        return {"error": f"Invalid status: {status}. Must be: todo, in_progress, or done"}
    
    if priority and priority not in ["low", "medium", "high"]:
        return {"error": f"Invalid priority: {priority}. Must be: low, medium, or high"}
    
    update_dict = {}
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
    
    return {"task_id": task_id, "updates": update_dict, "_requires_async": True, "_operation": "update_task"}


@mcp.tool()
def delete_task(task_id: str) -> dict:
    """
    Delete a task
    
    Args:
        task_id: The MongoDB ObjectId of the task
    
    Returns:
        Confirmation of deletion
    """
    if not task_id:
        return {"error": "Task ID is required"}
    
    return {"task_id": task_id, "_requires_async": True, "_operation": "delete_task"}


# ==========================================
# Note Tools
# ==========================================

@mcp.tool()
def create_note(title: str, content: str, tags: Optional[List[str]] = None) -> dict:
    """
    Create a new note in the database
    
    Args:
        title: The note title (required)
        content: The note content - markdown or plain text (required)
        tags: List of tags for categorization
    
    Returns:
        Created note with ID
    """
    if not title or not title.strip():
        return {"error": "Note title is required and cannot be empty"}
    
    if not content or not content.strip():
        return {"error": "Note content is required and cannot be empty"}
    
    note_dict = {
        "title": title.strip(),
        "content": content.strip(),
        "tags": [tag.strip() for tag in (tags or [])] if tags else [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    
    return {"note": note_dict, "_requires_async": True, "_operation": "create_note"}


@mcp.tool()
def read_note(note_id: str) -> dict:
    """
    Retrieve a note by ID
    
    Args:
        note_id: The MongoDB ObjectId of the note
    
    Returns:
        Note details
    """
    if not note_id:
        return {"error": "Note ID is required"}
    
    return {"note_id": note_id, "_requires_async": True, "_operation": "read_note"}


@mcp.tool()
def read_all_notes() -> dict:
    """
    Get all notes from the database
    
    Returns:
        List of all notes
    """
    return {"_requires_async": True, "_operation": "read_all_notes"}


@mcp.tool()
def update_note(note_id: str, title: Optional[str] = None, content: Optional[str] = None, 
                tags: Optional[List[str]] = None) -> dict:
    """
    Update note details
    
    Args:
        note_id: The MongoDB ObjectId of the note
        title: New note title
        content: New note content
        tags: New list of tags
    
    Returns:
        Updated note
    """
    if not note_id:
        return {"error": "Note ID is required"}
    
    update_dict = {}
    if title is not None:
        update_dict["title"] = title.strip()
    if content is not None:
        update_dict["content"] = content.strip()
    if tags is not None:
        update_dict["tags"] = [tag.strip() for tag in tags]
    
    return {"note_id": note_id, "updates": update_dict, "_requires_async": True, "_operation": "update_note"}


@mcp.tool()
def delete_note(note_id: str) -> dict:
    """
    Delete a note
    
    Args:
        note_id: The MongoDB ObjectId of the note
    
    Returns:
        Confirmation of deletion
    """
    if not note_id:
        return {"error": "Note ID is required"}
    
    return {"note_id": note_id, "_requires_async": True, "_operation": "delete_note"}


# ==========================================
# Utility
# ==========================================

def get_mcp_server():
    """Get the MCP server instance"""
    return mcp


if __name__ == "__main__":
    # This allows running the MCP server standalone for testing
    print("Life OS MCP Server initialized with the following tools:")
    for tool_name in ["create_task", "read_task", "read_all_tasks", "update_task", "delete_task",
                      "create_note", "read_note", "read_all_notes", "update_note", "delete_note"]:
        print(f"  - {tool_name}")
