import { useState, useRef, useEffect } from 'react'
import OpenAI from 'openai'
import './index.css'

interface Message {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  name?: string
  tool_call_id?: string
  tool_calls?: any[]
}

// Ensure you run `VITE_OPENAI_API_KEY` in .env!
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''
const baseURL = import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1'

const openai = new OpenAI({
  apiKey: apiKey || 'dummy-key',
  baseURL: baseURL,
  dangerouslyAllowBrowser: true,
})

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [mcpConfigError, setMcpConfigError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (!apiKey && baseURL === 'https://api.openai.com/v1') {
      setMcpConfigError('Notice: Please set VITE_OPENAI_API_KEY and VITE_OPENAI_BASE_URL in LifeOsUI/.env')
    }
  }, [])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const conversation = [...messages, userMessage]
    setMessages(conversation)
    setInput('')
    setIsTyping(true)

    try {
      // 1. Fetch available MCP tools from our Bridge Server
      let toolsConfig: any[] | undefined = undefined;
      try {
        const toolsRes = await fetch('http://localhost:3001/api/tools')
        if (toolsRes.ok) {
           const toolsData = await toolsRes.json()
           if (toolsData && toolsData.tools) {
             toolsConfig = toolsData.tools.map((t: any) => ({
                type: 'function',
                function: {
                   name: t.name,
                   description: t.description || '',
                   parameters: t.inputSchema || {}
                }
             }))
           }
        }
      } catch (err) {
         console.warn("Could not fetch tools from MCP Bridge. Continuing without tools...", err)
      }

      // 2. Call OpenAI / Custom LLM Endpoint directly from Client
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // Adjust model if using LMStudio/OpenRouter etc.
        messages: conversation as any, // Cast due to possible Tool calls
        tools: toolsConfig && toolsConfig.length > 0 ? toolsConfig : undefined,
      })

      const assistantMsg = response.choices[0].message
      let newConversation = [...conversation, assistantMsg as Message]
      setMessages([...newConversation])

      // 3. Handle Tool calls dynamically
      if (assistantMsg.tool_calls && assistantMsg.tool_calls.length > 0) {
         for (const tc of assistantMsg.tool_calls) {
            let toolText = ""
            try {
               const args = JSON.parse(tc.function.arguments)
               const callRes = await fetch('http://localhost:3001/api/call-tool', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: tc.function.name, arguments: args })
               })
               if (!callRes.ok) throw new Error("MCP Tool Bridge execution failed")
               
               const resultData = await callRes.json()
               if (resultData.content && resultData.content.length > 0) {
                  toolText = resultData.content.map((c: any) => c.text).join('\n')
               } else {
                  toolText = "Success (No output returned)"
               }
            } catch (err: any) {
               toolText = `Error running tool: ${err.message}`
            }

            // Append the tool result for the LLM
            newConversation.push({
               role: 'tool',
               tool_call_id: tc.id,
               name: tc.function.name,
               content: toolText
            })
         }
         
         // 4. Send the tool results back up to OpenAI to form the final user-facing answer
         const finalResponse = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: newConversation as any,
         })
         
         setMessages([...newConversation, finalResponse.choices[0].message as Message])
      }
      
    } catch (error: any) {
      console.error(error)
      setMessages([...conversation, { role: 'assistant', content: `API Error: ${error.message}` }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-icon">AI</div>
        <div className="header-title">
          <h1>LifeOS Assistant</h1>
          <p>
            <span className="status-dot"></span>
            Client-Side Agent
          </p>
          {mcpConfigError && <p style={{color: 'orange', fontSize: '11px'}}>{mcpConfigError}</p>}
        </div>
      </header>

      <div className="chat-container">
        {messages.length === 0 && (
          <div className="message assistant" style={{ alignSelf: 'center', opacity: 0.7, marginTop: 'auto', marginBottom: 'auto'}}>
            <div className="message-content" style={{ background: 'transparent', textAlign: 'center', border: 'none' }}>
              <h2 style={{ marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '600' }}>Welcome to LifeOS</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Your LLM runs on the client. It will fetch tools from the MCP Node Bridge!<br/>
                Try asking me to <strong>remember something</strong>.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          if (msg.role === 'tool' || msg.tool_calls) return null; // Hide raw tool execution logs in UI for cleanliness
          return (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-badge">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="message assistant">
             <div className="message-badge">Assistant is thinking & calling MCP...</div>
             <div className="message-content">
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          className="input-box"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask me a question..."
          disabled={isTyping}
        />
        <button 
          className="send-button" 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default App
