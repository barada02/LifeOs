# Skill: Integrating UniMCP with FastAPI

## Description
This skill outlines the pattern for integrating the `unimcp` library (MCP Client and LLM orchestration) into a FastAPI server. This allows AI agents and coding tools to quickly build web-based chat interfaces connected to MCP servers.

## Key Concepts

1. **Async Lifespan Management (`startup` / `shutdown`)**
   Use FastAPI's `@asynccontextmanager` to ensure the `UniClient` connects to the MCP server when the HTTP server starts, and safely disconnects when it stops. 

2. **Persistent State**
   Because chat sessions are stateful, you must store the `UniClient`, `UniLLM`, and `Session` objects in an application-level state (like a global dictionary) so they persist across multiple API requests.

3. **Non-blocking Endpoints**
   FastAPI endpoints (`@app.post`) must be `async` to accommodate `unimcp`'s asynchronous LLM calls (`await llm.chat()`).

## Implementation Template

```python
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from unimcp import UniClient, UniLLM

# 1. Global state for MCP/LLM singletons
app_state = {}

# 2. Manage connection lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    client = UniClient()
    await client.connect()
    
    llm = UniLLM(mcp_client=client)
    session = llm.create_session(
        name="FastAPISession", 
        system_prompt="You are a helpful assistant."
    )
    
    app_state.update({"client": client, "llm": llm, "session": session})
    
    yield # Server is running
    
    await client.disconnect()

app = FastAPI(lifespan=lifespan)

# 3. Define the Request Body
class ChatRequest(BaseModel):
    message: str

# 4. Async Chat Endpoint
@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    llm = app_state.get("llm")
    session = app_state.get("session")
    
    if not llm or not session:
        raise HTTPException(status_code=500, detail="Not initialized.")
        
    # Standard LLM tool orchestration loop
    response = await llm.chat(req.message, session=session)
    return {"response": response}
```

## Best Practices
- **Port Conflicts:** Ensure the FastAPI server runs on a different port (e.g., `8001`) than the underlying MCP server (often `8000`).
- **CORS:** Include `CORSMiddleware` if the frontend UI is hosted separately or on a different port.
