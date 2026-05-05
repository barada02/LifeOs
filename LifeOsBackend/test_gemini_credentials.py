import asyncio
import os
from dotenv import load_dotenv
from openai import AsyncOpenAI

async def test_gemini_credentials():
    print("Loading environment variables...")
    # This will load the .env file in this directory or parent directories
    load_dotenv()
    
    api_key = os.getenv("AI_API_KEY")
    base_url = os.getenv("AI_BASE_URL")
    model = os.getenv("AI_MODEL", "gemini-flash-lite-latest")
    
    print(f"Base URL: {base_url}")
    print(f"Model:    {model}")
    print(f"API Key:  {'***' + api_key[-4:] if api_key else 'MISSING'}")
    
    if not api_key:
        print("\n[ERROR] AI_API_KEY is not set. Please check your .env file.")
        return
        
    print("\nInitializing AsyncOpenAI client...")
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url
    )
    
    print(f"Sending a quick test message to the model '{model}'...")
    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello! Just testing if my API connection works. Please reply with 'Connection successful kumar!'."}
            ],
            max_tokens=50
        )
        
        print("\n✅ SUCCESS! Received response from Gemini:")
        print("-" * 50)
        print(response.choices[0].message.content)
        print("-" * 50)
        
    except Exception as e:
        print("\n❌ FAILED. An error occurred while communicating with the API:")
        print(str(e))

if __name__ == "__main__":
    asyncio.run(test_gemini_credentials())
