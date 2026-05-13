# LifeOs — AI-First UX Vision & Architecture

> **Role**: AI Engineer + Product Designer  
> **Goal**: Transform LifeOs from "app with a chatbot sidebar" → "AI that *is* the operating system for your life"

---

## The Paradigm Shift

### What you have now
```
User → fills forms → sees data → occasionally asks the sidebar chatbot
```

### What AI-first means
```
User speaks/types → AI understands intent → AI executes + narrates + updates the UI
The UI is a *live reflection* of what the AI is doing, not a form for the user to fill.
```

**The mental model to internalize:** The AI is the application. The UI is its dashboard.

When a user says *"I need to prep for Monday's meeting with the product team"*, the AI should:
1. Create the task automatically
2. Navigate the UI to the Tasks view
3. Highlight the new card
4. Ask a clarifying follow-up: *"Want me to set a reminder for Sunday evening?"*
5. If voice mode: speak all of this aloud

The user never touched a form.

---

## Layer 1: The AI Response Protocol (Most Critical Change)

Right now, the `/chat` endpoint returns:
```json
{ "response": "I created your task.", "status": "success" }
```

This is just text. The AI has no way to *drive* the UI. The fundamental architectural change is to make the AI respond with **structured intent** — text + UI commands:

```json
{
  "speech": "Done. I've added 'Monday meeting prep' as a high-priority task.",
  "chat_markdown": "✅ Created **Monday meeting prep** — high priority, due Sunday 8 PM.",
  "ui_actions": [
    { "type": "navigate",  "view": "tasks" },
    { "type": "highlight", "entity": "task", "id": "6645abc..." },
    { "type": "toast",     "message": "Task created", "variant": "success" }
  ],
  "follow_up": "Want me to also block time on your calendar for this?"
}
```

The frontend receives this over **WebSocket** (not HTTP polling) and:
- Plays the `speech` via TTS
- Renders `chat_markdown` in the conversation panel
- Executes `ui_actions` sequentially (navigate, scroll, highlight, animate)
- Shows `follow_up` as a suggested reply chip

### UI Action Types (Starter Set)

| Action | Payload | Effect |
|--------|---------|--------|
| `navigate` | `{ view: "tasks" | "notes" | "dashboard" }` | Switch active view |
| `highlight` | `{ entity, id }` | Pulse-animate a card |
| `scroll_to` | `{ entity, id }` | Scroll list to item |
| `open_modal` | `{ type, prefill: {...} }` | Open create/edit modal pre-filled |
| `toast` | `{ message, variant }` | Show notification |
| `set_filter` | `{ field, value }` | Filter the task/note list |
| `speak` | `{ text }` | Override TTS with specific text |
| `confirm` | `{ question, on_yes, on_no }` | Show a confirm dialog |
| `ambient` | `{ message, icon }` | Subtle status update (no interruption) |

---

## Layer 2: Real-Time Transport — WebSocket over HTTP

Replace the current `POST /chat` request/response with a **persistent WebSocket**.

### Why WebSocket is essential for AI-first:
- AI can stream tokens as they arrive (no waiting for full response)
- AI can send **intermediate UI updates** while tools are running  
  *(e.g., "found 4 tasks…" → highlight them → then "here's your summary")*
- AI can **push proactively** without a user request (morning briefings, reminders)
- Voice: audio chunks flow continuously, no HTTP overhead

### Protocol Design

```
Client → Server: { type: "user_message", text: "...", session_id: "..." }
Client → Server: { type: "voice_chunk", audio_b64: "...", session_id: "..." }
Client → Server: { type: "voice_end",   session_id: "..." }

Server → Client: { type: "token",      text: "Done" }           ← streaming
Server → Client: { type: "ui_action",  action: { ... } }        ← mid-stream UI control
Server → Client: { type: "audio",      audio_b64: "...", format: "mp3" }  ← TTS chunks
Server → Client: { type: "done",       follow_up: "..." }       ← conversation complete
Server → Client: { type: "proactive",  speech: "...", ui_actions: [...] } ← AI-initiated
```

### Backend: WebSocket Endpoint Skeleton

```python
# In main.py — the WebSocket import is already there, unused. Time to use it.

from fastapi import WebSocket, WebSocketDisconnect
import json

@app.websocket("/ws/{session_id}")
async def ai_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    
    # Get or create a per-session LLM session
    session = get_or_create_session(session_id)  # keyed dict in app_state
    
    try:
        async for raw in websocket.iter_text():
            msg = json.loads(raw)
            
            if msg["type"] == "user_message":
                # Stream response back
                async for chunk in llm.stream_chat(msg["text"], session=session):
                    await websocket.send_json(chunk)  # { type: "token"|"ui_action"|"audio" }
                    
            elif msg["type"] == "voice_chunk":
                # Buffer STT audio — handled by voice layer
                await voice_buffer.append(session_id, msg["audio_b64"])
                
            elif msg["type"] == "voice_end":
                # Transcribe → process → respond
                transcript = await stt.transcribe(session_id)
                async for chunk in llm.stream_chat(transcript, session=session):
                    await websocket.send_json(chunk)
                    
    except WebSocketDisconnect:
        cleanup_session(session_id)
```

---

## Layer 3: Voice Mode

### Option A — Web Speech API (Start Here, Today)
**Cost**: Free. **Quality**: Okay. **Latency**: ~500ms.

```typescript
// Frontend — VoiceController.ts
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = true;

recognition.onresult = (e) => {
  const transcript = Array.from(e.results)
    .map(r => r[0].transcript).join('');
  if (e.results[0].isFinal) {
    ws.send(JSON.stringify({ type: 'user_message', text: transcript }));
  }
};

// TTS for responses
const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes('Google'));
  speechSynthesis.speak(utterance);
};
```

### Option B — OpenAI Realtime API (The Best UX, Future State)
**Cost**: ~$0.06/min. **Quality**: Indistinguishable from human. **Latency**: 300ms.  
This is a dedicated WebSocket to OpenAI that handles STT + LLM + TTS in one pipeline.  
Your backend proxies it and intercepts tool calls to inject MCP actions.

### Option C — Deepgram STT + ElevenLabs TTS (Best Control)
**Cost**: ~$0.01/min STT + $0.30/1K chars TTS. **Quality**: Excellent.  
Best for custom wake word + controlling exactly what voice sounds like.  
Deepgram streams partial transcripts in real-time (300ms first word).

### Recommended Path
```
Phase 1: Web Speech API (zero cost, good enough to validate the UX pattern)
Phase 2: Deepgram STT + OpenAI TTS (production quality, per-minute billing)
Phase 3: OpenAI Realtime API when you need sub-300ms latency
```

### Voice UX Design Principles
1. **Push-to-Talk first** — hold Space or click mic button. Simpler, less error-prone.
2. **Always show a waveform** when listening — users need to know the mic is live.
3. **Interrupt capability** — user can speak while AI is talking to cut it off.
4. **Confidence indicator** — show interim transcript as user speaks.
5. **Silent actions** — some UI actions happen silently (no speech), like navigation.
   AI speaks only for confirmations and answers.

---

## Layer 4: Proactive AI — The "Secretary" Behavior

This is what separates a chatbot from a personal assistant.

### Proactive Triggers

| Trigger | Example AI Action |
|---------|------------------|
| Time-based (cron) | 8 AM: *"Good morning. You have 3 tasks due today. Two are high priority."* |
| Task due soon | 2 hours before due: *"Quick reminder — 'Budget review' is due in 2 hours."* |
| Task overdue | *"'API documentation' is 2 days overdue. Want me to reschedule it?"* |
| Idle note | *"You haven't added to your 'Product ideas' note in 8 days."* |
| Task completed | *"You completed 5 tasks today. Strong day."* |
| Task volume | *"You have 12 open high-priority tasks. Want me to help triage them?"* |

### Backend: Proactive Engine

```python
# proactive.py — runs as a background task in FastAPI

import asyncio
from datetime import datetime, timezone, timedelta

class ProactiveEngine:
    def __init__(self, ws_manager: ConnectionManager, db):
        self.ws_manager = ws_manager
        self.db = db
    
    async def run(self):
        while True:
            await self.check_morning_briefing()
            await self.check_overdue_tasks()
            await self.check_due_soon()
            await asyncio.sleep(60)  # check every minute
    
    async def check_due_soon(self):
        two_hours = datetime.now(timezone.utc) + timedelta(hours=2)
        tasks = await self.db.tasks.find({
            "due_date": { "$lte": two_hours },
            "status": { "$ne": "done" },
            "reminded": { "$ne": True }
        }).to_list(10)
        
        for task in tasks:
            await self.ws_manager.broadcast({
                "type": "proactive",
                "speech": f"Reminder: '{task['title']}' is due soon.",
                "ui_actions": [
                    { "type": "ambient", "message": f"Due soon: {task['title']}", "icon": "schedule" }
                ]
            })
            # Mark as reminded to avoid repeat
            await self.db.tasks.update_one(
                {"_id": task["_id"]}, {"$set": {"reminded": True}}
            )
```

---

## Layer 5: The System Prompt — The Brain of Your AI

The quality of the AI behavior is almost entirely determined by the system prompt. This is where you encode the "personal assistant personality."

```python
LIFEOS_SYSTEM_PROMPT = """
You are LifeOS Assistant — a proactive, intelligent personal operating system for the user.

## Your Personality
- Speak like a sharp, calm executive assistant. Concise, confident, never verbose.
- You refer to the user by their first name when you know it.
- You think ahead: after completing a task, consider what the user might need next.
- Never explain yourself more than necessary. Act first, narrate briefly.

## Your Capabilities  
You have real tools to manage tasks and notes in the user's database.
ALWAYS use your tools when the user asks you to create, update, delete, or find anything.
Never say "I can help you create a task" — just create it and confirm.

## Response Format
You MUST respond ONLY with valid JSON in this exact format:
{
  "speech": "Short spoken response (1-2 sentences max, no markdown).",
  "chat_markdown": "Richer response with markdown for the chat panel.",
  "ui_actions": [/* array of UI action objects */],
  "follow_up": "Optional: a brief follow-up question or suggestion."
}

## UI Action Reference
Navigate: { "type": "navigate", "view": "tasks"|"notes"|"dashboard" }
Highlight: { "type": "highlight", "entity": "task"|"note", "id": "<mongo_id>" }
Toast:     { "type": "toast", "message": "...", "variant": "success"|"error"|"info" }
Filter:    { "type": "set_filter", "field": "priority", "value": "high" }

## Proactivity Rules
- If a user mentions a date or deadline in passing, create a task for it.
- If the user asks "what do I have today?", read all tasks and give a prioritized briefing.
- If you've just completed an action, offer the logical next step.
- Keep follow-up questions to ONE at a time.
"""
```

---

## Layer 6: External Integrations Roadmap

### 🟢 Phase 1 — WhatsApp as an Input Channel

**Architecture**: User sends WhatsApp message → Twilio webhook → your FastAPI → AI → MCP → DB → Twilio → WhatsApp reply.

```python
# In main.py — WhatsApp webhook
@app.post("/webhooks/whatsapp")
async def whatsapp_webhook(
    Body: str = Form(...),
    From: str = Form(...),
):
    user_message = Body  # "Add task: Buy groceries, high priority"
    
    # Reuse the same AI pipeline
    session = get_or_create_session(f"wa_{From}")
    response = await llm.chat(user_message, session=session)
    
    # Parse AI response and send back via Twilio
    ai_data = json.loads(response)
    await twilio_client.messages.create(
        body=ai_data["speech"],
        from_='whatsapp:+14155238886',
        to=From
    )
    return {"status": "ok"}
```

**What this unlocks**: User texts WhatsApp → "What are my tasks today?" → AI reads from DB → replies in WhatsApp. Full CRUD from WhatsApp. Zero UI needed.

### 🟡 Phase 2 — Google Calendar Sync

**Use case**: User says *"block 2 hours tomorrow afternoon for deep work"* → AI creates a calendar event AND a LifeOs task.

- **API**: Google Calendar API (OAuth2)
- **MCP Tool**: `create_calendar_event(title, start_time, end_time, description)`
- **Bidirectional**: Calendar events that match patterns auto-import as tasks

### 🟡 Phase 2 — Email Digest Integration  

- **Use case**: Every morning, AI emails a briefing: "Today's priorities, overdue items, notes to review"
- **API**: SendGrid or Gmail API
- **MCP Tool**: `send_email(to, subject, body_html)`

### 🔵 Phase 3 — Real-Time Context Awareness

- **Device location** (with permission): *"You're near the office — your 3 PM meeting is in 45 mins"*
- **Browser activity** (extension): AI knows you're on GitHub → *"Want me to link this PR to the 'API docs' task?"*
- **Calendar context**: AI sees your next meeting and proactively prepares a briefing 10 mins before

---

## Product Design: The UI Vision

### Principle: UI as Output, Not Input

The UI shifts from **data entry interface** → **ambient intelligence display**.

```
┌─────────────────────────────────────────────────────────────┐
│  LifeOS                                    🎤  ⌨️  ⚡       │  ← Minimal header
│─────────────────────────────────────────────────────────────│
│        │                                   │                │
│  [Nav] │        Live Canvas                │  AI Presence   │
│        │                                   │                │
│  📋    │  Tasks / Notes / Calendar         │  ● Listening   │
│  📝    │  (AI navigates and highlights     │                │
│  📅    │   items as it works)              │  "Got it. I've │
│  🤖    │                                   │   added your   │
│        │  ┌─────────────────────────────┐  │   task and set │
│        │  │ [Highlighted: Meeting prep] │  │   it to high." │
│        │  │  ⚡ HIGH · Due Sunday 8PM   │  │                │
│        │  └─────────────────────────────┘  │  [Summarize]   │
│        │                                   │  [Create task] │
│        │                                   │  [Show today]  │
│─────────────────────────────────────────────────────────────│
│  ████████████████░░░░░░░░  [  Ask anything...  ]  [🎤]     │  ← Input bar
└─────────────────────────────────────────────────────────────┘
```

### Key UI Concepts

**1. The Ambient Orb (AI Presence Indicator)**
- Resting: subtle pulse at very low opacity
- Listening: bright animated waveform
- Thinking: slow orbit animation
- Speaking: fast reactive animation matching voice amplitude

**2. AI Highlight System**
When the AI touches a task/note, it glows for 2s, then settles. User sees exactly what the AI did.

**3. Voice-First Input Bar**
The text input is secondary. The primary interaction is voice. The mic button is prominent; text input is there for quiet environments.

**4. Suggested Actions (Chips)**
After every AI response, show 3 contextual suggestion chips:
- *"Mark as done"* / *"Reschedule"* / *"Add subtask"*
These are the "quick replies" for the most likely next action.

**5. Conversation History as a Timeline**
The chat panel is not a chat bubble list — it's a **timeline of events** the AI performed, like a secretary's activity log:
```
9:14 AM  Created task "Meeting prep" [→]
9:14 AM  Set priority to High
9:15 AM  AI: "Want me to add prep notes?"
9:15 AM  You: "Yes, add the agenda"
9:15 AM  Updated note "Q3 Meeting" with agenda
```

---

## Implementation Phases

### Phase 1: Foundation (2-3 weeks) — DO THIS FIRST

**Goal**: Replace HTTP chat with WebSocket + structured AI response protocol.

1. Add `ui_actions` to the AI response format (update system prompt)
2. Implement `POST /chat` → `WebSocket /ws/{session_id}` migration  
3. Add per-session state (fixes the critical shared session bug from the code review)
4. Frontend: connect to WebSocket, parse `ui_actions`, execute them
5. Implement `navigate` and `highlight` actions (most impactful, easiest)

**Proof of concept**: User types *"Show me my high-priority tasks"* → AI calls `read_all_tasks` MCP tool → sends `navigate: tasks` + `set_filter: priority=high` → UI navigates AND filters.

---

### Phase 2: Voice Mode (2 weeks)

**Goal**: Complete hands-free operation.

1. Add mic button to input bar, wire Web Speech API
2. Add TTS output using Web Speech Synthesis API (free, good enough)
3. Add visual waveform animation while listening
4. Add AI thinking indicator while processing
5. Implement push-to-talk (Space bar)

**Proof of concept**: User holds Space, says *"What do I have today?"*, AI speaks back a briefing, UI navigates to dashboard.

---

### Phase 3: Proactive Engine (1-2 weeks)

**Goal**: AI initiates, not just responds.

1. Implement `ProactiveEngine` background task in FastAPI
2. `ConnectionManager` class to track active WebSocket connections
3. Morning briefing at configurable time
4. Due-soon reminders (2h window)
5. Overdue task nudges

---

### Phase 4: WhatsApp Channel (1 week)

**Goal**: AI accessible from anywhere, without opening the app.

1. Twilio account + WhatsApp Business number
2. `/webhooks/whatsapp` FastAPI endpoint
3. Session management per WhatsApp number (`wa_{from_number}`)
4. Reuse exact same AI + MCP pipeline

---

### Phase 5: Calendar + Email (2-3 weeks)

**Goal**: AI has context about your full schedule.

1. Google Calendar OAuth2 + read/write tools in MCP server
2. Morning email digest (SendGrid)
3. Two-way sync: calendar events → LifeOs tasks

---

## The Big Idea: LifeOs as AI Middleware

Long-term, what you're building isn't a task manager. It's a **personal AI that connects every channel of your life** through a single intelligence layer:

```
Voice (App)          ─┐
WhatsApp             ─┤
Email                ─┤──► LifeOS AI Brain ──► Your Life Data
Telegram             ─┤         │                (Tasks, Notes,
SMS                  ─┤         └──► External      Calendar, Contacts)
Browser Extension    ─┘              APIs
```

Any input modality → the same AI → the same data → response on the right channel.

This is what true AI-first means: the AI doesn't live *in* the app. The app lives *inside* the AI.

---

## Immediate Next Step (This Week)

The single highest-leverage change you can make right now:

1. **Update the system prompt** to return structured JSON with `ui_actions`
2. **Add `navigate` action handler in the frontend** 
3. **Migrate from `POST /chat` to `WebSocket /ws/{session_id}`** (also fixes the session bug)

This single change will transform the feel of the product from "chatbot in a sidebar" to "AI that controls my app." Everything else builds on this foundation.
