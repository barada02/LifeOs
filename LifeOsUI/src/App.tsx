import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'
import { api } from './api'
import type { Task, Note, ChatMessage, Toast, TaskCreate, TaskUpdate, NoteCreate, NoteUpdate } from './types'

function formatDate(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function dueDateClass(iso?: string): string {
  if (!iso) return ''
  const now = new Date()
  const due = new Date(iso)
  const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'overdue'
  if (diff < 2) return 'soon'
  return ''
}

let toastId = 0

function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])
  return { toasts, addToast }
}

type WsStatus = 'connecting' | 'connected' | 'disconnected'

function useWebSocket(onMessage: (data: unknown) => void) {
  const [status, setStatus] = useState<WsStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return
    setStatus('connecting')
    try {
      const ws = new WebSocket('ws://localhost:8000/ws')
      wsRef.current = ws
      ws.onopen = () => setStatus('connected')
      ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch { /* ignore */ } }
      ws.onclose = () => { setStatus('disconnected'); reconnectTimer.current = setTimeout(connect, 4000) }
      ws.onerror = () => ws.close()
    } catch {
      setStatus('disconnected')
      reconnectTimer.current = setTimeout(connect, 4000)
    }
  }, [onMessage])
  useEffect(() => {
    connect()
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [connect])
  return status
}


interface TaskModalProps {
  task?: Task
  onClose: () => void
  onSave: (data: TaskCreate | TaskUpdate) => Promise<void>
}
function TaskModal({ task, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [status, setStatus] = useState<Task['status']>(task?.status ?? 'todo')
  const [priority, setPriority] = useState<Task['priority']>(task?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(task?.due_date ? task.due_date.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    await onSave({ title: title.trim(), description: description.trim() || undefined, status, priority, due_date: dueDate ? new Date(dueDate).toISOString() : undefined })
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div className="modal-header">
          <h3 id="task-modal-title">{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="task-title">Title</label>
              <input id="task-title" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description</label>
              <textarea id="task-desc" className="form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add more details..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select id="task-status" className="form-select" value={status} onChange={e => setStatus(e.target.value as Task['status'])}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">Priority</label>
                <select id="task-priority" className="form-select" value={priority} onChange={e => setPriority(e.target.value as Task['priority'])}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="task-due">Due Date</label>
              <input id="task-due" type="date" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>{saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}


interface NoteModalProps {
  note?: Note
  onClose: () => void
  onSave: (data: NoteCreate | NoteUpdate) => Promise<void>
}
function NoteModal({ note, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState(note?.title ?? '')
  const [content, setContent] = useState(note?.content ?? '')
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') ?? '')
  const [saving, setSaving] = useState(false)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await onSave({ title: title.trim(), content: content.trim(), tags })
    setSaving(false)
  }
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="note-modal-title">
        <div className="modal-header">
          <h3 id="note-modal-title">{note ? 'Edit Note' : 'New Note'}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">&#x2715;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label" htmlFor="note-title">Title</label>
              <input id="note-title" className="form-input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Note title" required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="note-content">Content</label>
              <textarea id="note-content" className="form-textarea" style={{ minHeight: '140px' }} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your note here..." />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="note-tags">Tags (comma-separated)</label>
              <input id="note-tags" className="form-input" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="e.g. work, ideas, personal" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving || !title.trim()}>{saving ? 'Saving...' : note ? 'Save Changes' : 'Create Note'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}


interface TasksTabProps {
  tasks: Task[]
  loading: boolean
  error: string | null
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onNew: () => void
}
function TasksTab({ tasks, loading, error, onToggleDone, onEdit, onDelete, onNew }: TasksTabProps) {
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const filtered = tasks.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter || t.priority === filter
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.description ?? '').toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })
  const counts = { todo: tasks.filter(t => t.status === 'todo').length, in_progress: tasks.filter(t => t.status === 'in_progress').length, done: tasks.filter(t => t.status === 'done').length }
  const filterLabels: Record<string, string> = { all: `All (${tasks.length})`, todo: `To Do (${counts.todo})`, in_progress: `In Progress (${counts.in_progress})`, done: `Done (${counts.done})`, high: 'High', medium: 'Medium', low: 'Low' }
  return (
    <div className="tab-content">
      <div className="content-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3>Tasks</h3>
            <span className="text-muted">{tasks.length} total</span>
          </div>
          <div className="filters-bar">
            {(['all', 'todo', 'in_progress', 'done', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{filterLabels[f]}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '180px' }} />
          <button className="btn-primary" onClick={onNew}>+ New Task</button>
        </div>
      </div>
      {error && <div className="error-banner">&#9888; {error}</div>}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#10003;</div>
          <p>{tasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match your filter.'}</p>
          {tasks.length === 0 && <button className="btn-primary" onClick={onNew}>+ Create Task</button>}
        </div>
      ) : (
        <div className="tasks-list">
          {filtered.map(task => (
            <div key={task._id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
              <button className={`task-checkbox ${task.status === 'done' ? 'checked' : ''}`} onClick={() => onToggleDone(task)} aria-label={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}>
                {task.status === 'done' && '✓'}
              </button>
              <div className="task-body">
                <div className="task-title">{task.title}</div>
                {task.description && <div className="task-description">{task.description}</div>}
                <div className="task-meta">
                  <span className={`badge badge-status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                  {task.due_date && <span className={`due-date ${dueDateClass(task.due_date)}`}>Due {formatDate(task.due_date)}</span>}
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-icon" onClick={() => onEdit(task)} title="Edit" aria-label="Edit task">&#9998;</button>
                <button className="btn-icon" onClick={() => onDelete(task._id)} title="Delete" aria-label="Delete task" style={{ color: 'var(--red)' }}>&#128465;</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


interface NotesTabProps {
  notes: Note[]
  loading: boolean
  error: string | null
  onEdit: (note: Note) => void
  onDelete: (id: string) => void
  onNew: () => void
}
function NotesTab({ notes, loading, error, onEdit, onDelete, onNew }: NotesTabProps) {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags))).sort()
  const filtered = notes.filter(n => {
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    const matchTag = !tagFilter || n.tags.includes(tagFilter)
    return matchSearch && matchTag
  })
  return (
    <div className="tab-content">
      <div className="content-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3>Notes</h3>
            <span className="text-muted">{notes.length} total</span>
          </div>
          {allTags.length > 0 && (
            <div className="filters-bar">
              <button className={`filter-btn ${!tagFilter ? 'active' : ''}`} onClick={() => setTagFilter('')}>All</button>
              {allTags.map(tag => (
                <button key={tag} className={`filter-btn ${tagFilter === tag ? 'active' : ''}`} onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}>{tag}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input className="search-input" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '180px' }} />
          <button className="btn-primary" onClick={onNew}>+ New Note</button>
        </div>
      </div>
      {error && <div className="error-banner">&#9888; {error}</div>}
      {loading ? (
        <div className="loading-spinner"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#128221;</div>
          <p>{notes.length === 0 ? 'No notes yet. Capture your first thought!' : 'No notes match your search.'}</p>
          {notes.length === 0 && <button className="btn-primary" onClick={onNew}>+ Create Note</button>}
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map(note => (
            <div key={note._id} className="note-card">
              <div className="note-card-header">
                <div className="note-title">{note.title}</div>
                <div className="note-actions">
                  <button className="btn-icon" onClick={() => onEdit(note)} title="Edit" aria-label="Edit note">&#9998;</button>
                  <button className="btn-icon" onClick={() => onDelete(note._id)} title="Delete" aria-label="Delete note" style={{ color: 'var(--red)' }}>&#128465;</button>
                </div>
              </div>
              {note.content && <div className="note-content">{note.content}</div>}
              {note.tags.length > 0 && <div className="note-tags">{note.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>}
              <div className="note-date">{formatDate(note.updated_at)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


interface ChatTabProps {
  messages: ChatMessage[]
  onSend: (msg: string) => void
  onReset: () => void
  loading: boolean
}
function ChatTab({ messages, onSend, onReset, loading }: ChatTabProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  function handleSend() {
    const msg = input.trim()
    if (!msg || loading) return
    setInput('')
    onSend(msg)
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }
  const suggestions = [
    'What tasks do I have?',
    'Create a task: Review project proposal, high priority',
    'Show me all my notes',
    'Mark my first task as done',
  ]
  return (
    <div className="tab-content chat-container">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px' }}>
        <button className="btn-secondary" onClick={onReset} style={{ fontSize: '12px', padding: '4px 10px' }}>Clear history</button>
      </div>
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-icon">&#129302;</div>
            <h3>Life OS AI Assistant</h3>
            <p>I can help you manage your tasks and notes using natural language. Try asking me something!</p>
            <div className="chat-suggestions">
              {suggestions.map(s => <button key={s} className="chat-suggestion" onClick={() => onSend(s)}>{s}</button>)}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="chat-avatar">{msg.role === 'user' ? 'U' : 'AI'}</div>
              <div className={`message-bubble ${msg.thinking ? 'thinking' : ''}`}>
                {msg.thinking ? <div className="typing-dots"><span /><span /><span /></div> : msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input-area">
        <textarea className="chat-input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask me to manage your tasks and notes... (Enter to send)" rows={1} disabled={loading} />
        <button className="btn-send" onClick={handleSend} disabled={!input.trim() || loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span>{t.type === 'success' ? '&#10003;' : t.type === 'error' ? '&#9888;' : 'i'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}


type ActiveTab = 'tasks' | 'notes' | 'chat'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('tasks')
  const [tasks, setTasks] = useState<Task[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [notesLoading, setNotesLoading] = useState(true)
  const [tasksError, setTasksError] = useState<string | null>(null)
  const [notesError, setNotesError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const [taskModal, setTaskModal] = useState<{ open: boolean; task?: Task }>({ open: false })
  const [noteModal, setNoteModal] = useState<{ open: boolean; note?: Note }>({ open: false })
  const { toasts, addToast } = useToasts()

  const handleWsMessage = useCallback((data: unknown) => {
    const msg = data as { type?: string }
    if (msg?.type === 'task_change' || msg?.type === 'data_change') loadTasks()
    if (msg?.type === 'note_change' || msg?.type === 'data_change') loadNotes()
  }, [])

  const wsStatus = useWebSocket(handleWsMessage)

  async function loadTasks() {
    try {
      setTasksError(null)
      const data = await api.tasks.list()
      setTasks(data)
    } catch (e) { setTasksError((e as Error).message) }
    finally { setTasksLoading(false) }
  }

  async function loadNotes() {
    try {
      setNotesError(null)
      const data = await api.notes.list()
      setNotes(data)
    } catch (e) { setNotesError((e as Error).message) }
    finally { setNotesLoading(false) }
  }

  useEffect(() => { loadTasks(); loadNotes() }, [])

  async function handleCreateTask(data: TaskCreate | TaskUpdate) {
    try {
      const created = await api.tasks.create(data as TaskCreate)
      setTasks(prev => [created, ...prev])
      setTaskModal({ open: false })
      addToast('Task created', 'success')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleUpdateTask(id: string, data: TaskCreate | TaskUpdate) {
    try {
      const updated = await api.tasks.update(id, data as TaskUpdate)
      setTasks(prev => prev.map(t => t._id === id ? updated : t))
      setTaskModal({ open: false })
      addToast('Task updated', 'success')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleToggleDone(task: Task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    try {
      const updated = await api.tasks.update(task._id, { status: newStatus })
      setTasks(prev => prev.map(t => t._id === task._id ? updated : t))
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleDeleteTask(id: string) {
    if (!confirm('Delete this task?')) return
    try {
      await api.tasks.delete(id)
      setTasks(prev => prev.filter(t => t._id !== id))
      addToast('Task deleted', 'info')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleCreateNote(data: NoteCreate | NoteUpdate) {
    try {
      const created = await api.notes.create(data as NoteCreate)
      setNotes(prev => [created, ...prev])
      setNoteModal({ open: false })
      addToast('Note created', 'success')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleUpdateNote(id: string, data: NoteCreate | NoteUpdate) {
    try {
      const updated = await api.notes.update(id, data as NoteUpdate)
      setNotes(prev => prev.map(n => n._id === id ? updated : n))
      setNoteModal({ open: false })
      addToast('Note updated', 'success')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleDeleteNote(id: string) {
    if (!confirm('Delete this note?')) return
    try {
      await api.notes.delete(id)
      setNotes(prev => prev.filter(n => n._id !== id))
      addToast('Note deleted', 'info')
    } catch (e) { addToast((e as Error).message, 'error') }
  }

  async function handleSendChat(message: string) {
    setChatMessages(prev => [...prev, { role: 'user', content: message }])
    setChatMessages(prev => [...prev, { role: 'assistant', content: '', thinking: true }])
    setChatLoading(true)
    try {
      const res = await api.chat.send(message)
      setChatMessages(prev => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: 'assistant', content: res.response }; return msgs })
      loadTasks(); loadNotes()
    } catch (e) {
      setChatMessages(prev => { const msgs = [...prev]; msgs[msgs.length - 1] = { role: 'assistant', content: 'Sorry, I encountered an error. Please check that the backend is running.' }; return msgs })
      addToast((e as Error).message, 'error')
    } finally { setChatLoading(false) }
  }

  async function handleResetChat() {
    try { await api.chat.reset() } catch { /* ignore */ }
    setChatMessages([])
    addToast('Chat history cleared', 'info')
  }

  const tabTitle = activeTab === 'tasks' ? 'Tasks' : activeTab === 'notes' ? 'Notes' : 'AI Chat'

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} aria-label="Navigation">
        <div className="sidebar-header">
          <div className="app-logo">
            <div className="logo-icon" aria-hidden="true">L</div>
            <span className="app-title">LifeOS</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(c => !c)} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {sidebarCollapsed ? '&#9654;' : '&#9664;'}
          </button>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {(['tasks', 'notes', 'chat'] as const).map(tab => (
            <button key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined}>
              <span className="nav-icon" aria-hidden="true">{tab === 'tasks' ? '&#10003;' : tab === 'notes' ? '&#128221;' : '&#129302;'}</span>
              <span className="nav-label">{tab === 'tasks' ? 'Tasks' : tab === 'notes' ? 'Notes' : 'AI Chat'}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="ws-status" title={`WebSocket: ${wsStatus}`}>
            <div className={`ws-dot ${wsStatus}`} aria-hidden="true" />
            <span className="ws-label">{wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting...' : 'Offline'}</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="app-header">
          <div className="header-left"><h2>{tabTitle}</h2></div>
          <div className="header-right">
            <button className="icon-button" onClick={() => { loadTasks(); loadNotes() }} title="Refresh" aria-label="Refresh data">&#8635;</button>
          </div>
        </header>
        <div className="content-area">
          {activeTab === 'tasks' && (
            <TasksTab tasks={tasks} loading={tasksLoading} error={tasksError} onToggleDone={handleToggleDone} onEdit={task => setTaskModal({ open: true, task })} onDelete={handleDeleteTask} onNew={() => setTaskModal({ open: true })} />
          )}
          {activeTab === 'notes' && (
            <NotesTab notes={notes} loading={notesLoading} error={notesError} onEdit={note => setNoteModal({ open: true, note })} onDelete={handleDeleteNote} onNew={() => setNoteModal({ open: true })} />
          )}
          {activeTab === 'chat' && (
            <ChatTab messages={chatMessages} onSend={handleSendChat} onReset={handleResetChat} loading={chatLoading} />
          )}
        </div>
      </main>

      {taskModal.open && (
        <TaskModal task={taskModal.task} onClose={() => setTaskModal({ open: false })} onSave={taskModal.task ? (data) => handleUpdateTask(taskModal.task!._id, data) : handleCreateTask} />
      )}
      {noteModal.open && (
        <NoteModal note={noteModal.note} onClose={() => setNoteModal({ open: false })} onSave={noteModal.note ? (data) => handleUpdateNote(noteModal.note!._id, data) : handleCreateNote} />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

export default App
