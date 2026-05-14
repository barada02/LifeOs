import type { AppView } from '../pages/AppShell';
import { useAuth } from '../context/AuthContext';

interface Props {
  active: AppView;
  onNavigate: (v: AppView) => void;
  open: boolean;
  onToggle: () => void;
}

const NAV_ITEMS: { id: AppView; icon: string; label: string }[] = [
  { id: 'dashboard', icon: 'dashboard',  label: 'Dashboard' },
  { id: 'tasks',     icon: 'checklist',  label: 'Tasks' },
  { id: 'notes',     icon: 'description', label: 'Notes' },
];

export function AppSidebar({ active, onNavigate, open, onToggle }: Props) {
  const { user, logout } = useAuth();

  return (
    <aside className={`app-sidebar ${open ? '' : 'collapsed'}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⬡</div>
        {open && <span className="sidebar-brand-name">Life OS</span>}
        <button className="sidebar-collapse-btn" onClick={onToggle} title="Toggle sidebar">
          <span className="material-symbols-outlined">
            {open ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.label}
          >
            <span className="material-symbols-outlined sidebar-nav-icon">{item.icon}</span>
            {open && <span className="sidebar-nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {open && user && (
          <div className="sidebar-user-info">
            <div className="sidebar-avatar">{user.name?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="sidebar-user-text">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
          </div>
        )}
        <button
          id="logout-btn"
          className="sidebar-logout-btn"
          onClick={logout}
          title="Sign out"
        >
          <span className="material-symbols-outlined">logout</span>
          {open && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
