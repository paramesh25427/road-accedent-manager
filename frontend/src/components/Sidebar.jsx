import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Map, 
  BarChart3, 
  Cpu, 
  History, 
  FileText,
  AlertOctagon,
  Layers
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const navGroups = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'predict', label: 'Scenario prediction', icon: Target },
      ],
    },
    {
      label: 'Explore data',
      items: [
        { id: 'map', label: 'Incident map', icon: Map },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      label: 'Models & records',
      items: [
        { id: 'performance', label: 'Model evaluation', icon: Cpu },
        { id: 'history', label: 'Prediction history', icon: History },
      ],
    },
    {
      label: 'Reference',
      items: [{ id: 'about', label: 'Methods & API', icon: FileText }],
    },
  ];

  return (
    <aside className="flex flex-col w-64 border-r border-white/10 bg-slate-950/95 backdrop-blur-2xl h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-white/10 bg-gradient-to-r from-indigo-950/40 to-transparent">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]">
          <AlertOctagon className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-extrabold tracking-tight text-white font-['Outfit']">
            RISK SENTINEL
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
            AI Accident Risk System
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 m-3 rounded-2xl bg-slate-900/50 border border-white/5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-amber-300" />
          <span className="text-xs font-semibold text-slate-200">Analyst workspace</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Historical sample analysis and scenario-based risk estimates.
        </p>
      </div>
    </aside>
  );
}
