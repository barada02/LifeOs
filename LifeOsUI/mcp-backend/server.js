import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is not set in .env. Please add it.");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Initialize MCP transport to run an MCP server locally.
// We are using the official server-memory as a demo.
// It allows the LLM to build a knowledge graph of user information!
const transport = new StdioClientTransport({
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-memory"]
});

const mcpClient = new Client({
  name: "lifeos-backend-client",
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
    
    // Log available tools just to verify
    const tools = await mcpClient.listTools();
    console.log("Initial MCP Tools available:", tools.tools.map(t => t.name).join(", "));
  } catch (err) {
    console.error("Failed to connect to MCP Server:", err);
  }
}

connectMcp();

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages array" });
    }

    if (!isMcpConnected) {
       return res.status(500).json({ error: "Waiting for MCP server to connect..." });
    }

    // 1. Fetch the latest tools directly from the MCP Server dynamically
    const mcpToolsRes = await mcpClient.listTools();
    const openaiTools = mcpToolsRes.tools.map((tool) => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description || "",
        parameters: tool.inputSchema,
      },
    }));

    console.log("Calling OpenAI with tools...");
    
    // 2. Call OpenAI, passing the MCP tools so the LLM knows how to use them
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Change if needed
      messages: messages,
      tools: openaiTools.length > 0 ? openaiTools : undefined,
    });

    let message = response.choices[0].message;
    const finalMessages = [...messages, message];

    // 3. Handle Tool Calls: If OpenAI decided to use any MCP tools
    if (message.tool_calls && message.tool_calls.length > 0) {
      console.log("LLM invoked tools:", message.tool_calls.map(tc => tc.function.name));
      
      for (const toolCall of message.tool_calls) {
        let toolResultText = "";
        try {
          const args = JSON.parse(toolCall.function.arguments);
          console.log(`Executing MCP tool ${toolCall.function.name} with args:`, args);
          
          // Execute the tool in the connected MCP server
          const result = await mcpClient.callTool({
            name: toolCall.function.name,
            arguments: args
          });
          
          if (result && result.content && result.content.length > 0) {
             toolResultText = result.content.map(c => c.text).join('\n') || JSON.stringify(result.content);
          } else {
             toolResultText = "Success (No output returned)";
          }
        } catch (error) {
          toolResultText = `Error calling tool: ${error.message}`;
        }

        console.log(`Tool result for ${toolCall.function.name}:`, toolResultText);

        // Append the tool result for the LLM to read
        finalMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolResultText,
        });
      }

      // 4. Send the tool results back up to OpenAI to form the final user-facing answer
      console.log("Sending tool results back to OpenAI...");
      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: finalMessages,
      });

      return res.json({ 
        role: "assistant", 
        content: finalResponse.choices[0].message.content 
      });
    }

    // If no tools were called, return standard text response
    return res.json({ 
      role: "assistant", 
      content: message.content 
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({ error: error.message || "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`MCP Backend Server running at port ${PORT}`);
  console.log(`OpenAI API Key provided: ${OPENAI_API_KEY ? "YES" : "NO"}`);
  console.log(`=========================================`);
});
