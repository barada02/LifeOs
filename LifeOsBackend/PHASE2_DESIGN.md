# Phase 2: AI & MCP Integration - Architecture & Design

## Overview
Phase 2 implements the AI engine layer that allows the system to understand natural language requests and execute database operations via an MCP server.

---

## Architecture Components

### 1. **MCP Server** (`mcp_server.py`)
- **Purpose:** Exposes database operations as tools/resources that the AI can call
- **Framework:** `fast-mcp` (lightweight MCP server framework)
- **Tools Exposed:**
  - `create_task`: Create a new task
  - `read_task`: Retrieve a task by ID
  - `read_all_tasks`: Get all tasks
  - `update_task`: Update task details
  - `delete_task`: Remove a task
  - `create_note`: Create a new note
  - `read_note`: Retrieve a note by ID
  - `read_all_notes`: Get all notes
  - `update_note`: Update note details
  - `delete_note`: Remove a note

**Architecture Diagram:**
```
┌─────────────────────────────────────────┐
│         MCP Server (fast-mcp)           │
│  ┌─────────────────────────────────┐   │
│  │    Tool Definitions             │   │
│  │  - create_task                  │   │
│  │  - read_task, read_all_tasks    │   │
│  │  - update_task, delete_task     │   │
│  │  - create_note, read_note, etc. │   │
│  └─────────────────────────────────┘   │
│               ▼                         │
│  ┌─────────────────────────────────┐   │
│  │   Database Layer (motor)        │   │
│  │   - MongoDB operations          │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 2. **AI Client** (`ai_client.py`)
- **Purpose:** Manages communication with LLM and handles tool execution
- **Library:** `openai` (supports any OpenAI-compatible provider)
- **Features:**
  - Configurable provider via environment variables:
    - `AI_BASE_URL`: API endpoint (default: https://api.openai.com/v1)
    - `AI_MODEL`: Model name (e.g., gpt-4, gpt-3.5-turbo)
    - `AI_API_KEY`: API key for the provider
  - Maintains conversation context
  - Automatically calls MCP tools when needed
  - Returns final response to the user

**Flow Diagram:**
```
User Message
     ▼
┌─────────────────────────────────┐
│    AI Client                    │
│  - Send to LLM                  │
│  - Parse tool calls             │
│  - Execute via MCP              │
│  - Continue until final answer  │
│  - Return response              │
└─────────────────────────────────┘
     ▼
MCP Tool Results
     ▼
LLM Response
```

### 3. **Standalone Test Script** (`test_ai_mcp.py`)
- Tests MCP server and AI client independently
- No FastAPI dependency
- Tests:
  - MCP server initialization
  - AI client initialization
  - Tool calls (create task, get all tasks, etc.)
  - End-to-end conversation flows

### 4. **FastAPI Integration** (`main.py` - updated)
- New endpoint: `POST /chat`
- Takes user message, routes through AI client
- Triggers WebSocket events for UI updates

---

## Data Flow Diagram

```
┌─────────────┐
│  User Chat  │
│  Message    │
└──────┬──────┘
       ▼
┌─────────────────────────────────┐
│   FastAPI /chat Endpoint        │
└──────┬──────────────────────────┘
       ▼
┌──────────────────────────────────┐
│   AI Client                      │
│   - Send to LLM                  │
│   - Parse tool calls             │
└──────┬───────────────────────────┘
       │
       ├─────────────────────────────────────┐
       ▼                                     ▼
   Tool Call?                          Final Response
       │                                     │
       ▼                                     │
┌──────────────────────────────────┐        │
│   MCP Server Tools               │        │
│   - Execute DB operations        │        │
│   - Return results               │        │
└──────┬───────────────────────────┘        │
       │                                     │
       ▼                                     ▼
   Tool Results              ┌─────────────────────────────────┐
       │                     │  FastAPI Response               │
       └────────────────────→│  - AI answer                    │
                             │  - Tool call results            │
                             └──────────┬──────────────────────┘
                                        ▼
                          ┌──────────────────────────┐
                          │  WebSocket Event         │
                          │  - Notify UI of changes  │
                          └──────────────────────────┘
```

---

## Configuration

### Environment Variables
```
# AI Provider Configuration
AI_BASE_URL=https://api.openai.com/v1        # or any OpenAI-compatible provider
AI_MODEL=gpt-4                                 # Model name
AI_API_KEY=sk-xxxxxxxxxxxxxx                  # API key

# MCP Server Configuration
MCP_HOST=127.0.0.1
MCP_PORT=8001

# Existing configs
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=life_os_db
```

---

## New Dependencies

```
fast-mcp==0.x.x                    # MCP server framework
openai>=1.0.0                      # OpenAI library (compatible with any provider)
python-dotenv                      # Already installed, for env config
```

---

## Implementation Roadmap

1. **Update requirements.txt** - Add new dependencies
2. **Create `mcp_server.py`** - Define tools and tool handlers
3. **Create `ai_client.py`** - LLM client with tool execution
4. **Create `test_ai_mcp.py`** - Test both components
5. **Update `main.py`** - Add `/chat` endpoint
6. **Test locally** - Verify all components work
7. **Integrate with frontend** - WebSocket events on tool success

---

## Next Steps
- Proceed with implementation of each component
- Test MCP server independently
- Test AI client with mocked MCP
- Create comprehensive test script
- Integrate into FastAPI
