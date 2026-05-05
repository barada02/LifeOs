import asyncio
import os
import json
import traceback
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from LifeOsBackend.ai_client import AIClient
from dotenv import load_dotenv

async def test_ai_client_direct():
    print("Loading environment variables...")
    load_dotenv()
    
    print("\n--- Testing AIClient Initialization ---")
    try:
        client = AIClient(async_mode=True)
        config = client.get_config()
        print("Config:", json.dumps(config, indent=2))
    except Exception as e:
        print("Error initializing client:")
        traceback.print_exc()
        return

    print("\n--- Testing Task Creation via AIClient ---")
    try:
        print("Sending message: 'Create a medium priority task called \"Direct AI Test Task\"'")
        response = await client.process_message_async("Create a medium priority task called \"Direct AI Test Task\"")
        print("\nAI Response:")
        print(response)
    except Exception as e:
        print("Error during task creation:")
        traceback.print_exc()

    print("\n--- Testing Task Reading via AIClient ---")
    try:
        print("Sending message: 'List all tasks'")
        response = await client.process_message_async("List all tasks")
        print("\nAI Response:")
        print(response)
    except Exception as e:
        print("Error during task reading:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ai_client_direct())
