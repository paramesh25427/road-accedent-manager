import React from 'react';

export default function RiskBadge({ level, size = 'md', showDot = true }) {
  const normalizedLevel = (level || 'Low').toUpperCase();

  const configs = {
    LOW: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      dot: 'bg-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      dot: 'bg-amber-400',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      label: 'Medium Risk',
    },
    HIGH: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
      dot: 'bg-rose-400',
      glow: 'shadow-[0_0_12px_rgba(244,63,94,0.35)]',
      label: 'High Risk',
    },
  };

  const config = configs[normalizedLevel] || configs.LOW;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold',
    xl: 'px-6 py-2 text-base font-extrabold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 ${config.bg} ${config.glow} ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
        </span>
      )}
      {config.label}
    </span>
  );
}
