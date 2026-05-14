import type { AppView } from '../pages/AppShell';
import { useAuth } from '../context/AuthContext';

const VIEW_TITLES: Record<AppView, string> = {
  dashboard: 'Dashboard',
  tasks: 'Tasks',
  notes: 'Notes',
};

interface Props {
  activeView: AppView;
  onToggleSidebar: () => void;
  onToggleChat: () => void;
  chatOpen: boolean;
}

export function AppHeader({ activeView, onToggleChat, chatOpen }: Props) {
  const { user } = useAuth();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="app-header">
      <div className="app-header-left">
        <h2 className="app-header-title">{VIEW_TITLES[activeView]}</h2>
        {activeView === 'dashboard' && (
          <p className="app-header-greeting">
            {greeting()}, <strong>{user?.name?.split(' ')[0] ?? 'there'}</strong>
          </p>
        )}
      </div>

      <div className="app-header-right">
        <button
          id="header-chat-btn"
          className={`app-header-btn ${chatOpen ? 'active' : ''}`}
          onClick={onToggleChat}
          title="Toggle AI Chat"
        >
          <span className="material-symbols-outlined">smart_toy</span>
        </button>
      </div>
    </header>
  );
}
