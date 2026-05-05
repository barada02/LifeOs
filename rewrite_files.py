import typing

with open('LifeOsBackend/mcp_server.py', 'w', encoding='utf-8') as f:
    f.write('''from fastmcp import FastMCP
from bson import ObjectId
from datetime import datetime, timezone
from typing import Optional, List
import json
from database import get_database

mcp = FastMCP("Life OS AI Tools")

@mcp.tool()
async def create_task(title: str, description: Optional[str] = None, priority: str = "medium", due_date: Optional[str] = None) -> str:
    """Create a new task in the database"""
    if not title or not title.strip():
        return "Error: Task title is required"
    
    db = get_database()
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
    return str(f"Task created successfully with ID: {result.inserted_id}")

@mcp.tool()
async def read_all_tasks() -> str:
    """Get all tasks from the database"""
    db = get_database()
    if db is None:
        return "Error: Database not connected"
        
    tasks = await db.tasks.find().to_list(length=100)
    for task in tasks:
        task["_id"] = str(task["_id"])
        if task.get("created_at"): task["created_at"] = task["created_at"].isoformat()
        if task.get("updated_at"): task["updated_at"] = task["updated_at"].isoformat()
        if task.get("due_date"): task["due_date"] = task["due_date"].isoformat()
    return json.dumps(tasks)

@mcp.tool()
async def update_task(task_id: str, title: Optional[str] = None, description: Optional[str] = None, 
                status: Optional[str] = None, priority: Optional[str] = None, 
                due_date: Optional[str] = None) -> str:
    """Update task details"""
    db = get_database()
    
    update_dict = {}
    if title is not None: update_dict["title"] = title.strip()
    if description is not None: update_dict["description"] = description.strip()
    if status is not None: update_dict["status"] = status
    if priority is not None: update_dict["priority"] = priority
    if due_date is not None: update_dict["due_date"] = datetime.fromisoformat(due_date)
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_dict})
    if result.matched_count == 0:
        return "Error: Task not found"
    return "Task updated successfully"

@mcp.tool()
async def delete_task(task_id: str) -> str:
    """Delete a task"""
    db = get_database()
    result = await db.tasks.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        return "Error: Task not found"
    return "Task deleted successfully"

@mcp.tool()
async def create_note(title: str, content: str, tags: Optional[List[str]] = None) -> str:
    """Create a new note in the database"""
    db = get_database()
    note_dict = {
        "title": title.strip(),
        "content": content.strip(),
        "tags": [tag.strip() for tag in (tags or [])],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = await db.notes.insert_one(note_dict)
    return str(f"Note created successfully with ID: {result.inserted_id}")

@mcp.tool()
async def read_all_notes() -> str:
    """Get all notes from the database"""
    db = get_database()
    notes = await db.notes.find().to_list(length=100)
    for note in notes:
        note["_id"] = str(note["_id"])
        if note.get("created_at"): note["created_at"] = note["created_at"].isoformat()
        if note.get("updated_at"): note["updated_at"] = note["updated_at"].isoformat()
    return json.dumps(notes)

@mcp.tool()
async def update_note(note_id: str, title: Optional[str] = None, content: Optional[str] = None, tags: Optional[List[str]] = None) -> str:
    """Update a note"""
    db = get_database()
    update_dict = {}
    if title is not None: update_dict["title"] = title.strip()
    if content is not None: update_dict["content"] = content.strip()
    if tags is not None: update_dict["tags"] = [tag.strip() for tag in tags]
    update_dict["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": update_dict})
    if result.matched_count == 0:
        return "Error: Note not found"
    return "Note updated successfully"

@mcp.tool()
async def delete_note(note_id: str) -> str:
    """Delete a note"""
    db = get_database()
    result = await db.notes.delete_one({"_id": ObjectId(note_id)})
    if result.deleted_count == 0:
        return "Error: Note not found"
    return "Note deleted successfully"

def get_mcp_server():
    return mcp
''')

with open('LifeOsBackend/ai_client.py', 'w', encoding='utf-8') as f:
    f.write('''import asyncio
import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from mcp import ClientSession
from mcp.client.sse import sse_client
from typing import Optional, Dict

load_dotenv()

class AIClient:
    def __init__(self, async_mode: bool = True):
        self.openai_client = AsyncOpenAI()
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.messages = []
        self.system_prompt = (
            "You are a helpful assistant hooked up to an external database. "
            "You MUST use your provided tools to save user preferences, personal details, and contacts. "
            "Whenever the user mentions a fact about themselves or a friend, immediately call the appropriate tool."
        )

    def clear_history(self):
        self.messages = []

    def get_config(self) -> Dict[str, str]:
        return {
            "model": self.model,
            "api_key": "***" + str(self.openai_client.api_key)[-4:] if self.openai_client.api_key else "Not set"
        }

    def convert_mcp_to_openai_tools(self, mcp_tools) -> list:
        openai_tools = []
        for tool in mcp_tools:
            openai_tools.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": str(tool.description),
                    "parameters": tool.inputSchema
                }
            })
        return openai_tools

    async def process_message_async(self, user_message: str) -> str:
        # Start SSE client connection wrapper to the local fastmcp server
        # For a true production system, you'd keep the session open.
        # Here we connect, execute, and disconnect.
        async with sse_client(url="http://localhost:8000/sse") as (read_stream, write_stream):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                tools_response = await session.list_tools()
                available_openai_tools = self.convert_mcp_to_openai_tools(tools_response.tools)
                
                if not self.messages:
                    self.messages.append({
                        "role": "system", 
                        "content": self.system_prompt + f" You have [{len(available_openai_tools)}] tools available."
                    })
                    
                self.messages.append({"role": "user", "content": user_message})

                while True:
                    response = await self.openai_client.chat.completions.create(
                        model=self.model,
                        messages=self.messages,
                        tools=available_openai_tools,
                        tool_choice="auto"
                    )
                    
                    response_message = response.choices[0].message
                    self.messages.append(response_message)
                
                    if response_message.tool_calls:
                        for tool_call in response_message.tool_calls:
                            tool_name = tool_call.function.name
                            tool_args = json.loads(tool_call.function.arguments)
                            
                            result = await session.call_tool(tool_name, arguments=tool_args)
                            
                            tool_result_str = ""
                            for content in result.content:
                                if content.type == "text":
                                    tool_result_str += content.text
                                    
                            self.messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "name": tool_name,
                                "content": tool_result_str
                            })
                    else:
                        return str(response_message.content)

    def process_message(self, user_message: str) -> str:
        # Provide sync version backward compatibility by using asyncio.run
        return asyncio.run(self.process_message_async(user_message))

def create_async_ai_client():
    return AIClient(async_mode=True)

def create_ai_client():
    return AIClient(async_mode=False)
''')
