# LifeOS - React + MCP Integration Demo

This repository demonstrates how to integrate a React frontend with a Model Context Protocol (MCP) server.

Since MCP servers often rely on standard Input/Output (`stdio`) or Node.js features to run properly, they cannot be executed directly inside a web browser. The industry standard approach is to use a **lightweight Node.js Bridge Server**.

This project contains two parts:
1. **The React UI (`src/`)**: A sleek, dark-mode, glassmorphism chat interface.
2. **The MCP Bridge Backend (`mcp-backend/`)**: An Express server that spawns the MCP server via `stdio` and acts as a middleman using OpenAI.

## Prerequisites
- Node.js installed (v18+)
- An OpenAI API Key

---

## 🚀 Setup Instructions

### 1. Set Up the Node.js MCP Bridge (Backend)

The backend handles the connection to the MCP Server (using the official `@modelcontextprotocol/server-memory` graph agent as a demo) and makes the OpenAI API calls.

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd mcp-backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create an environment file by renaming the example file:
   ```bash
   cp .env.example .env
   ```
4. **Important**: Open the `.env` file and replace `your_openai_api_key_here` with your actual OpenAI API Key.
5. Start the backend Server:
   ```bash
   npm start
   ```
   *You should see a message saying "Connected to MCP Server (server-memory) successfully."*

### 2. Set Up the React App (Frontend)

Open a **new terminal tab** (so the backend keeps running) and navigate to the root of your UI project.

1. If you haven't already, install the React dependencies:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173/`. You are now ready to chat!

## 🧪 Testing the Integration
Once both servers are running:
1. Open the UI in your browser.
2. Ask the assistant to remember something! Try typing:
   > *"Remember that my favorite animal is a Capybara and I am learning React."*
3. The LLM will use the active MCP Memory server tools to save your data permanently to the knowledge graph.
4. Later, ask:
   > *"What is my favorite animal?"*
5. The LLM will leverage the MCP server tools to search the entity graph and find your answer!

## 🔧 How It Works Under The Hood
- **React Frontend**: Captures user requests and polls `POST http://localhost:3001/api/chat`.
- **Node Bridge**: Receives the messages. Calls `mcpClient.listTools()` to get the available MCP tools dynamically.
- **OpenAI Intercept**: The Node Bridge forwards the user message along with the MCP tools to OpenAI (`gpt-4o`).
- **Tool Exection**: If OpenAI decides a tool is needed (like reading/writing memory), the Node Bridge invokes `mcpClient.callTool()`, gets the result, and feeds it back to OpenAI to generate the final response for the React app.

Enjoy your stunning LifeOS UI!
