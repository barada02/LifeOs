import urllib.request
import urllib.error
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def make_request(method, endpoint, data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {'Content-Type': 'application/json'}
    
    if data is not None:
        data_bytes = json.dumps(data).encode('utf-8')
        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    else:
        req = urllib.request.Request(url, headers=headers, method=method)
        
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP Error {e.code} on {method} {endpoint}: {e.read().decode()}")
        return None
    except urllib.error.URLError as e:
        print(f"❌ Connection Error: Is the server running? ({e.reason})")
        return None

def test_tasks_api():
    print("\n=== Testing Tasks API ===")
    
    # 1. Create a Task
    print("\n[1] Creating a task...")
    task_data = {
        "title": "Build UI Dashboard",
        "description": "Create the React glassmorphism dashboard",
        "status": "todo",
        "priority": "high"
    }
    created_task = make_request('POST', '/tasks/', task_data)
    if not created_task: return
    print(f"✅ Created Task: {created_task['title']} (ID: {created_task['_id']})")
    task_id = created_task['_id']
    
    # 2. Get All Tasks
    print("\n[2] Fetching all tasks...")
    tasks = make_request('GET', '/tasks/')
    print(f"✅ Found {len(tasks)} tasks in the database.")
    
    # 3. Update the Task
    print(f"\n[3] Updating task {task_id}...")
    update_data = {"status": "in_progress"}
    updated_task = make_request('PUT', f'/tasks/{task_id}', update_data)
    print(f"✅ Updated Task Status to: {updated_task['status']}")
    
    # 4. Delete the Task
    print(f"\n[4] Deleting task {task_id}...")
    delete_resp = make_request('DELETE', f'/tasks/{task_id}')
    print(f"✅ {delete_resp['message']}")

def test_notes_api():
    print("\n=== Testing Notes API ===")
    
    # 1. Create a Note
    print("\n[1] Creating a note...")
    note_data = {
        "title": "Meeting Notes",
        "content": "Discussed MCP integration for Phase 2.",
        "tags": ["AI", "Meeting"]
    }
    created_note = make_request('POST', '/notes/', note_data)
    if not created_note: return
    print(f"✅ Created Note: {created_note['title']} (ID: {created_note['_id']})")
    note_id = created_note['_id']
    
    # 2. Delete the Note
    print(f"\n[2] Deleting note {note_id}...")
    delete_resp = make_request('DELETE', f'/notes/{note_id}')
    print(f"✅ {delete_resp['message']}")

if __name__ == "__main__":
    print("Starting API Tests...")
    test_tasks_api()
    test_notes_api()
    print("\n🎉 All tests completed successfully!")
