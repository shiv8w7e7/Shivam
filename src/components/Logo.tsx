import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision 3D Faceted Monogram Emblem */}
      <div
        className={`${iconSizes[size]} rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 dark:from-slate-800 dark:to-slate-950 flex items-center justify-center font-bold tracking-tight text-white shadow-[0_4px_12px_rgba(0,0,0,0.15)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.5)] border border-slate-700/70 relative overflow-hidden shrink-0 group`}
      >
        {/* Warm Orange Bevel Accent */}
        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-gradient-to-bl from-orange-400 to-amber-600 rounded-bl-lg shadow-xs" />
        
        {/* Subtle Specular Top Highlight */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        <span className="font-mono font-black tracking-tighter text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] relative z-10">
          ST
        </span>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            Shi<span className="text-orange-500">Test</span>
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 font-semibold uppercase">
            UPMSP
          </span>
        </div>
        {showTagline && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-tight">
            Practice Like Board. Perform Like Topper.
          </span>
        )}
      </div>
    </div>
  );
};

