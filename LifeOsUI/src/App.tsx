import { useState, useRef, useEffect } from 'react'
import './index.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsTyping(true)

    try {
      // Connect to the Express backend (which bridges to MCP)
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch response')
      }

      const data = await response.json()
      
      if (data.error) {
         throw new Error(data.error)
      }

      setMessages([...newMessages, { role: 'assistant', content: data.content || data.message }])
    } catch (error: any) {
      console.error(error)
      setMessages([...newMessages, { role: 'assistant', content: `Error: ${error.message}. Make sure the Node backend is running on port 3001!` }])
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
            Agent + Node MCP Bridge
          </p>
        </div>
      </header>

      <div className="chat-container">
        {messages.length === 0 && (
          <div className="message assistant" style={{ alignSelf: 'center', opacity: 0.7, marginTop: 'auto', marginBottom: 'auto'}}>
            <div className="message-content" style={{ background: 'transparent', textAlign: 'center', border: 'none' }}>
              <h2 style={{ marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '600' }}>Welcome to LifeOS</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                I am connected to your MCP Server (Memory).<br/>
                Try asking me to <strong>"remember that my favorite color is pink"</strong> or <strong>"create a graph about my project"</strong>!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-badge">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="message-content">
              {msg.content}
            </div>
          </div>
        ))}
        
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
          placeholder="Ask me to remember something or use a tool..."
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
