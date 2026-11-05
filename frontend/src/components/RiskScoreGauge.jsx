import React from 'react';

export default function RiskScoreGauge({ score, level, size = 180 }) {
  const clampedScore = Math.max(0, Math.min(100, Number(score) || 0));
  
  // Radius and circumference
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 240 degree arc (leaving bottom 120 open)
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;

  let colorClass = '#64748B';
  let glowClass = '';
  let levelText = String(level || 'Unknown').toUpperCase();
  
  if (level === 'High') {
    colorClass = '#F43F5E'; // rose/red
    glowClass = 'drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]';
  } else if (level === 'Medium') {
    colorClass = '#F59E0B'; // amber
    glowClass = 'drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]';
  } else if (level === 'Low') {
    colorClass = '#10B981'; // green
    glowClass = 'drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]';
  }

  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-[135deg]"
      >
        {/* Background Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          fill="transparent"
        />
        {/* Active Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClass}
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className={`transition-all duration-1000 ease-out ${glowClass}`}
        />
      </svg>
      
      {/* Center Score readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-black tracking-tight text-white font-['Outfit']">
          {clampedScore.toFixed(0)}
          <span className="text-xs font-semibold text-slate-400">/100</span>
        </span>
        <span
          className="text-xs font-bold tracking-wider uppercase mt-0.5"
          style={{ color: colorClass }}
        >
          {levelText} RISK
        </span>
      </div>
    </div>
  );
}
