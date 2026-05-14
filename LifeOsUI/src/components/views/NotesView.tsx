import { useEffect, useState } from 'react';
import { notesApi } from '../../api/client';
import type { Note, NoteCreate, NoteUpdate } from '../../types';

// ── Note Form Modal ───────────────────────────────────────────────────────────
interface NoteFormProps {
  initial?: Note;
  onSave: (data: NoteCreate | NoteUpdate) => void;
  onClose: () => void;
  loading: boolean;
}
function NoteForm({ initial, onSave, onClose, loading }: NoteFormProps) {
  const [title,   setTitle]   = useState(initial?.title   ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [tagsStr, setTagsStr] = useState((initial?.tags ?? []).join(', '));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={e => e.stopPropagation()} role="dialog" aria-modal>
        <h3 className="modal-title">{initial ? 'Edit Note' : 'New Note'}</h3>
        <form
          className="modal-form"
          onSubmit={e => {
            e.preventDefault();
            const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
            onSave({ title, content, tags });
          }}
        >
          <label>
            Title *
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Note title" />
          </label>
          <label>
            Content *
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              placeholder="Write your note here…"
              rows={8}
            />
          </label>
          <label>
            Tags <span className="label-hint">(comma separated)</span>
            <input value={tagsStr} onChange={e => setTagsStr(e.target.value)} placeholder="idea, work, personal" />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : initial ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Notes View ───────────────────────────────────────────────────────────
export function NotesView() {
  const [notes,      setNotes]      = useState<Note[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [editTarget, setEditTarget] = useState<Note | null>(null);
  const [search,     setSearch]     = useState('');

  const fetchNotes = () => {
    setLoading(true);
    notesApi.list().then(setNotes).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(fetchNotes, []);

  const handleCreate = async (data: NoteCreate | NoteUpdate) => {
    setSaving(true);
    try { await notesApi.create(data as NoteCreate); fetchNotes(); setShowForm(false); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data: NoteCreate | NoteUpdate) => {
    if (!editTarget) return;
    setSaving(true);
    try { await notesApi.update(editTarget._id, data); fetchNotes(); setEditTarget(null); }
    catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try { await notesApi.delete(id); fetchNotes(); }
    catch (e: any) { setError(e.message); }
  };

  const q = search.toLowerCase();
  const visible = notes.filter(n =>
    n.title.toLowerCase().includes(q) ||
    n.content.toLowerCase().includes(q) ||
    n.tags.some(t => t.toLowerCase().includes(q))
  );

  const fmtDate = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="view notes-view">
      {/* Toolbar */}
      <div className="view-toolbar">
        <div className="search-wrap">
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search notes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
        <button id="create-note-btn" className="btn-primary" onClick={() => setShowForm(true)}>
          <span className="material-symbols-outlined">add</span> New Note
        </button>
      </div>

      {error && <div className="error-banner"><span>⚠</span> {error} <button onClick={() => setError('')}>✕</button></div>}

      {loading ? (
        <div className="spinner-wrap full"><div className="spinner" /></div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined empty-icon">description</span>
          <p>{search ? 'No notes match your search.' : 'No notes yet. Create your first one!'}</p>
          {!search && <button className="btn-primary" onClick={() => setShowForm(true)}>Create Note</button>}
        </div>
      ) : (
        <div className="notes-grid">
          {visible.map(note => (
            <div key={note._id} className="note-card">
              <div className="note-card-header">
                <h4 className="note-title">{note.title}</h4>
                <div className="note-actions">
                  <button className="btn-icon" title="Edit" onClick={() => setEditTarget(note)}>
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="btn-icon btn-icon-danger" title="Delete" onClick={() => handleDelete(note._id)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
              <p className="note-content">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map(t => <span key={t} className="tag">#{t}</span>)}
                </div>
              )}
              <span className="note-date">{fmtDate(note.updated_at)}</span>
            </div>
          ))}
        </div>
      )}

      {showForm && <NoteForm onSave={handleCreate} onClose={() => setShowForm(false)} loading={saving} />}
      {editTarget && <NoteForm initial={editTarget} onSave={handleUpdate} onClose={() => setEditTarget(null)} loading={saving} />}
    </div>
  );
}
