import React from 'react';
import { Calendar, BarChart2, BookOpen, Settings, Target, ShoppingCart, Database, LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

export type NavView = 'day' | 'analytics' | 'recipes' | 'recomposition' | 'groceries' | 'canonical' | 'settings';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
}

const DESKTOP_NAV_ITEMS: { id: NavView; label: string; icon: LucideIcon }[] = [
  { id: 'day', label: 'Diario de Hoy', icon: Calendar },
  { id: 'canonical', label: 'Banco Canónico & Etiquetas', icon: Database },
  { id: 'recomposition', label: 'Recomposición & Fases', icon: Target },
  { id: 'groceries', label: 'Supermercado & Plan Semanal', icon: ShoppingCart },
  { id: 'analytics', label: 'Estadísticas & Tendencias', icon: BarChart2 },
  { id: 'recipes', label: 'Banco de Recetas', icon: BookOpen },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

// 5 Pestañas principales en 1 sola fila ultra-compacta para móvil
const MOBILE_NAV_ITEMS: { id: NavView; label: string; icon: LucideIcon }[] = [
  { id: 'day', label: 'Diario', icon: Calendar },
  { id: 'recomposition', label: 'Fases', icon: Target },
  { id: 'groceries', label: 'Súper', icon: ShoppingCart },
  { id: 'analytics', label: 'Stats', icon: BarChart2 },
  { id: 'recipes', label: 'Recetas', icon: BookOpen },
];

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  return (
    <>
      {/* Desktop Navigation Tabs */}
      <nav className="hidden md:flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs mb-6">
        {DESKTOP_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200',
                isActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon size={16} className={isActive ? 'text-emerald-700' : 'text-slate-500'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile Bottom Sticky Navigation (1 Sola Fila Ultra Compacta) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-1 py-1 safe-area-bottom shadow-lg">
        <div className="grid grid-cols-5 gap-0.5">
          {MOBILE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={clsx(
                  'flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all',
                  isActive
                    ? 'text-emerald-800 font-bold'
                    : 'text-slate-400 hover:text-slate-700'
                )}
              >
                <div
                  className={clsx(
                    'p-1 rounded-lg transition-all',
                    isActive ? 'bg-emerald-100/70 text-emerald-800' : 'text-slate-500'
                  )}
                >
                  <Icon size={17} />
                </div>
                <span className="text-[9px] font-bold tracking-tight truncate max-w-full leading-tight mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
