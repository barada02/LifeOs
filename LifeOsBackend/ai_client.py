"""
ai_client.py — Life OS AI Client (powered by UniMCP)

Wraps UniClient + UniLLM so the rest of the backend only needs to call:
    response = await ai_client.chat(user_id, message)

Session state is kept per-user in memory so multi-turn conversations work
across API calls within the same server process.
"""

import os
import sys
from typing import Optional

from dotenv import load_dotenv
from unimcp import UniClient, UniLLM, Session

load_dotenv()

# ── Default system prompt ────────────────────────────────────────────────────

DEFAULT_SYSTEM_PROMPT = (
    "You are LifeOS, a personal AI assistant connected to the user's productivity database. "
    "You have tools to read and write the user's tasks, notes, and personal data. "
    "When the user mentions something to remember or asks to create/update/delete items, "
    "use the appropriate tool immediately. Always confirm what you did after using a tool."
)

# ── Per-user session registry ─────────────────────────────────────────────────

_sessions: dict[str, Session] = {}


def _get_or_create_session(user_id: str, llm: UniLLM) -> Session:
    """Return an existing in-memory session for this user, or create a new one."""
    if user_id not in _sessions:
        session = llm.create_session(
            name=f"user_{user_id}",
            system_prompt=DEFAULT_SYSTEM_PROMPT,
        )
        _sessions[user_id] = session
    return _sessions[user_id]


def clear_session(user_id: str) -> None:
    """Wipe the conversation history for a given user (e.g. on logout)."""
    if user_id in _sessions:
        _sessions[user_id].clear_history()


# ── Main AI client class ──────────────────────────────────────────────────────

class LifeOSAIClient:
    """
    A thin wrapper around UniClient + UniLLM.

    Usage (inside an async context):
        async with LifeOSAIClient() as client:
            reply = await client.chat("user-123", "Add a task: buy milk")
    """

    def __init__(self):
        # UniClient reads MCP_SERVER from env; override endpoint here if needed.
        mcp_endpoint = os.getenv("MCP_SERVER")
        self._mcp_client = UniClient(endpoint=mcp_endpoint)

        # UniLLM reads LLM_API_KEY / LLM_BASE_URL / LLM_MODEL_NAME from env.
        self._llm: Optional[UniLLM] = None

    async def connect(self):
        """Open the MCP connection and build the LLM wrapper."""
        await self._mcp_client.connect()
        self._llm = UniLLM(
            mcp_client=self._mcp_client,
            api_key=os.getenv("LLM_API_KEY"),
            base_url=os.getenv("LLM_BASE_URL"),
            model_name=os.getenv("LLM_MODEL_NAME", "gpt-4o"),
        )

    async def disconnect(self):
        """Close the MCP connection."""
        await self._mcp_client.disconnect()

    async def __aenter__(self):
        await self.connect()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.disconnect()

    async def chat(self, user_id: str, message: str) -> str:
        """
        Send a message on behalf of *user_id* and return the AI reply.

        The conversation history is persisted in memory for the lifetime of the
        server process, so multi-turn context works out of the box.
        """
        if self._llm is None:
            raise RuntimeError("LifeOSAIClient is not connected. Use 'async with' or call connect() first.")

        session = _get_or_create_session(user_id, self._llm)
        return await self._llm.chat(message, session=session)

    def get_config(self) -> dict:
        """Return a safe summary of the current configuration (for debugging)."""
        return {
            "mcp_server": os.getenv("MCP_SERVER", "not set"),
            "llm_model": os.getenv("LLM_MODEL_NAME", "gpt-4o"),
            "llm_base_url": os.getenv("LLM_BASE_URL", "default (OpenAI)"),
        }


# ── Convenience factories ─────────────────────────────────────────────────────

def create_ai_client() -> LifeOSAIClient:
    """Factory that returns a new LifeOSAIClient instance."""
    return LifeOSAIClient()
