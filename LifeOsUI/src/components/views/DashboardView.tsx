import { useEffect, useState } from 'react';
import { tasksApi, notesApi } from '../../api/client';
import type { Task, Note } from '../../types';
import type { AppView } from '../../pages/AppShell';

interface Props { onNavigate: (v: AppView) => void; }

export function DashboardView({ onNavigate }: Props) {
  const [tasks,  setTasks]  = useState<Task[]>([]);
  const [notes,  setNotes]  = useState<Note[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);

  useEffect(() => {
    tasksApi.list().then(setTasks).catch(console.error).finally(() => setLoadingTasks(false));
    notesApi.list().then(setNotes).catch(console.error).finally(() => setLoadingNotes(false));
  }, []);

  const highPriority  = tasks.filter(t => t.priority === 'high');
  const inProgress    = tasks.filter(t => t.status === 'in_progress');
  const done          = tasks.filter(t => t.status === 'done');
  const completionPct = tasks.length ? Math.round((done.length / tasks.length) * 100) : 0;

  return (
    <div className="view dashboard-view">
      {/* Stats row */}
      <div className="stats-grid">
        <StatCard icon="checklist" value={tasks.length} label="Total Tasks" color="primary" />
        <StatCard icon="flag" value={highPriority.length} label="High Priority" color="danger" />
        <StatCard icon="autorenew" value={inProgress.length} label="In Progress" color="warning" />
        <StatCard icon="description" value={notes.length} label="Notes" color="accent" />
      </div>

      {/* Progress bar */}
      <div className="dashboard-card progress-section">
        <div className="card-header">
          <h3>Overall Progress</h3>
          <span className="badge badge-accent">{completionPct}% complete</span>
        </div>
        <div className="progress-bar-wrap">
          <div className="progress-bar" style={{ width: `${completionPct}%` }} />
        </div>
        <p className="progress-label">{done.length} of {tasks.length} tasks completed</p>
      </div>

      <div className="dashboard-two-col">
        {/* Recent Tasks */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>High Priority Tasks</h3>
            <button className="card-link" onClick={() => onNavigate('tasks')}>View all →</button>
          </div>
          {loadingTasks ? <Spinner /> : highPriority.length === 0 ? (
            <EmptyState icon="checklist" msg="No high-priority tasks. You're on top of it!" />
          ) : (
            <ul className="task-mini-list">
              {highPriority.slice(0, 5).map(t => (
                <li key={t._id} className={`task-mini-item ${t.status === 'done' ? 'done' : ''}`}>
                  <span className={`task-mini-dot priority-${t.priority}`} />
                  <span className="task-mini-title">{t.title}</span>
                  <span className={`badge badge-status-${t.status}`}>{t.status.replace('_', ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Notes */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Notes</h3>
            <button className="card-link" onClick={() => onNavigate('notes')}>View all →</button>
          </div>
          {loadingNotes ? <Spinner /> : notes.length === 0 ? (
            <EmptyState icon="description" msg="No notes yet. Start capturing ideas!" />
          ) : (
            <ul className="notes-mini-list">
              {notes.slice(0, 5).map(n => (
                <li key={n._id} className="note-mini-item">
                  <span className="note-mini-title">{n.title}</span>
                  <span className="note-mini-preview">{n.content.slice(0, 60)}{n.content.length > 60 ? '…' : ''}</span>
                  {n.tags.length > 0 && (
                    <div className="note-mini-tags">
                      {n.tags.slice(0, 3).map(tag => <span key={tag} className="tag">#{tag}</span>)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number; label: string; color: string }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="spinner-wrap"><div className="spinner" /></div>;
}

function EmptyState({ icon, msg }: { icon: string; msg: string }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined empty-icon">{icon}</span>
      <p>{msg}</p>
    </div>
  );
}
