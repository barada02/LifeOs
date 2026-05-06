export function LeftSidebar({ 
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
