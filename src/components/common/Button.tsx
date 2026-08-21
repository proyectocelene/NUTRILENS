import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2.5 font-semibold"
  };

  const variantClasses = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 focus:ring-emerald-500",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 focus:ring-slate-400 font-semibold",
    outline: "border border-slate-300 hover:border-slate-400 text-slate-700 hover:bg-slate-50 focus:ring-slate-400 font-semibold",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400",
    danger: "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 focus:ring-rose-500 font-semibold"
  };

  return (
    <button
      className={twMerge(clsx(baseClasses, sizeClasses[size], variantClasses[variant], className))}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
