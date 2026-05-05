# Life OS - MVP 0.1 Implementation Plan

## 1. Core Concept
**Life OS** is an AI-first productivity tool combining a traditional software UI with a conversational AI assistant. 
The system uses a highly modular architecture so components (like the backend framework or database) can be easily swapped out later. The AI acts as the primary controller, interacting with the database via a custom Model Context Protocol (MCP) server. The UI is proactive, updating in real-time to reflect database changes and making the user feel like the AI is physically manipulating the app.

---

## 2. User Usability Perspective (What the User Can Do)
From the user's perspective, Life OS MVP 0.1 provides two distinct but synchronized ways to interact with their data:

### A. Traditional Manual Interaction
- **Dashboard View:** The user can see a sleek, clean overview of their daily tasks and notes.
- **Manual Management:** The user can manually create, edit, delete, and mark tasks as complete using standard UI elements (buttons, forms, checkboxes).
- **Organization:** The user can quickly jot down notes and link them to specific tasks or goals.

### B. AI-Driven Interaction (Conversational)
- **Natural Language Control:** The user can chat with the AI assistant to manage their life (e.g., *"Add 'Buy groceries' to my tasks for today"*, or *"I just finished the team meeting, note that down"*).
- **Contextual Querying:** The user can ask the AI questions about their data (e.g., *"What do I have remaining for today?"* or *"Did I write down any ideas for the new project?"*).
- **Proactive Feedback:** When the user tells the AI to create a task, the AI acknowledges the request, and the user instantly sees the new task appear on their dashboard without needing to refresh the page.

---

## 3. Architecture & Tech Stack (Highly Modular)
To ensure the project is easy to modify and tech stacks can be swapped later, we will use a strictly modular, layered architecture.

- **Frontend (React UI):** A premium, glassmorphism-inspired design with a sleek dark mode. Components will be isolated and reusable.
- **Backend (Python / FastAPI):** Chosen for its excellent synergy with AI tools and libraries. It will be structured into distinct modules:
  - **API Layer:** Handles REST/WebSocket communication with the React frontend.
  - **MCP Server Layer:** Exposes the custom tools for the AI to use.
  - **AI Engine Layer:** Manages the LLM client (e.g., Gemini) and interprets user intents.
  - **Database Access Layer:** Abstracts database interactions so we can easily swap out MongoDB later if desired.
- **Real-time Sync Engine:** WebSockets integrated into the Python backend to push database change events to the frontend.
- **Database (MongoDB):** Flexible schema database for rapid prototyping.

---

## 4. Development Phases

### Phase 1: Python Backend & Database Foundation
- [ ] Initialize modular Python backend (e.g., using FastAPI).
- [ ] Implement the Database Access Layer for MongoDB (`Tasks` and `Notes` collections).
- [ ] Set up the REST API for initial data fetching (for traditional UI interactions).
- [ ] Implement the WebSocket server for real-time frontend updates.

### Phase 2: AI & MCP Integration
- [x] Build the custom MCP Server in Python to expose DB operations (Create/Read/Update/Delete Task/Note) as tools.
  - ✨ Created `mcp_server.py` with 10 tools (5 task + 5 note operations)
  - Uses `fast-mcp` framework for lightweight MCP server
- [x] Integrate the LLM (Any OpenAI-compatible provider) with an MCP Client.
  - ✨ Created `ai_client.py` with configurable provider support
  - Supports OpenAI, Azure, Local LLMs, any OpenAI-compatible API
- [x] Build the Chat API endpoint that takes user messages, routes them to the AI, and executes MCP tool calls.
  - ✨ Added `POST /chat` endpoint to `main.py`
  - Added `GET /chat/config` for debugging
  - Added `POST /chat/reset` for conversation management
- [ ] Ensure that whenever an MCP tool modifies the database, a WebSocket event is fired to update the UI.
  - 📝 Planned for Phase 3 (WebSocket integration)

### Phase 3: Frontend (React UI)
- [ ] Set up the base React app with a premium, dynamic dark-mode design system.
- [ ] Build the core modular components: `TaskCard`, `TaskList`, `NoteBoard`, `ChatInterface`.
- [ ] Implement traditional manual interactions (API calls to backend).
- [ ] Connect the UI to the WebSocket to listen for AI-driven changes and trigger UI updates/animations.
