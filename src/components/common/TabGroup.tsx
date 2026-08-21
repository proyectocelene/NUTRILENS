import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabGroupProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  className?: string;
}

export const TabGroup: React.FC<TabGroupProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className
}) => {
  if (variant === 'segmented') {
    return (
      <div className={twMerge('flex p-1 bg-slate-100 border border-slate-200 rounded-2xl gap-1', className)}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={clsx(
                    'px-1.5 py-0.2 text-[10px] rounded-full font-bold',
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant
  return (
    <div className={twMerge('flex border-b border-slate-200 gap-4 sm:gap-6 overflow-x-auto no-scrollbar', className)}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-all shrink-0 whitespace-nowrap',
              isActive
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="px-1.5 py-0.5 text-[11px] rounded-full bg-slate-100 text-slate-600 font-normal">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
