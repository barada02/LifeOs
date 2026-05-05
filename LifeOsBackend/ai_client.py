"""
AI Client for Life OS - Manages LLM communication and MCP tool execution

Uses OpenAI library to communicate with any OpenAI-compatible provider
and executes MCP tools based on the LLM's requests
"""

import os
import asyncio
import json
from typing import Optional, List, Dict, Any
from openai import AsyncOpenAI, OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AIClient:
    """
    AI Client that communicates with an LLM and executes MCP tools
    
    Supports any OpenAI-compatible provider (OpenAI, Azure, Local LLM, etc.)
    """
    
    def __init__(self, 
                 base_url: Optional[str] = None,
                 model: Optional[str] = None,
                 api_key: Optional[str] = None,
                 async_mode: bool = True):
        """
        Initialize the AI Client
        
        Args:
            base_url: LLM provider's base URL (e.g., https://api.openai.com/v1)
            model: Model name (e.g., gpt-4, gpt-3.5-turbo)
            api_key: API key for the provider
            async_mode: Use async client (default: True)
        """
        # Load from environment if not provided
        self.base_url = base_url or os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
        self.model = model or os.getenv("AI_MODEL", "gpt-4")
        self.api_key = api_key or os.getenv("AI_API_KEY")
        
        if not self.api_key:
            raise ValueError(
                "AI_API_KEY must be provided via parameter or AI_API_KEY environment variable"
            )
        
        # Initialize clients
        self.async_mode = async_mode
        if async_mode:
            self.async_client = AsyncOpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
        else:
            self.sync_client = OpenAI(
                base_url=self.base_url,
                api_key=self.api_key
            )
        
        # Store conversation history
        self.messages: List[Dict[str, str]] = []
        self.tools = []
        self._setup_tools()
    
    def _setup_tools(self):
        """Setup MCP tools for the LLM to use"""
        from mcp_server import mcp
        
        # Convert MCP tools to OpenAI tool format
        # This is a simplified version - in production you'd introspect MCP properly
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "create_task",
                    "description": "Create a new task in the database",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The task title"},
                            "description": {"type": "string", "description": "Detailed description"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "Task priority"},
                            "due_date": {"type": "string", "description": "Due date in ISO format"}
                        },
                        "required": ["title"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "read_all_tasks",
                    "description": "Get all tasks from the database",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update task details",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The task ID"},
                            "title": {"type": "string", "description": "New task title"},
                            "status": {"type": "string", "enum": ["todo", "in_progress", "done"], "description": "New status"},
                            "priority": {"type": "string", "enum": ["low", "medium", "high"], "description": "New priority"},
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The task ID"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "create_note",
                    "description": "Create a new note",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The note title"},
                            "content": {"type": "string", "description": "The note content"},
                            "tags": {"type": "array", "items": {"type": "string"}, "description": "Tags"}
                        },
                        "required": ["title", "content"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "read_all_notes",
                    "description": "Get all notes from the database",
                    "parameters": {
                        "type": "object",
                        "properties": {},
                        "required": []
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "update_note",
                    "description": "Update note details",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "note_id": {"type": "string", "description": "The note ID"},
                            "title": {"type": "string", "description": "New note title"},
                            "content": {"type": "string", "description": "New note content"},
                            "tags": {"type": "array", "items": {"type": "string"}, "description": "New tags"}
                        },
                        "required": ["note_id"]
                    }
                }
            },
            {
                "type": "function",
                "function": {
                    "name": "delete_note",
                    "description": "Delete a note",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "note_id": {"type": "string", "description": "The note ID"}
                        },
                        "required": ["note_id"]
                    }
                }
            }
        ]
    
    async def process_message_async(self, user_message: str) -> str:
        """
        Process a user message asynchronously and return AI response
        
        Args:
            user_message: The user's input message
        
        Returns:
            The AI's response
        """
        # Add user message to history
        self.messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Initial request to LLM
        response = await self.async_client.chat.completions.create(
            model=self.model,
            messages=self.messages,
            tools=self.tools,
            tool_choice="auto"
        )
        
        # Process response in a loop (tool calls may lead to more requests)
        while response.choices[0].finish_reason == "tool_calls":
            # Get the tool calls from the response
            tool_calls = response.choices[0].message.tool_calls
            
            # Add assistant's response to history
            self.messages.append({
                "role": "assistant",
                "content": response.choices[0].message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in tool_calls
                ]
            })
            
            # Execute each tool call
            tool_results = []
            for tool_call in tool_calls:
                result = await self._execute_tool(
                    tool_call.function.name,
                    json.loads(tool_call.function.arguments)
                )
                tool_results.append({
                    "tool_use_id": tool_call.id,
                    "content": json.dumps(result)
                })
            
            # Add tool results to history
            self.messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tr["tool_use_id"],
                        "content": tr["content"]
                    }
                    for tr in tool_results
                ]
            })
            
            # Continue conversation
            response = await self.async_client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                tools=self.tools,
                tool_choice="auto"
            )
        
        # Extract and return final response
        final_response = response.choices[0].message.content or "I couldn't process that request."
        
        # Add assistant's final response to history
        self.messages.append({
            "role": "assistant",
            "content": final_response
        })
        
        return final_response
    
    def process_message(self, user_message: str) -> str:
        """
        Process a user message synchronously and return AI response
        
        Args:
            user_message: The user's input message
        
        Returns:
            The AI's response
        """
        # Add user message to history
        self.messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Initial request to LLM
        response = self.sync_client.chat.completions.create(
            model=self.model,
            messages=self.messages,
            tools=self.tools,
            tool_choice="auto"
        )
        
        # Process response in a loop (tool calls may lead to more requests)
        while response.choices[0].finish_reason == "tool_calls":
            # Get the tool calls from the response
            tool_calls = response.choices[0].message.tool_calls
            
            # Add assistant's response to history
            self.messages.append({
                "role": "assistant",
                "content": response.choices[0].message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments
                        }
                    }
                    for tc in tool_calls
                ]
            })
            
            # Execute each tool call
            tool_results = []
            for tool_call in tool_calls:
                result = self._execute_tool_sync(
                    tool_call.function.name,
                    json.loads(tool_call.function.arguments)
                )
                tool_results.append({
                    "tool_use_id": tool_call.id,
                    "content": json.dumps(result)
                })
            
            # Add tool results to history
            self.messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tr["tool_use_id"],
                        "content": tr["content"]
                    }
                    for tr in tool_results
                ]
            })
            
            # Continue conversation
            response = self.sync_client.chat.completions.create(
                model=self.model,
                messages=self.messages,
                tools=self.tools,
                tool_choice="auto"
            )
        
        # Extract and return final response
        final_response = response.choices[0].message.content or "I couldn't process that request."
        
        # Add assistant's final response to history
        self.messages.append({
            "role": "assistant",
            "content": final_response
        })
        
        return final_response
    
    async def _execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool call asynchronously"""
        # Import here to avoid circular imports
        from mcp_server import (
            create_task, read_all_tasks, update_task, delete_task,
            create_note, read_all_notes, update_note, delete_note
        )
        
        # Tool mapping
        tools_map = {
            "create_task": create_task,
            "read_all_tasks": read_all_tasks,
            "update_task": update_task,
            "delete_task": delete_task,
            "create_note": create_note,
            "read_all_notes": read_all_notes,
            "update_note": update_note,
            "delete_note": delete_note,
        }
        
        if tool_name not in tools_map:
            return {"error": f"Unknown tool: {tool_name}"}
        
        try:
            # Call the tool
            result = tools_map[tool_name](**arguments)
            
            # If tool requires async (database operation), we'll need to handle it
            # For now, return the result
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def _execute_tool_sync(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool call synchronously"""
        # Import here to avoid circular imports
        from mcp_server import (
            create_task, read_all_tasks, update_task, delete_task,
            create_note, read_all_notes, update_note, delete_note
        )
        
        # Tool mapping
        tools_map = {
            "create_task": create_task,
            "read_all_tasks": read_all_tasks,
            "update_task": update_task,
            "delete_task": delete_task,
            "create_note": create_note,
            "read_all_notes": read_all_notes,
            "update_note": update_note,
            "delete_note": delete_note,
        }
        
        if tool_name not in tools_map:
            return {"error": f"Unknown tool: {tool_name}"}
        
        try:
            # Call the tool
            result = tools_map[tool_name](**arguments)
            
            # Return the result
            return result
        except Exception as e:
            return {"error": str(e)}
    
    def clear_history(self):
        """Clear conversation history"""
        self.messages = []
    
    def get_config(self) -> Dict[str, str]:
        """Get current configuration"""
        return {
            "base_url": self.base_url,
            "model": self.model,
            "api_key": "***" + self.api_key[-4:] if self.api_key else "Not set"
        }


# Convenience function for sync usage
def create_ai_client(
    base_url: Optional[str] = None,
    model: Optional[str] = None,
    api_key: Optional[str] = None
) -> AIClient:
    """Create an AI client instance"""
    return AIClient(base_url=base_url, model=model, api_key=api_key, async_mode=False)


# Convenience function for async usage
def create_async_ai_client(
    base_url: Optional[str] = None,
    model: Optional[str] = None,
    api_key: Optional[str] = None
) -> AIClient:
    """Create an async AI client instance"""
    return AIClient(base_url=base_url, model=model, api_key=api_key, async_mode=True)
