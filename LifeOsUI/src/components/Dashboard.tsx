import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function Dashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await api.tasks.getAll();
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return (
    <main className="flex-1 overflow-y-auto no-scrollbar bg-background p-5">
      <div className="max-w-[1200px] mx-auto space-y-10">
        <section className="flex flex-col md:flex-row justify-between items-end gap-6 pt-4">
          <div>
            <p className="font-label-sm text-[12px] font-bold text-primary mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}
            </p>
            <h1 className="font-h1 text-[32px] font-bold text-on-surface mt-1">Good Morning, Alex.</h1>
            <p className="font-body-md text-[16px] text-on-surface-variant mt-2">
              You have {tasks.filter(t => t.priority === 'high').length} high-priority tasks requiring your attention today.
            </p>
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

            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.length > 0 ? (
                  tasks.map((task) => (
                    <div key={task._id} className="group bg-surface-container border border-outline-variant p-6 rounded-xl hover:border-outline transition-all duration-200 cursor-pointer hover:scale-[1.01]">
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${
                          task.priority === 'high'
                            ? 'bg-error/10 text-error border-error/20'
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {task.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">more_vert</span>
                      </div>
                      <h4 className="font-body-lg text-[18px] font-bold text-on-surface mb-1">{task.title}</h4>
                      <p className="font-body-md text-on-surface-variant text-[14px] mb-6">{task.description}</p>
                      <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                        <div className="flex items-center gap-1 text-outline">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          <span className="font-label-sm text-[12px] font-bold">{task.due_date || 'No date'}</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">link</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-10 text-on-surface-variant italic">
                    No tasks found. Time to relax!
                  </div>
                )}
              </div>
            )}
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
