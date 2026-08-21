import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'blue' | 'purple' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  icon,
  className
}) => {
  const baseClasses = "inline-flex items-center font-semibold rounded-full shrink-0";

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5"
  };

  const variantClasses: Record<BadgeVariant, string> = {
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
    blue: "bg-sky-50 text-sky-700 border border-sky-200",
    purple: "bg-purple-50 text-purple-700 border border-purple-200",
    slate: "bg-slate-100 text-slate-700 border border-slate-200"
  };

  return (
    <span className={twMerge(clsx(baseClasses, sizeClasses[size], variantClasses[variant], className))}>
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
