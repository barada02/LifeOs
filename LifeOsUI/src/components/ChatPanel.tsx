import { useState, useRef, useEffect } from 'react';
import { aiApi } from '../api/client';

interface Message { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'Show my high-priority tasks',
  'Create a note about today',
  'Summarize my tasks',
  'What tasks are in progress?',
];

interface Props { open: boolean; onToggle: () => void; }

export function ChatPanel({ open, onToggle }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Life OS AI assistant. I can read and update your tasks and notes. How can I help you?' }
  ]);
  const [input,     setInput]    = useState('');
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput('');
    setError('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const res = await aiApi.chat(msg);
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setError(e.message || 'AI service unavailable');
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠ Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    await aiApi.clearSession().catch(() => {});
    setMessages([{ role: 'assistant', content: 'Conversation cleared. How can I help you?' }]);
  };

  return (
    <aside className={`chat-panel ${open ? 'open' : 'closed'}`}>
      {/* Toggle tab */}
      <button className="chat-panel-tab" onClick={onToggle} title="Toggle AI Chat">
        <span className="material-symbols-outlined">{open ? 'chevron_right' : 'smart_toy'}</span>
      </button>

      {open && (
        <>
          {/* Header */}
          <div className="chat-panel-header">
            <div className="chat-panel-title">
              <div className="chat-ai-avatar"><span className="material-symbols-outlined">smart_toy</span></div>
              <div>
                <p className="chat-ai-name">Life OS AI</p>
                <p className="chat-ai-status">
                  {loading ? (
                    <><span className="status-dot pulsing" /> Thinking…</>
                  ) : (
                    <><span className="status-dot online" /> Online</>
                  )}
                </p>
              </div>
            </div>
            <button className="btn-icon" title="Clear conversation" onClick={handleClearSession}>
              <span className="material-symbols-outlined">restart_alt</span>
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages" id="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-avatar ai"><span className="material-symbols-outlined">smart_toy</span></div>
                )}
                <div className="message-bubble">
                  <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="chat-avatar user"><span className="material-symbols-outlined">person</span></div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-message assistant">
                <div className="chat-avatar ai"><span className="material-symbols-outlined">smart_toy</span></div>
                <div className="message-bubble typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (only when few messages) */}
          {messages.length <= 2 && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="chat-suggestion" onClick={() => send(s)}>{s}</button>
              ))}
            </div>
          )}

          {error && <div className="chat-error">{error}</div>}

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              id="chat-input"
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask anything… (Enter to send)"
              rows={2}
              disabled={loading}
            />
            <button
              id="chat-send-btn"
              className="chat-send-btn"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
