# Life OS MCP Server

A self-contained **FastMCP** server that exposes Task and Note management tools over **SSE** (HTTP) for Cloud Run, or **stdio** for local / Claude Desktop usage.

---

## Directory structure

```
mcpserver/
├── mcp_server.py     # All MCP tools (tasks + notes)
├── database.py       # MongoDB connection helper
├── requirements.txt  # Python dependencies
├── Dockerfile        # Cloud Run container image
├── .env.example      # Environment variable template
└── README.md         # This file
```

---

## Local development

```bash
# 1. Create and activate a virtual environment
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and edit environment variables
cp .env.example .env
# Edit .env — set MONGODB_URL etc.

# 4a. Run in stdio mode (for Claude Desktop)
python mcp_server.py

# 4b. Run in SSE mode (HTTP, for testing Cloud Run locally)
MCP_TRANSPORT=sse python mcp_server.py
```

---

## Deploy to Cloud Run

### Prerequisites
- [gcloud CLI](https://cloud.google.com/sdk/docs/install) authenticated
- A Google Cloud project with Cloud Run API enabled

### One-command deploy

```bash
# From the mcpserver/ directory:
gcloud run deploy lifeos-mcp-server \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URL=<your-atlas-url>,DATABASE_NAME=life_os_db,MCP_TRANSPORT=sse"
```

> **Tip:** Store `MONGODB_URL` in [Secret Manager](https://cloud.google.com/secret-manager) and reference it with `--set-secrets` for production.

### Using a pre-built image

```bash
# Build & push
gcloud builds submit --tag gcr.io/<PROJECT_ID>/lifeos-mcp-server .

# Deploy from image
gcloud run deploy lifeos-mcp-server \
  --image gcr.io/<PROJECT_ID>/lifeos-mcp-server \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URL=<your-atlas-url>,DATABASE_NAME=life_os_db,MCP_TRANSPORT=sse"
```

---

## Connecting the backend to this MCP server

After deploying, Cloud Run gives you a URL like:
```
https://lifeos-mcp-server-<hash>-<region>.a.run.app
```

Update `LifeOsBackend/.env` to point `UniClient` at the SSE endpoint:
```env
MCP_SERVER_URL=https://lifeos-mcp-server-<hash>-<region>.a.run.app/sse
```

---

## Available MCP tools

| Tool | Description |
|------|-------------|
| `create_task` | Create a new task |
| `read_all_tasks` | List all tasks |
| `update_task` | Update task fields |
| `delete_task` | Delete a task |
| `create_note` | Create a new note |
| `read_all_notes` | List all notes |
| `update_note` | Update note fields |
| `delete_note` | Delete a note |
