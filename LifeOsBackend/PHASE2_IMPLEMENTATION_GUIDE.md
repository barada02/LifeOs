# Phase 2 Implementation Guide - MCP Server & AI Layer

## 📋 Overview

Phase 2 has been successfully implemented! This guide covers:
- Setting up the new dependencies
- Configuring the AI provider
- Testing the MCP server and AI client
- Running the integrated FastAPI backend
- Integrating with the frontend

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd LifeOsBackend
pip install -r requirements.txt
```

**New Phase 2 Dependencies:**
- `fast-mcp==0.7.0` - MCP server framework
- `openai>=1.3.0` - OpenAI-compatible LLM client (works with any provider)
- `httpx>=0.25.0` - Async HTTP support

### 2. Configure Environment Variables

Create a `.env` file in the `LifeOsBackend/` directory:

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=life_os_db

# AI Provider Configuration (supports any OpenAI-compatible provider)
AI_BASE_URL=https://api.openai.com/v1        # Change for different providers
AI_MODEL=gpt-4                                 # or gpt-3.5-turbo, claude, etc.
AI_API_KEY=your_api_key_here                  # Required!
```

**Supported Providers:**
- OpenAI: `https://api.openai.com/v1`
- Azure OpenAI: `https://<instance>.openai.azure.com/v1`
- Local LLM (LM Studio): `http://localhost:1234/v1`
- Any other OpenAI-compatible API

---

## 🧪 Testing

### Phase 2 Comprehensive Test Script

Run the standalone test suite:

```bash
cd Tests
python test_ai_mcp.py
```

**Test Coverage:**
1. ✓ MCP server import and initialization
2. ✓ MCP tool definitions and execution
3. ✓ AI client import and setup
4. ✓ AI client initialization
5. ✓ Tool registration in AI client
6. ✓ Conversation history management
7. ✓ Tool-AI integration
8. ✓ Environment variable configuration
9. ✓ End-to-end async flow (with API credentials)

**Expected Output:**
```
============================================================
  LIFE OS PHASE 2 - TEST SUITE
  MCP Server & AI Client Validation
============================================================

✓ PASS: Import MCP server
✓ PASS: MCP server initialized
✓ PASS: Execute create_task tool
...
[Test Results Summary]
Total Tests:  10
Passed:       10
Failed:       0
Skipped:      0

✓ All tests passed!
```

---

## 🤖 Using the AI Chat Endpoint

### Endpoint: `POST /chat`

The FastAPI backend now includes an AI chat endpoint that can:
- Process natural language requests
- Execute database operations via MCP tools
- Maintain conversation context
- Return AI-generated responses

### Example Requests

**Request:**
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a task called Buy groceries with high priority",
    "use_async": false
  }'
```

**Response:**
```json
{
  "response": "I've created a high-priority task called 'Buy groceries' for you. It's been added to your task list.",
  "status": "success",
  "tool_calls": null
}
```

### More Examples

```bash
# Get all tasks
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}'

# Create a note
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a note about the team meeting with tags: meeting, important"}'

# Update task status
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Mark my first task as done"}'
```

### Additional Chat Endpoints

**Get Chat Configuration:**
```bash
curl "http://localhost:8000/chat/config"
```

Response:
```json
{
  "status": "configured",
  "config": {
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4",
    "api_key": "***xxxxx"
  },
  "available_tools": [
    "create_task",
    "read_all_tasks",
    "update_task",
    "delete_task",
    "create_note",
    "read_all_notes",
    "update_note",
    "delete_note"
  ]
}
```

**Reset Conversation History:**
```bash
curl -X POST "http://localhost:8000/chat/reset"
```

---

## 🏃 Running the Backend

### Development Mode (with reload)

```bash
cd LifeOsBackend
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

---

## 📁 Project Structure

```
LifeOsBackend/
├── main.py                    # FastAPI app with new /chat endpoint
├── database.py               # MongoDB connection (unchanged)
├── schemas.py                # Pydantic models (unchanged)
├── requirements.txt          # Updated with Phase 2 dependencies
├── mcp_server.py            # ✨ NEW: MCP server with tools
├── ai_client.py             # ✨ NEW: AI client with OpenAI
└── PHASE2_DESIGN.md         # Design documentation

Tests/
└── test_ai_mcp.py           # ✨ NEW: Comprehensive test suite
```

---

## 🔧 Component Overview

### 1. MCP Server (`mcp_server.py`)

Defines 10 tools for the AI to use:

**Task Tools:**
- `create_task` - Create new task
- `read_task` - Get task by ID
- `read_all_tasks` - Get all tasks
- `update_task` - Update task details
- `delete_task` - Delete task

**Note Tools:**
- `create_note` - Create new note
- `read_note` - Get note by ID
- `read_all_notes` - Get all notes
- `update_note` - Update note details
- `delete_note` - Delete note

### 2. AI Client (`ai_client.py`)

**Features:**
- Configurable LLM provider (OpenAI-compatible)
- Automatic tool calling and execution
- Conversation history management
- Sync and async support
- Proper error handling

**Usage:**

```python
from ai_client import create_ai_client

# Create client (reads from environment)
client = create_ai_client()

# Process a message
response = client.process_message("Create a task called 'Buy milk'")
print(response)  # "I've created a task for you..."

# Clear history
client.clear_history()
```

### 3. FastAPI Integration (`main.py`)

**New Endpoints:**
- `POST /chat` - Main chat endpoint
- `GET /chat/config` - View configuration
- `POST /chat/reset` - Reset conversation

---

## 🐛 Troubleshooting

### "AI_API_KEY not set" Error

**Problem:** Chat endpoint returns configuration error

**Solution:**
```bash
# Create .env file with your API key
echo "AI_API_KEY=sk-your-key-here" >> LifeOsBackend/.env

# Or set environment variable
export AI_API_KEY=sk-your-key-here  # Linux/Mac
set AI_API_KEY=sk-your-key-here     # Windows CMD
$env:AI_API_KEY="sk-your-key-here"  # Windows PowerShell
```

### "Module not found" Errors

**Problem:** `ModuleNotFoundError: No module named 'fast_mcp'`

**Solution:**
```bash
pip install -r LifeOsBackend/requirements.txt --force-reinstall
```

### Chat Returns Generic Error

**Problem:** "Error processing chat message"

**Solution:**
1. Check `.env` file exists and has valid API key
2. Verify MongoDB is running
3. Run test script to diagnose: `python Tests/test_ai_mcp.py`
4. Check logs for detailed error messages

---

## 🔄 Next Steps: Frontend Integration

Once the backend is working:

1. **WebSocket Integration** (Phase 3)
   - Real-time UI updates when AI modifies data
   - Live task/note changes reflected instantly

2. **Chat UI Component** (Phase 3)
   - Message input and display
   - Visual feedback for AI tool calls
   - Conversation history

3. **Testing Integration**
   - Frontend -> Backend API calls
   - Frontend -> Backend Chat endpoint
   - Frontend <- WebSocket events

---

## 📚 Files Modified/Created

**Created:**
- ✨ `LifeOsBackend/mcp_server.py` - MCP server with 10 tools
- ✨ `LifeOsBackend/ai_client.py` - AI client with OpenAI integration
- ✨ `LifeOsBackend/PHASE2_DESIGN.md` - Architecture design
- ✨ `Tests/test_ai_mcp.py` - Comprehensive test suite

**Modified:**
- 📝 `LifeOsBackend/main.py` - Added /chat endpoints
- 📝 `LifeOsBackend/requirements.txt` - Added Phase 2 dependencies

**Unchanged:**
- `LifeOsBackend/database.py` - MongoDB layer
- `LifeOsBackend/schemas.py` - Pydantic models
- `LifeOsUI/` - Frontend (ready for integration)

---

## 🎯 Key Features

✅ **Modular Architecture**
- MCP server and AI client are independent
- Easy to swap LLM providers
- Can test components separately

✅ **Provider-Agnostic**
- Works with OpenAI, Azure, Local LLMs
- Just change environment variables
- Supports any OpenAI-compatible API

✅ **Tool-Based Integration**
- AI understands database operations
- Can execute tools automatically
- Results fed back to LLM for context

✅ **Comprehensive Testing**
- 10+ test cases included
- Validates each component
- Clear error messages

✅ **Production-Ready**
- Error handling
- Configuration management
- Logging support (ready to add)

---

## 💡 Usage Tips

1. **Test Before Deploying**
   ```bash
   python Tests/test_ai_mcp.py
   ```

2. **Monitor AI Responses**
   - Check `/chat/config` to verify setup
   - Start with simple requests
   - Gradually test complex scenarios

3. **Manage Conversation Context**
   - Conversation history persists across requests
   - Use `/chat/reset` to clear if needed
   - Consider context length for long conversations

4. **Scalability Considerations**
   - AI client stores history in memory
   - Consider database-backed conversation storage
   - Cache tool definitions if needed

---

## 🚀 Phase 2 Complete!

Phase 2 is now ready for testing and integration. All components are implemented and tested:

- ✅ MCP server with database tools
- ✅ AI client with OpenAI integration
- ✅ FastAPI endpoints for chat
- ✅ Comprehensive test suite
- ✅ Updated dependencies

**Next: Test the implementation and prepare for Phase 3 (Frontend Integration)!**
