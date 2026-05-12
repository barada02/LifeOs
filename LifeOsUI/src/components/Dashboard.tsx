import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await api.tasks.getAll();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoadingTasks(false);
      }
    }
    fetchTasks();
  }, []);

  useEffect(() => {
    async function fetchNotes() {
      try {
        const data = await api.notes.getAll();
        setNotes(data);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    }
    fetchNotes();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar bg-background p-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold text-[11px] uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="font-h1 text-[42px] font-extrabold text-on-surface tracking-tight">
              Good Morning, <span className="text-primary">Alex.</span>
            </h1>
            <p className="font-body-md text-[18px] text-on-surface-variant max-w-2xl leading-relaxed">
              You have <span className="text-on-surface font-semibold">{tasks.filter(t => t.priority === 'high').length}</span> high-priority tasks requiring your attention today.
            </p>
          </div>

          <div className="flex items-center gap-6 p-3 px-5 bg-surface-container rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-bold text-outline uppercase tracking-tighter mb-1">Current Status</span>
              <span className="font-body-md font-bold text-secondary flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                Deep Work Mode
              </span>
            </div>
            <div className="h-8 w-[1px] bg-outline-variant"></div>
            <div className="flex flex-col">
              <span className="font-label-sm text-[10px] font-bold text-outline uppercase tracking-tighter mb-1">Focus Time</span>
              <span className="font-body-md font-bold text-on-surface tabular-nums">45:00</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-h2 text-[24px] font-bold text-on-surface tracking-tight">Critical Priorities</h3>
                <p className="text-outline text-xs">Focus on these to make a real impact today.</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-surface-container border border-outline-variant text-primary font-bold text-[12px] hover:bg-primary hover:text-white transition-all duration-200 shadow-sm">
                View All Tasks
              </button>
            </div>

            {isLoadingTasks ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary"></div>
                <p className="text-outline text-sm animate-pulse">Synchronizing your priorities...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task._id} className="group bg-surface-container border border-outline-variant p-6 rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          task.priority === 'high'
                            ? 'bg-error/10 text-error border-error/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {task.priority || 'Normal'}
                        </span>
                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</span>
                      </div>
                      <h4 className="font-body-lg text-[18px] font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{task.title}</h4>
                      <p className="font-body-md text-on-surface-variant text-[14px] mb-6 leading-relaxed line-clamp-2">{task.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-outline-variant/50">
                        <div className="flex items-center gap-2 text-outline">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          <span className="font-label-sm text-[12px] font-medium">{task.due_date || 'No date'}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px] group-hover:text-primary transition-colors">link</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-16 bg-surface-container rounded-2xl border border-dashed border-outline-variant">
                    <span className="material-symbols-outlined text-outline text-4xl mb-3">checklist</span>
                    <p className="text-on-surface-variant italic">No critical tasks found. Enjoy your day!</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-surface-container border border-outline-variant p-6 rounded-2xl space-y-6 h-full shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-body-lg text-[18px] font-bold text-on-surface tracking-tight">Recent Notes</h3>
                <button className="p-1 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
              </div>

              {isLoadingNotes ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.length > 0 ? (
                    notes.map((note) => (
                      <div key={note._id} className="p-4 rounded-xl transition-all duration-200 cursor-pointer group border border-transparent hover:border-primary/30 hover:bg-surface-container-highest hover:shadow-sm">
                        <p className="font-body-md text-on-surface font-semibold mb-2 group-hover:text-primary transition-colors">{note.title}</p>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-surface-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">
                            #{note.category || 'General'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-on-surface-variant italic text-sm opacity-60">
                      Your knowledge base is empty.
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>

        <section className="bg-surface-container border border-outline-variant p-8 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <h3 className="font-body-lg text-[20px] font-bold text-on-surface tracking-tight">Weekly Progress</h3>
              <p className="text-outline text-xs">Consistency is the key to mastery.</p>
            </div>
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-surface-variant border border-outline-variant">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">Work Hours</span>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-4 h-32 items-end">
            {[60, 85, 70, 95, 40, 20, 10].map((h, i) => (
              <div key={i} className="group relative h-full w-full flex items-end">
                <div
                  style={{ height: `${h}%` }}
                  className={`rounded-t-lg w-full transition-all duration-500 group-hover:brightness-110 ${
                    i === 3 ? 'bg-secondary/60' : 'bg-primary/40'
                  }`}
                ></div>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-on-surface text-background text-[10px] px-2 py-1 rounded font-bold">
                  {h}%
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4 mt-4 text-center">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <span key={i} className="font-label-sm text-[11px] font-bold text-outline uppercase tracking-widest">{day}</span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
