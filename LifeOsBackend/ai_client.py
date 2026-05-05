import asyncio
import os
import json
from dotenv import load_dotenv
from openai import AsyncOpenAI
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters
from typing import Optional, Dict
import sys

load_dotenv()

class AIClient:
    def __init__(self, async_mode: bool = True):
        self.openai_client = AsyncOpenAI(
            api_key=os.getenv("AI_API_KEY"),
            base_url=os.getenv("AI_BASE_URL")
        )
        self.model = os.getenv("AI_MODEL", "gpt-4o")
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
        try:
            # Start Stdio client connection wrapper to the local fastmcp server
            # For a true production system, you'd keep the session open.
            # Here we connect, execute, and disconnect.
            server_path = os.path.join(os.path.dirname(__file__), "mcp_server.py")
            server_params = StdioServerParameters(
                command=sys.executable,
                args=[server_path]
            )
            async with stdio_client(server_params) as (read_stream, write_stream):
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
        except Exception as e:
            print(f"Error in process_message_async: {e}", file=sys.stderr)
            raise e

    def process_message(self, user_message: str) -> str:
        # Provide sync version backward compatibility by using asyncio.run
        return asyncio.run(self.process_message_async(user_message))

def create_async_ai_client():
    return AIClient(async_mode=True)

def create_ai_client():
    return AIClient(async_mode=False)
