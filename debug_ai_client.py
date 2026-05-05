import asyncio
import os
import traceback
from LifeOsBackend.ai_client import AIClient

async def run():
    client = AIClient(async_mode=True)
    try:
        response = await client.process_message_async("Can you list all the tasks I currently have in my database?")
        print("Response:", response)
    except Exception as e:
        print("EXCEPTION CAUGHT:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(run())
