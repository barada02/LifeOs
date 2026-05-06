export function RightSidebar({ 
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
