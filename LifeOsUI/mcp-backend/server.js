import express from 'express';
import cors from 'cors';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// The backend ONLY bridges the MCP Server. No OpenAI logic needed here!
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-memory"]
});

const mcpClient = new Client({
  name: "lifeos-backend-bridge",
  version: "1.0.0",
}, {
  capabilities: {
    prompts: {},
    resources: {},
    tools: {},
  },
});

let isMcpConnected = false;

async function connectMcp() {
  try {
    await mcpClient.connect(transport);
    isMcpConnected = true;
    console.log("Connected to MCP Server (server-memory) successfully.");
  } catch (err) {
    console.error("Failed to connect to MCP Server:", err);
  }
}

connectMcp();

// Endpoint for frontend to fetch tools dynamically
app.get('/api/tools', async (req, res) => {
  try {
    if (!isMcpConnected) return res.status(503).json({ error: "MCP not connected" });
    const tools = await mcpClient.listTools();
    res.json(tools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint for frontend to execute a specific tool
app.post('/api/call-tool', async (req, res) => {
  try {
    if (!isMcpConnected) return res.status(503).json({ error: "MCP not connected" });
    const { name, arguments: args } = req.body;
    
    if (!name) return res.status(400).json({ error: "Tool name is required" });
    
    console.log(`Executing tool: ${name}`, args);
    const result = await mcpClient.callTool({ name, arguments: args });
    res.json(result);
  } catch (err) {
    console.error("Tool execution error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`MCP Bridge Server running on http://localhost:${PORT}`);
  console.log(`Acting as proxy for React App. OpenAI logic shifted to client.`);
  console.log(`=========================================`);
});
