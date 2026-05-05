# 🚀 Quick Reference - Phase 2 Implementation

## Essential Commands

### Setup
```bash
# Install dependencies
pip install -r LifeOsBackend/requirements.txt

# Create .env file
cd LifeOsBackend
echo AI_API_KEY=your_key > .env

# Run tests
python Tests/test_ai_mcp.py

# Start backend
python LifeOsBackend/main.py
```

### Testing the Chat API
```bash
# Create a task via AI
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task called Buy milk"}'

# Get all tasks via AI
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}'

# Check configuration
curl "http://localhost:8000/chat/config"

# Reset conversation
curl -X POST "http://localhost:8000/chat/reset"
```

---

## Environment Variables

```env
# Required
AI_API_KEY=sk-your-api-key

# Optional (defaults shown)
AI_MODEL=gpt-4
AI_BASE_URL=https://api.openai.com/v1

# Database (existing)
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=life_os_db
```

---

## LLM Providers Quick Setup

### OpenAI
```env
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4
AI_API_KEY=sk-...
```

### Azure OpenAI
```env
AI_BASE_URL=https://your-instance.openai.azure.com/v1
AI_MODEL=your-deployment
AI_API_KEY=your-key
```

### Local LLM (LM Studio)
```env
AI_BASE_URL=http://localhost:1234/v1
AI_MODEL=local-model
AI_API_KEY=not-needed
```

---

## Project Structure

```
LifeOs/
├── plan.md
├── PHASE2_SUMMARY.md                    # ← This document
├── LifeOsBackend/
│   ├── main.py                          # FastAPI + new /chat endpoints
│   ├── database.py                      # MongoDB (unchanged)
│   ├── schemas.py                       # Pydantic models (unchanged)
│   ├── requirements.txt                 # Updated with Phase 2 deps
│   ├── mcp_server.py                    # ✨ NEW: MCP tools
│   ├── ai_client.py                     # ✨ NEW: AI client
│   ├── .env                             # ← Create this!
│   ├── PHASE2_DESIGN.md                 # ✨ NEW: Architecture docs
│   └── PHASE2_IMPLEMENTATION_GUIDE.md   # ✨ NEW: Setup guide
├── LifeOsUI/
│   └── (React frontend - unchanged)
└── Tests/
    └── test_ai_mcp.py                   # ✨ NEW: Test suite
```

---

## New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/chat` | POST | Send message to AI |
| `/chat/config` | GET | View AI configuration |
| `/chat/reset` | POST | Clear conversation history |

---

## MCP Tools Available

### Tasks (5 tools)
- `create_task` - Create new task
- `read_all_tasks` - Get all tasks
- `update_task` - Update task
- `delete_task` - Delete task

### Notes (5 tools)
- `create_note` - Create new note
- `read_all_notes` - Get all notes
- `update_note` - Update note
- `delete_note` - Delete note

---

## Example Usage

### In Python
```python
from ai_client import create_ai_client

client = create_ai_client()
response = client.process_message("Create a task called TODO list")
print(response)  # AI's response

# Clear history
client.clear_history()
```

### In Bash
```bash
# Create task
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a task"}'

# Get tasks
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Show all tasks"}'

# Create note
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Create a note about meeting"}'
```

---

## Testing

### Run Full Test Suite
```bash
python Tests/test_ai_mcp.py
```

### Expected Output
```
============================================================
  LIFE OS PHASE 2 - TEST SUITE
============================================================

✓ PASS: Import MCP server
✓ PASS: MCP server initialized
✓ PASS: Execute create_task tool
...
Total Tests:  10
Passed:       10
Failed:       0

✓ All tests passed!
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `AI_API_KEY not set` | Create .env with API key |
| `ModuleNotFoundError: fast_mcp` | Run `pip install -r requirements.txt` |
| `Cannot connect to MongoDB` | Ensure MongoDB is running |
| Chat returns generic error | Run test suite to diagnose |
| Tools not working | Check `/chat/config` endpoint |

---

## Key Files to Review

1. **PHASE2_SUMMARY.md** - Overview of what was built
2. **PHASE2_DESIGN.md** - Architecture details
3. **PHASE2_IMPLEMENTATION_GUIDE.md** - Detailed setup instructions
4. **main.py** - See new /chat endpoints
5. **mcp_server.py** - Tool definitions
6. **ai_client.py** - AI integration logic
7. **test_ai_mcp.py** - Test examples

---

## Next Phase (Phase 3)

- [ ] Add WebSocket for real-time updates
- [ ] Create React chat UI component
- [ ] Connect frontend to /chat endpoint
- [ ] Display AI tool calls in UI
- [ ] Real-time task/note updates

---

## Dependencies Overview

**Phase 2 Added:**
- `fast-mcp` - MCP server
- `openai` - LLM client
- `httpx` - Async HTTP

**Phase 1 (Already Installed):**
- FastAPI, uvicorn
- MongoDB (motor)
- Pydantic

---

## Performance Tips

1. **Reuse AI Client** - Don't create new instance each request
2. **Conversation Context** - Keep relevant messages only
3. **Tool Caching** - Already done automatically
4. **Provider Selection** - Choose model based on speed/quality needs

---

## Security Checklist

- [ ] .env is in .gitignore
- [ ] API keys never committed to git
- [ ] Change CORS origins for production
- [ ] Add authentication to endpoints
- [ ] Use HTTPS in production
- [ ] Validate user input

---

## Documentation Links

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [OpenAI Python Docs](https://github.com/openai/openai-python)
- [MCP Specification](https://modelcontextprotocol.io/)
- [Motor (Async MongoDB)](https://motor.readthedocs.io/)

---

## Support Resources

**If stuck:**
1. Check PHASE2_IMPLEMENTATION_GUIDE.md (detailed setup)
2. Run test suite: `python Tests/test_ai_mcp.py`
3. Check chat config: `curl http://localhost:8000/chat/config`
4. Review inline code comments
5. Check MongoDB connection

---

**Phase 2: Complete! Ready for Phase 3 (Frontend Integration)**
