// ============================================
// AppShell — Protected layout with sidebar, header, and panels
// ============================================
import { useState } from 'react';
import { AppSidebar }  from '../components/AppSidebar';
import { AppHeader }   from '../components/AppHeader';
import { DashboardView } from '../components/views/DashboardView';
import { TasksView }   from '../components/views/TasksView';
import { NotesView }   from '../components/views/NotesView';
import { ChatPanel }   from '../components/ChatPanel';

export type AppView = 'dashboard' | 'tasks' | 'notes';

export function AppShell() {
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen]       = useState(true);

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-expanded' : 'sidebar-collapsed'} ${chatOpen ? 'chat-expanded' : 'chat-collapsed'}`}>
      <AppSidebar
        active={activeView}
        onNavigate={setActiveView}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
      />

      <div className="app-main">
        <AppHeader
          activeView={activeView}
          onToggleSidebar={() => setSidebarOpen(p => !p)}
          onToggleChat={() => setChatOpen(p => !p)}
          chatOpen={chatOpen}
        />

        <div className="app-content">
          {activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}
          {activeView === 'tasks'     && <TasksView />}
          {activeView === 'notes'     && <NotesView />}
        </div>
      </div>

      <ChatPanel open={chatOpen} onToggle={() => setChatOpen(p => !p)} />
    </div>
  );
}
