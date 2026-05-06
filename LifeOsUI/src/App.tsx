import { useState } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RightSidebar } from './components/RightSidebar';

function App() {
  const [sidebarWidth, setSidebarWidth] = useState<'w-20' | 'w-64'>('w-20');
  const [rightSidebarWidth, setRightSidebarWidth] = useState<'w-12' | 'w-80'>('w-80');

  const toggleLeftSidebar = () => {
    setSidebarWidth(prev => prev === 'w-20' ? 'w-64' : 'w-20');
  };

  const toggleRightSidebar = () => {
    setRightSidebarWidth(prev => prev === 'w-12' ? 'w-80' : 'w-12');
  };

  return (
    <div className="flex w-full h-full flex-row text-on-surface bg-background font-['Inter']">
      <LeftSidebar width={sidebarWidth} onToggle={toggleLeftSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          <Dashboard />
          <RightSidebar width={rightSidebarWidth} onToggle={toggleRightSidebar} />
        </div>
      </div>
      
      <button className="fixed bottom-4 right-4 lg:hidden w-14 h-14 bg-primary text-on-primary rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[60]">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
      </button>
    </div>
  )
}

export default App;
