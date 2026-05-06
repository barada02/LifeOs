import os

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# LeftSidebar.tsx
left_sidebar_tsx = """export function LeftSidebar({ 
  width, 
  onToggle 
}: { 
  width: 'w-20' | 'w-64', 
  onToggle: () => void 
}) {
  return (
    <aside className={`sidebar-transition flex-shrink-0 ${width} bg-surface-container border-r border-outline-variant flex flex-col h-full py-lg px-2 z-50 relative group`}>
      <div className="mb-xl flex flex-col items-center">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center mb-1">
          <span className="material-symbols-outlined text-on-primary-container">adjust</span>
        </div>
        <p className="font-label-sm text-[8px] text-primary opacity-80 uppercase tracking-tighter">Life OS</p>
      </div>
      <nav className="flex-1 space-y-md flex flex-col items-center">
        <a className="p-3 rounded-xl text-primary bg-primary/10 border border-primary/20 hover:bg-surface-container-highest transition-all duration-200" href="#" title="Dashboard">
          <span className="material-symbols-outlined">dashboard</span>
        </a>
        <a className="p-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200" href="#" title="Tasks">
          <span className="material-symbols-outlined">checklist</span>
        </a>
        <a className="p-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200" href="#" title="Notes">
          <span className="material-symbols-outlined">description</span>
        </a>
        <a className="p-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200" href="#" title="AI Assistant">
          <span className="material-symbols-outlined">smart_toy</span>
        </a>
      </nav>
      <div className="mt-auto pt-lg border-t border-outline-variant space-y-md flex flex-col items-center">
        <a className="p-3 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all duration-200" href="#" title="Settings">
          <span className="material-symbols-outlined">settings</span>
        </a>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant">
          <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuClnqsVecd2AuKvCPAkU-twdMpnyTqbOj3TwL6otnrP0rgGSARToTTeiXzsigCr2c1WB_98vzahQKMwZfKj_49LQkvsra_-IK_MBb97m3jLk50OExEP0ISmVOF7J_tm5yZZHnRP0kslurC4p5TBieNYnaIt4pOztQwunDxosAq9hsJpRpxiqbVDTO2VKBgXAT3huhtELj2dAr8eqCKHN-58BMmMGo2HPxdUGy74mUFPsfJo7qsb82C78EjN0Jf51hEPy0Is4jyj_q2a" />
        </div>
      </div>
      <button 
        className="absolute -right-3 top-20 w-6 h-6 bg-surface-container border border-outline-variant rounded-full flex items-center justify-center text-outline hover:text-primary z-50" 
        onClick={onToggle}
      >
        <span className="material-symbols-outlined text-[16px]">{width === 'w-20' ? 'chevron_right' : 'chevron_left'}</span>
      </button>
    </aside>
  );
}
"""

# Header.tsx
header_tsx = """export function Header() {
  return (
    <header className="bg-surface border-b border-outline-variant flex justify-between items-center h-16 px-layer flex-shrink-0" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 text-on-surface font-body-md text-[14px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" placeholder="Search Workspace (⌘K)" type="text" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:text-primary transition-all active:scale-95 duration-150">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="h-8 w-[1px] bg-outline-variant mx-1"></div>
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-[12px] font-bold text-on-surface-variant hidden sm:inline">Session: 02h 15m</span>
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></div>
        </div>
      </div>
    </header>
  );
}
"""

# Dashboard.tsx
dashboard_tsx = """export function Dashboard() {
  return (
    <main className="flex-1 overflow-y-auto no-scrollbar bg-background p-5">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <section className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
          <div>
            <p className="font-label-sm text-[12px] font-bold text-primary mb-1">MONDAY, OCTOBER 24</p>
            <h1 className="font-h1 text-[32px] font-bold text-on-surface mt-1">Good Morning, Alex.</h1>
            <p className="font-body-md text-[16px] text-on-surface-variant mt-2">You have 4 high-priority tasks requiring your attention today.</p>
          </div>
          <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl border border-outline-variant">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-bold text-outline mb-1">CURRENT STATUS</span>
              <span className="font-body-md font-bold text-secondary flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Deep Work Mode
              </span>
            </div>
            <div className="h-10 w-[1px] bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-bold text-outline mb-1">FOCUS TIME</span>
              <span className="font-body-md font-bold text-on-surface">45:00</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-h2 text-[24px] font-semibold text-on-surface">Critical Priorities</h3>
              <button className="text-primary font-label-sm text-[12px] font-bold hover:underline">View All Tasks</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group bg-surface-container border border-outline-variant p-6 rounded-xl hover:border-outline transition-all duration-200 cursor-pointer hover:scale-[1.01]">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 rounded-full bg-error/10 text-error text-[10px] font-bold border border-error/20">HIGH PRIORITY</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</span>
                </div>
                <h4 className="font-body-lg text-[18px] font-bold text-on-surface mb-1">System Architecture Review</h4>
                <p className="font-body-md text-on-surface-variant text-[14px] mb-6">Finalize core database schema for project Atlas.</p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1 text-outline">
                    <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    <span className="font-label-sm text-[12px] font-bold">Today, 2:00 PM</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">link</span>
                </div>
              </div>

              <div className="group bg-surface-container border border-outline-variant p-6 rounded-xl hover:border-outline transition-all duration-200 cursor-pointer hover:scale-[1.01]">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">URGENT</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</span>
                </div>
                <h4 className="font-body-lg text-[18px] font-bold text-on-surface mb-1">Investor Deck v2.4</h4>
                <p className="font-body-md text-on-surface-variant text-[14px] mb-6">Refine projections for the Q4 board meeting.</p>
                <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                  <div className="flex items-center gap-1 text-error font-bold">
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span className="font-label-sm text-[12px]">Overdue</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[18px]">person</span>
                </div>
              </div>
            </div>
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-surface-container border border-outline-variant p-6 rounded-xl space-y-4 h-full">
              <div className="flex items-center justify-between">
                <h3 className="font-body-lg text-[18px] font-bold text-on-surface">Recent Notes</h3>
                <span className="material-symbols-outlined text-outline cursor-pointer hover:text-on-surface">add</span>
              </div>
              <div className="space-y-2">
                <div className="p-4 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-outline-variant">
                  <p className="font-body-md text-on-surface font-bold mb-1 group-hover:text-primary">2024 Product Vision</p>
                  <div className="flex gap-1">
                    <span className="px-1 py-0.5 rounded bg-surface-variant text-on-surface-variant text-[10px]">#STRATEGY</span>
                  </div>
                </div>
                <div className="p-4 hover:bg-surface-container-highest rounded-lg transition-colors cursor-pointer group border border-transparent hover:border-outline-variant">
                  <p className="font-body-md text-on-surface font-bold mb-1 group-hover:text-primary">Tech Stack Refactoring</p>
                  <div className="flex gap-1">
                    <span className="px-1 py-0.5 rounded bg-surface-variant text-on-surface-variant text-[10px]">#DEBT</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="bg-surface-container border border-outline-variant p-6 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-body-lg text-[18px] font-bold text-on-surface">Weekly Progress</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span className="font-label-sm text-[12px] font-bold text-outline">Work</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 h-24 items-end">
            <div className="bg-primary/20 rounded-t-lg w-full h-[60%]"></div>
            <div className="bg-primary/20 rounded-t-lg w-full h-[85%]"></div>
            <div className="bg-primary/20 rounded-t-lg w-full h-[70%]"></div>
            <div className="bg-secondary/40 rounded-t-lg w-full h-[95%]"></div>
            <div className="bg-primary/20 rounded-t-lg w-full h-[40%]"></div>
            <div className="bg-surface-variant rounded-t-lg w-full h-[20%]"></div>
            <div className="bg-surface-variant rounded-t-lg w-full h-[10%]"></div>
          </div>
          <div className="grid grid-cols-7 gap-4 mt-2 text-center">
            <span className="font-label-sm text-[10px] text-outline">M</span>
            <span className="font-label-sm text-[10px] text-outline">T</span>
            <span className="font-label-sm text-[10px] text-outline">W</span>
            <span className="font-label-sm text-[10px] text-outline">T</span>
            <span className="font-label-sm text-[10px] text-outline">F</span>
            <span className="font-label-sm text-[10px] text-outline">S</span>
            <span className="font-label-sm text-[10px] text-outline">S</span>
          </div>
        </section>
      </div>
    </main>
  );
}
"""

# RightSidebar.tsx
right_sidebar_tsx = """export function RightSidebar({ 
  width, 
  onToggle 
}: { 
  width: 'w-12' | 'w-80', 
  onToggle: () => void 
}) {
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
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-primary-container">smart_toy</span>
                </div>
                <span className="font-label-sm text-[12px] text-outline">AI Assistant • Now</span>
              </div>
              <div className="bg-surface-container-highest p-4 rounded-xl rounded-tl-none border border-outline-variant/30">
                <p className="font-body-md text-[14px] leading-relaxed">Good morning Alex. I noticed you have a gap in your schedule at 3 PM. Would you like me to block that for deep work on the Security Audit?</p>
              </div>
            </div>
            <div className="space-y-2 flex flex-col items-end">
              <div className="flex items-center gap-2 flex-row-reverse">
                <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-on-secondary-container">person</span>
                </div>
                <span className="font-label-sm text-[12px] text-outline">You • 2m ago</span>
              </div>
              <div className="bg-primary/10 p-4 rounded-xl rounded-tr-none border border-primary/20 max-w-[90%]">
                <p className="font-body-md text-[14px] leading-relaxed">Yes, please. And set a reminder 15 minutes before.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
              <span className="text-[10px] font-bold uppercase">Processing request...</span>
            </div>
          </div>
          <div className="p-6 border-t border-outline-variant bg-surface-container-low">
            <div className="relative">
              <textarea className="w-full bg-surface border border-outline-variant rounded-xl py-3 px-4 pr-12 text-on-surface font-body-md text-[14px] focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all resize-none no-scrollbar" placeholder="Ask AI... (⌘ + Enter)" rows={2} />
              <button className="absolute right-3 bottom-3 p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
              <button className="flex-shrink-0 px-3 py-1 rounded-full bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant hover:border-primary transition-colors">Draft Email</button>
              <button className="flex-shrink-0 px-3 py-1 rounded-full bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant hover:border-primary transition-colors">Summarize Notes</button>
              <button className="flex-shrink-0 px-3 py-1 rounded-full bg-surface-variant text-[10px] text-on-surface-variant border border-outline-variant hover:border-primary transition-colors">Manage Calendar</button>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
"""

# new App.tsx
app_tsx = """import { useState } from 'react';
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
"""

base_dir = r"c:\Users\barad\Desktop\projects\LifeOs\LifeOsUI\src"

write_file(os.path.join(base_dir, 'components', 'LeftSidebar.tsx'), left_sidebar_tsx)
write_file(os.path.join(base_dir, 'components', 'Header.tsx'), header_tsx)
write_file(os.path.join(base_dir, 'components', 'Dashboard.tsx'), dashboard_tsx)
write_file(os.path.join(base_dir, 'components', 'RightSidebar.tsx'), right_sidebar_tsx)
write_file(os.path.join(base_dir, 'App.tsx'), app_tsx)

print("Componentization complete!")
