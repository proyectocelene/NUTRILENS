import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const baseClasses = "rounded-2xl transition-all duration-200 border max-w-full overflow-hidden";

  const paddingClasses = {
    none: "",
    sm: "p-2.5 sm:p-4",
    md: "p-3.5 sm:p-5",
    lg: "p-5 sm:p-7"
  };

  const variantClasses = {
    default: "bg-white border-slate-200/90 shadow-sm hover:shadow-md text-slate-900",
    elevated: "bg-white border-slate-200 shadow-md text-slate-900",
    glass: "bg-white/90 backdrop-blur-xl border-slate-200/80 shadow-sm text-slate-900",
    interactive: "bg-white hover:bg-slate-50 border-slate-200 hover:border-emerald-300 cursor-pointer shadow-sm hover:shadow-md text-slate-900"
  };

  return (
    <div className={twMerge(clsx(baseClasses, paddingClasses[padding], variantClasses[variant], className))} {...props}>
      {children}
    </div>
  );
};
