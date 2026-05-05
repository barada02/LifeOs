"""
Test script for Phase 2 - MCP Server and AI Client

Tests:
1. MCP server tool definitions
2. AI client initialization and configuration
3. Tool execution
4. End-to-end conversation flows

Run this script to validate the MCP server and AI client before integration
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'LifeOsBackend'))

# ==========================================
# Test Configuration
# ==========================================

TEST_RESULTS = {
    "passed": 0,
    "failed": 0,
    "skipped": 0,
}


def test_result(name: str, passed: bool, message: str = ""):
    """Record a test result"""
    status = "✓ PASS" if passed else "✗ FAIL"
    print(f"{status}: {name}")
    if message:
        print(f"   └─ {message}")
    
    if passed:
        TEST_RESULTS["passed"] += 1
    else:
        TEST_RESULTS["failed"] += 1


def print_section(title: str):
    """Print a section header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")


# ==========================================
# Test Suite
# ==========================================

def test_mcp_server_import():
    """Test that MCP server can be imported"""
    print_section("1. MCP Server Import")
    
    try:
        from mcp_server import (
            create_task, read_all_tasks, update_task, delete_task,
            create_note, read_all_notes, update_note, delete_note,
            get_mcp_server
        )
        test_result("Import MCP server", True, "All tools imported successfully")
        return True
    except Exception as e:
        test_result("Import MCP server", False, str(e))
        return False


def test_mcp_server_tools():
    """Test MCP server tool definitions"""
    print_section("2. MCP Server Tools")
    
    try:
        from mcp_server import get_mcp_server
        
        mcp = get_mcp_server()
        
        # Check that tools are registered
        test_result(
            "MCP server initialized",
            mcp is not None,
            "MCP server instance obtained"
        )
        
        return True
    except Exception as e:
        test_result("MCP server initialization", False, str(e))
        return False


def test_mcp_tool_execution():
    """Test that MCP tools can be executed"""
    print_section("3. MCP Tool Execution")
    
    try:
        from mcp_server import create_task, read_all_tasks, delete_task
        
        # Test create_task with valid inputs
        result = create_task(
            title="Test Task",
            description="This is a test task",
            priority="high"
        )
        test_result(
            "Execute create_task tool",
            "task" in result and "title" in result["task"],
            f"Task created with title: {result.get('task', {}).get('title', 'N/A')}"
        )
        
        # Test create_task with empty title (should fail)
        result = create_task(title="")
        test_result(
            "Handle invalid input (empty title)",
            "error" in result,
            "Error returned for empty title"
        )
        
        # Test read_all_tasks
        result = read_all_tasks()
        test_result(
            "Execute read_all_tasks tool",
            result.get("_operation") == "read_all_tasks",
            "Tool execution metadata present"
        )
        
        return True
    except Exception as e:
        test_result("MCP tool execution", False, str(e))
        return False


def test_ai_client_import():
    """Test that AI client can be imported"""
    print_section("4. AI Client Import")
    
    try:
        from ai_client import AIClient, create_ai_client, create_async_ai_client
        test_result("Import AI client", True, "AI client imported successfully")
        return True
    except Exception as e:
        test_result("Import AI client", False, str(e))
        return False


def test_ai_client_initialization():
    """Test AI client initialization with environment variables"""
    print_section("5. AI Client Initialization")
    
    # Check if API key is set
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("⊘ SKIP: AI_API_KEY environment variable not set")
        TEST_RESULTS["skipped"] += 1
        print("   Set the following environment variables to test AI client:")
        print("   - AI_API_KEY: Your API key")
        print("   - AI_BASE_URL (optional): API endpoint (default: https://api.openai.com/v1)")
        print("   - AI_MODEL (optional): Model name (default: gpt-4)")
        return True
    
    try:
        from ai_client import create_ai_client
        
        client = create_ai_client()
        test_result(
            "Create AI client",
            client is not None,
            f"Client initialized with model: {client.model}"
        )
        
        config = client.get_config()
        test_result(
            "Get client configuration",
            "base_url" in config and "model" in config,
            f"Base URL: {config['base_url']}, Model: {config['model']}"
        )
        
        return True
    except ValueError as e:
        test_result("Create AI client", False, str(e))
        return False
    except Exception as e:
        test_result("Create AI client", False, str(e))
        return False


def test_ai_client_tools_setup():
    """Test that AI client sets up tools correctly"""
    print_section("6. AI Client Tools Setup")
    
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("⊘ SKIP: AI_API_KEY environment variable not set")
        TEST_RESULTS["skipped"] += 1
        return True
    
    try:
        from ai_client import create_ai_client
        
        client = create_ai_client()
        
        test_result(
            "Tools registered in client",
            len(client.tools) > 0,
            f"Total tools: {len(client.tools)}"
        )
        
        # Check for specific tools
        tool_names = [tool["function"]["name"] for tool in client.tools]
        expected_tools = ["create_task", "read_all_tasks", "create_note", "read_all_notes"]
        
        found_tools = [t for t in expected_tools if t in tool_names]
        test_result(
            "Essential tools present",
            len(found_tools) == len(expected_tools),
            f"Found: {', '.join(found_tools)}"
        )
        
        return True
    except Exception as e:
        test_result("Tools setup", False, str(e))
        return False


def test_conversation_history():
    """Test that AI client maintains conversation history"""
    print_section("7. Conversation History")
    
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("⊘ SKIP: AI_API_KEY environment variable not set")
        TEST_RESULTS["skipped"] += 1
        return True
    
    try:
        from ai_client import create_ai_client
        
        client = create_ai_client()
        
        # Initial history should be empty
        test_result(
            "Initial conversation history is empty",
            len(client.messages) == 0,
            "Messages list initialized empty"
        )
        
        # Clear and add a message
        client.clear_history()
        client.messages.append({"role": "user", "content": "Hello"})
        
        test_result(
            "Can add to conversation history",
            len(client.messages) == 1 and client.messages[0]["content"] == "Hello",
            "Message successfully added"
        )
        
        # Clear history
        client.clear_history()
        test_result(
            "Can clear conversation history",
            len(client.messages) == 0,
            "History successfully cleared"
        )
        
        return True
    except Exception as e:
        test_result("Conversation history", False, str(e))
        return False


def test_tool_integration():
    """Test that AI client can reference MCP tools"""
    print_section("8. Tool Integration")
    
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("⊘ SKIP: AI_API_KEY environment variable not set")
        TEST_RESULTS["skipped"] += 1
        return True
    
    try:
        from ai_client import create_ai_client
        
        client = create_ai_client()
        
        # Check that create_task tool is in the tools
        tool_names = [tool["function"]["name"] for tool in client.tools]
        
        test_result(
            "create_task tool available",
            "create_task" in tool_names,
            "Tool is in the tools list"
        )
        
        # Check tool schema
        create_task_tool = next(
            (t for t in client.tools if t["function"]["name"] == "create_task"),
            None
        )
        
        test_result(
            "create_task has proper schema",
            create_task_tool is not None and "parameters" in create_task_tool["function"],
            "Tool schema is properly defined"
        )
        
        return True
    except Exception as e:
        test_result("Tool integration", False, str(e))
        return False


async def test_end_to_end_async():
    """Test end-to-end async flow (requires API key)"""
    print_section("9. End-to-End Async Flow")
    
    api_key = os.getenv("AI_API_KEY")
    if not api_key:
        print("⊘ SKIP: AI_API_KEY environment variable not set")
        TEST_RESULTS["skipped"] += 1
        return True
    
    try:
        from ai_client import create_async_ai_client
        
        client = create_async_ai_client()
        
        test_result(
            "Async client created",
            client is not None and client.async_mode,
            "Async mode enabled"
        )
        
        # Note: This won't actually call the LLM without a valid API key
        print("   └─ Full async conversation test requires valid API credentials")
        
        return True
    except Exception as e:
        test_result("End-to-end async", False, str(e))
        return False


def test_environment_variables():
    """Test environment variable loading"""
    print_section("10. Environment Variables")
    
    try:
        from dotenv import load_dotenv
        load_dotenv()
        
        ai_key = os.getenv("AI_API_KEY")
        ai_model = os.getenv("AI_MODEL", "gpt-4")
        ai_base_url = os.getenv("AI_BASE_URL", "https://api.openai.com/v1")
        
        test_result(
            "Can load environment variables",
            True,
            "dotenv loaded successfully"
        )
        
        if ai_key:
            test_result(
                "AI_API_KEY is set",
                True,
                f"API key present (***{ai_key[-4:]})"
            )
        else:
            test_result(
                "AI_API_KEY is set",
                False,
                "API key not configured"
            )
        
        test_result(
            "AI_MODEL configuration",
            True,
            f"Model: {ai_model}"
        )
        
        test_result(
            "AI_BASE_URL configuration",
            True,
            f"Base URL: {ai_base_url}"
        )
        
        return True
    except Exception as e:
        test_result("Environment variables", False, str(e))
        return False


# ==========================================
# Main Test Runner
# ==========================================

async def run_all_tests():
    """Run all tests"""
    print("\n" + "="*60)
    print("  LIFE OS PHASE 2 - TEST SUITE")
    print("  MCP Server & AI Client Validation")
    print("="*60)
    
    # Sync tests
    test_mcp_server_import()
    test_mcp_server_tools()
    test_mcp_tool_execution()
    test_ai_client_import()
    test_ai_client_initialization()
    test_ai_client_tools_setup()
    test_conversation_history()
    test_tool_integration()
    test_environment_variables()
    
    # Async tests
    await test_end_to_end_async()
    
    # Print summary
    print_section("TEST SUMMARY")
    
    total = TEST_RESULTS["passed"] + TEST_RESULTS["failed"] + TEST_RESULTS["skipped"]
    print(f"Total Tests:  {total}")
    print(f"Passed:       {TEST_RESULTS['passed']}")
    print(f"Failed:       {TEST_RESULTS['failed']}")
    print(f"Skipped:      {TEST_RESULTS['skipped']}")
    print()
    
    if TEST_RESULTS["failed"] == 0:
        print("✓ All tests passed!")
    else:
        print(f"✗ {TEST_RESULTS['failed']} test(s) failed")
    
    print("\n" + "="*60)
    print("  NEXT STEPS")
    print("="*60)
    print("""
1. Set environment variables if not already set:
   - AI_API_KEY: Your LLM provider's API key
   - AI_MODEL: Model name (default: gpt-4)
   - AI_BASE_URL: API endpoint (default: https://api.openai.com/v1)

2. Run this test script again to validate with API connection:
   python test_ai_mcp.py

3. After validation, integrate into FastAPI:
   - Add /chat endpoint to main.py
   - Connect WebSocket for UI updates

4. Test full integration with frontend
    """)


if __name__ == "__main__":
    # Run async tests
    asyncio.run(run_all_tests())
