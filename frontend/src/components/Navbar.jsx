import React, { useState, useEffect } from 'react';
import { 
  Database
} from 'lucide-react';
import { getHealth } from '../services/api';

export default function Navbar({ activePage }) {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    getHealth()
      .then(data => setHealth(data))
      .catch(() => setHealth({ status: 'offline', database: 'Offline' }));
  }, []);

  const pageTitles = {
    dashboard: 'Road safety overview',
    predict: 'Scenario risk assessment',
    map: 'Incident map & risk zones',
    analytics: 'Historical data analysis',
    performance: 'Model evaluation',
    history: 'Prediction history',
    about: 'Methods & system reference',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 backdrop-blur-xl">
      {/* Left Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-base md:text-lg font-bold text-white font-['Outfit'] tracking-tight">
          {pageTitles[activePage] || 'Road Accident Risk Intelligence'}
        </h2>
      </div>

      {/* Backend status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs" title="Backend API and configured storage status">
          <span className="relative flex h-2 w-2">
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'
            }`} />
          </span>
          <span className="font-medium text-slate-300 hidden md:inline">Backend</span>
          <span className={health?.status === 'healthy' ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
            {!health ? 'Checking' : health.status === 'healthy' ? 'Online' : 'Offline'}
          </span>
          <span className="text-slate-600">|</span>
          <Database className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-400 hidden lg:inline">{health?.database || 'Storage checking'}</span>
        </div>
      </div>
    </header>
  );
}
