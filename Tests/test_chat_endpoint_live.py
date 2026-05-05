import requests
import json
import asyncio
import os

BASE_URL = "http://localhost:8000"

def test_chat_config():
    """Test getting the chat configuration"""
    print("\n--- Testing /chat/config ---")
    try:
        response = requests.get(f"{BASE_URL}/chat/config")
        print(f"Status Code: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to {BASE_URL}. Is the server running?")
        return False

def test_chat_message():
    """Test sending a chat message to create a task via MCP tool"""
    print("\n--- Testing /chat (Creating a Task via AI) ---")
    payload = {
        "message": "Please create a medium priority task called 'Test Task from AI Script' due today.",
        "use_async": True
    }
    
    try:
        print(f"Sending message: '{payload['message']}'...")
        print("Waiting for AI response (this may take a few seconds)...")
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("\nAI Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Error Response:")
            print(response.text)
            
        return response.status_code == 200
    except requests.exceptions.ConnectionError:
        print(f"Error: Could not connect to {BASE_URL}. Is the server running?")
        return False
    except requests.exceptions.Timeout:
        print("Error: The request timed out. The AI might be taking too long to respond.")
        return False

def test_chat_read_tasks():
    """Test sending a chat message to read tasks via MCP tool"""
    print("\n--- Testing /chat (Reading Tasks via AI) ---")
    payload = {
        "message": "Can you list all the tasks I currently have in my database?",
        "use_async": True
    }
    
    try:
        print(f"Sending message: '{payload['message']}'...")
        print("Waiting for AI response...")
        response = requests.post(f"{BASE_URL}/chat", json=payload, timeout=60)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("\nAI Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print("Error Response:")
            print(response.text)
            
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing read tasks: {e}")
        return False

def run_all_tests():
    print("Starting Live Endpoint Tests for AI/MCP Chat...\n")
    
    config_ok = test_chat_config()
    
    if config_ok:
        test_chat_message()
        print("\nSleeping for 2 seconds before the next test...")
        import time
        time.sleep(2)
        test_chat_read_tasks()
        
    print("\nTests complete!")

if __name__ == "__main__":
    run_all_tests()
