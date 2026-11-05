import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend }) {
  const colorMap = {
    indigo: {
      bg: 'from-indigo-500/10 to-indigo-500/5 border-indigo-500/20 text-indigo-400',
      iconBg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    },
    rose: {
      bg: 'from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-400',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    },
    amber: {
      bg: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    },
    cyan: {
      bg: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-400',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    },
    purple: {
      bg: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
      iconBg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    },
  };

  const selected = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-xl transition-all duration-300 hover:border-opacity-50 hover:shadow-lg ${selected.bg}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white font-['Outfit']">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`rounded-xl border p-3 ${selected.iconBg}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend.positive ? 'text-emerald-400' : 'text-rose-400'}>
            {trend.positive ? '↑' : '↓'} {trend.text}
          </span>
        </div>
      )}
    </div>
  );
}
