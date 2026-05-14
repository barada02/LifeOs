import { useEffect, useState } from 'react';
import { tasksApi } from '../../api/client';
import type { Task, TaskCreate, TaskUpdate, TaskStatus, TaskPriority } from '../../types';

// ── Task Form Modal ────────────────────────────────────────────────────────────
interface TaskFormProps {
  initial?: Task;
  onSave: (data: TaskCreate | TaskUpdate) => void;
  onClose: () => void;
  loading: boolean;
}
function TaskForm({ initial, onSave, onClose, loading }: TaskFormProps) {
  const [title,       setTitle]       = useState(initial?.title       ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status,      setStatus]      = useState<TaskStatus>(initial?.status ?? 'todo');
  const [priority,    setPriority]    = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [due_date,    setDueDate]     = useState(initial?.due_date ?? '');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal>
        <h3 className="modal-title">{initial ? 'Edit Task' : 'New Task'}</h3>
        <form
          className="modal-form"
          onSubmit={e => { e.preventDefault(); onSave({ title, description, status, priority, due_date: due_date || undefined }); }}
        >
          <label>
            Title *
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Task title" />
          </label>
          <label>
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details" rows={3} />
          </label>
          <div className="modal-row">
            <label>
              Status
              <select value={status} onChange={e => setStatus(e.target.value as TaskStatus)}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </label>
            <label>
              Priority
              <select value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
          <label>
            Due Date
            <input type="date" value={due_date} onChange={e => setDueDate(e.target.value)} />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : initial ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Tasks View ───────────────────────────────────────────────────────────
export function TasksView() {
  const [tasks,        setTasks]        = useState<Task[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [editTarget,   setEditTarget]   = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');

  const fetchTasks = () => {
    setLoading(true);
    tasksApi.list().then(setTasks).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(fetchTasks, []);

  const handleCreate = async (data: TaskCreate | TaskUpdate) => {
    setSaving(true);
    try { await tasksApi.create(data as TaskCreate); fetchTasks(); setShowForm(false); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data: TaskCreate | TaskUpdate) => {
    if (!editTarget) return;
    setSaving(true);
    try { await tasksApi.update(editTarget._id, data); fetchTasks(); setEditTarget(null); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksApi.delete(id); fetchTasks(); }
    catch (e: any) { setError(e.message); }
  };

  const handleToggleDone = async (task: Task) => {
    const newStatus: TaskStatus = task.status === 'done' ? 'todo' : 'done';
    try { await tasksApi.update(task._id, { status: newStatus }); fetchTasks(); }
    catch (e: any) { setError(e.message); }
  };

  const visible = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="view tasks-view">
      {/* Toolbar */}
      <div className="view-toolbar">
        <div className="filter-tabs">
          {(['all', 'todo', 'in_progress', 'done'] as const).map(s => (
            <button
              key={s}
              id={`filter-${s}`}
              className={`filter-tab ${filterStatus === s ? 'active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="filter-count">
                {s === 'all' ? tasks.length : tasks.filter(t => t.status === s).length}
              </span>
            </button>
          ))}
        </div>
        <button id="create-task-btn" className="btn-primary" onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined">add</span> New Task
        </button>
      </div>

      {error && <div className="error-banner"><span>⚠</span> {error} <button onClick={() => setError('')}>✕</button></div>}

      {loading ? (
        <div className="spinner-wrap full"><div className="spinner" /></div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon">checklist</span>
          <p>{filterStatus === 'all' ? 'No tasks yet. Create your first one!' : `No ${filterStatus} tasks.`}</p>
          {filterStatus === 'all' && <button className="btn-primary" onClick={() => setShowForm(true)}>Create Task</button>}
        </div>
      ) : (
        <div className="tasks-list">
          {visible.map(task => (
            <div key={task._id} className={`task-card ${task.status === 'done' ? 'done' : ''}`}>
              <button className={`task-check ${task.status === 'done' ? 'checked' : ''}`} onClick={() => handleToggleDone(task)}>
                {task.status === 'done' && '✓'}
              </button>
              <div className="task-body">
                <p className="task-title">{task.title}</p>
                {task.description && <p className="task-description">{task.description}</p>}
                <div className="task-meta">
                  <span className={`badge badge-priority-${task.priority}`}>{task.priority}</span>
                  <span className={`badge badge-status-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  {task.due_date && (
                    <span className="due-date">
                      <span className="material-symbols-outlined" style={{fontSize:'12px'}}>calendar_today</span>
                      {task.due_date}
                    </span>
                  )}
                </div>
              </div>
              <div className="task-actions">
                <button className="btn-icon" title="Edit" onClick={() => setEditTarget(task)}>
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(task._id)}>
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm onSave={handleCreate} onClose={() => setShowForm(false)} loading={saving} />
      )}
      {editTarget && (
        <TaskForm initial={editTarget} onSave={handleUpdate} onClose={() => setEditTarget(null)} loading={saving} />
      )}
    </div>
  );
}
