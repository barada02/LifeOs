import { useState, useRef, useEffect } from 'react';
import { api } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function RightSidebar({ 
  width, 
  onToggle 
}: { 
  width: 'w-12' | 'w-80', 
  onToggle: () => void 
}) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Life OS Assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, width]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await api.chat.send(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <aside className={`sidebar-transition flex-shrink-0 ${width} bg-surface-container border-l border-outline-variant flex flex-col h-full z-50 relative`}>
      <button 
        className="absolute -left-3 top-20 w-6 h-6 bg-surface-container border border-outline-variant rounded-full flex items-center justify-center text-outline hover:text-primary z-50" 
        onClick={onToggle}
      >
        <span className="material-symbols-outlined text-[16px]">{width === 'w-80' ? 'chevron_right' : 'chevron_left'}</span>
      </button>
      
      {width === 'w-80' && (
        <>
          <div className="p-6 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
              <span className="font-label-sm text-[12px] font-bold uppercase tracking-wider text-on-surface">Life OS Assistant</span>
            </div>
            {isLoading && <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>}
            {messages.length > 1 && (
               <button 
                 onClick={() => { setMessages([{ role: 'assistant', content: 'Conversation reset.' }]); api.chat.reset().catch(console.error); }}
                 className="text-outline hover:text-error text-xs ml-auto mr-2"
               >
                 Reset
               </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`space-y-2 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-secondary-container' : 'bg-primary-container'}`}>
                    <span className={`material-symbols-outlined text-[14px] ${msg.role === 'user' ? 'text-on-secondary-container' : 'text-on-primary-container'}`}>
                      {msg.role === 'user' ? 'person' : 'smart_toy'}
                    </span>
                  </div>
                  <span className="font-label-sm text-[12px] text-outline">
                    {msg.role === 'user' ? 'You' : 'AI Assistant'}
                  </span>
                </div>
                <div className={`${msg.role === 'user' ? 'bg-primary/10 border-primary/20 rounded-tr-none' : 'bg-surface-container-highest border-outline-variant/30 rounded-tl-none'} p-4 rounded-xl border max-w-[90%]`}>
                  <p className="font-body-md text-[14px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-primary">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <span className="text-[10px] font-bold uppercase">Processing request...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-6 border-t border-outline-variant bg-surface-container-low">
            <div className="relative">
              <textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 pr-12 text-on-surface font-body-md text-[14px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none no-scrollbar" 
                placeholder="Ask AI... (Enter to send)" 
                rows={2} 
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                className="absolute right-3 bottom-3 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setInputValue('Summarize my tasks')} className="flex-shrink-0 px-3 py-1 rounded-full bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant hover:border-primary transition-colors">Summarize Tasks</button>
              <button onClick={() => setInputValue('Create a note')} className="flex-shrink-0 px-3 py-1 rounded-full bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant hover:border-primary transition-colors">Create Note</button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
