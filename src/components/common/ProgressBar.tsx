import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ProgressBarProps {
  value: number; // 0 a 100+
  max?: number;
  color?: 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'auto';
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = 'auto',
  height = 'md',
  showLabel = false,
  label,
  className
}) => {
  const percentage = Math.max(0, Math.min(100, (value / max) * 100));

  let activeColor = color;
  if (color === 'auto') {
    if (percentage < 40) activeColor = 'rose';
    else if (percentage < 75) activeColor = 'amber';
    else activeColor = 'emerald';
  }

  const colorStyles: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
    purple: 'bg-purple-500'
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  return (
    <div className={twMerge('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 font-medium text-slate-700">
          <span>{label}</span>
          <span className="text-slate-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={twMerge('w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200', heightStyles[height])}>
        <div
          className={twMerge('h-full rounded-full transition-all duration-500 ease-out shadow-xs', colorStyles[activeColor])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
