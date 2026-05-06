export function Header() {
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
