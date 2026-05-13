# Life OS: Backend API & UI Planning Reference

## 1. Backend FastAPI Endpoints

### AI / Chat Engine
* **`POST /chat`**: Submit a chat message (natural language) to the AI to fetch, create, or update tasks and notes.
* **`GET /chat/config`**: Check the current status and configuration of the AI/MCP setup.
* **`POST /chat/reset`**: Clear the AI's conversation history.

### Tasks Management
* **`GET /tasks/`**: Fetch all tasks.
* **`GET /tasks/{task_id}`**: Fetch details of a specific task.
* **`POST /tasks/`**: Create a new task.
* **`PUT /tasks/{task_id}`**: Update an existing task.
* **`DELETE /tasks/{task_id}`**: Delete a task.

### Notes Management
* **`GET /notes/`**: Fetch all notes.
* **`GET /notes/{note_id}`**: Fetch details of a specific note.
* **`POST /notes/`**: Create a new note.
* **`PUT /notes/{note_id}`**: Update an existing note.
* **`DELETE /notes/{note_id}`**: Delete a note.

---

## 2. UI Elements Plan (Derived strictly from Backend Schemas)

Based on the schemas defined in `schemas.py`, here are the core entities and the UI interactions/elements needed.

### A. Tasks Module
**Data Fields:** `title` (text), `description` (long text), `status` (todo, in_progress, done), `priority` (low, medium, high), `due_date` (date/time), `created_at`, `updated_at`.

**Required UI Components:**
1. **Task List / Kanban Board:**
   * A way to display tasks, ideally grouped by `status` (To Do, In Progress, Done).
   * **Task Card:** Needs to display the `title`, a snippet of the `description`, visual indicators for `priority` (e.g., green/yellow/red badges), and the `due_date`.
2. **Task Creation/Edit Form:**
   * **Title:** Required text input field.
   * **Description:** Optional textarea.
   * **Status:** Dropdown menu or radio buttons (`todo`, `in_progress`, `done`).
   * **Priority:** Dropdown menu or radio buttons (`low`, `medium`, `high`).
   * **Due Date:** Date/time picker widget.
   * **Actions:** Save / Cancel buttons.
3. **Task Actions Menu:** Buttons on tasks to Edit or Delete.

### B. Notes Module
**Data Fields:** `title` (text), `content` (markdown/text), `tags` (list of strings), `created_at`, `updated_at`.

**Required UI Components:**
1. **Notes Gallery / List:**
   * A grid or list showing note cards.
   * **Note Card:** Should show the `title`, a truncated preview of `content`, and pill/chip components for each of the `tags`.
   * Date created/updated footer.
2. **Note Viewer/Editor Form:**
   * **Title:** Required text input field.
   * **Content:** Required large textarea (ideally with a Markdown preview rendering toggle).
   * **Tags:** An input field that allows adding multiple string tags (e.g., type and press enter to add a chip).
   * **Actions:** Save / Cancel / Delete buttons.

### C. AI Chat Interface Module
**Required UI Components:**
1. **Chat Window:** A scrollable list showing the conversation history (User vs System/AI bubbles).
2. **Message Input:** A text input with a "Send" button.
3. **Chat Controls:** 
   * A "Clear History" button (triggers `POST /chat/reset`).
   * A status indicator (triggers `GET /chat/config`) showing if the AI is connected/ready.

### D. Global Layout / Navigation
* **Sidebar / NavBar:** Links to switch between "Dashboard", "Tasks", "Notes", and the "AI Assistant".
* **Loading States:** Spinners or skeleton loaders while fetching from endpoints.
* **Error Notifications:** Toast or snackbar components to handle failure responses (e.g., 404s, 500s).
