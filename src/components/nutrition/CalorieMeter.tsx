import React from 'react';
import { Flame, Target, Zap } from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';

interface CalorieMeterProps {
  current: number;
  target: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export const CalorieMeter: React.FC<CalorieMeterProps> = ({
  current,
  target,
  proteinG,
  carbsG,
  fatG
}) => {
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;
  const remaining = target - current;
  const isOver = remaining < 0;

  return (
    <Card className="relative overflow-hidden border-slate-200 bg-white">
      {/* Background glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-100 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Flame size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Balance Calórico Diario</h3>
            <p className="text-xs text-slate-500">Meta de recomposición (2,200 kcal)</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-slate-900 tracking-tight">{current.toLocaleString()}</span>
          <span className="text-xs text-slate-500 block">/ {target.toLocaleString()} kcal</span>
        </div>
      </div>

      {/* Barra de progreso */}
      <ProgressBar
        value={current}
        max={target}
        height="md"
        color={percent > 115 ? 'rose' : percent >= 85 ? 'emerald' : 'amber'}
        className="mb-4"
      />

      {/* Subtotales y estado */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-3 border-t border-slate-100 text-center">
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1">
            <Target size={11} />
            <span className="truncate">{isOver ? 'Exceso' : 'Restante'}</span>
          </div>
          <p className={`text-xs sm:text-sm font-bold mt-0.5 truncate ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
            {Math.abs(remaining).toLocaleString()} <span className="text-[9px] sm:text-[10px] font-normal text-slate-500">kcal</span>
          </p>
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 flex items-center justify-center gap-1">
            <Zap size={11} />
            <span className="truncate">Cumplimiento</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
            {percent}%
          </p>
        </div>

        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-100 min-w-0">
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate">
            Macros Totales
          </div>
          <p className="text-[10px] sm:text-[11px] font-semibold text-slate-800 mt-0.5 truncate">
            <span className="text-emerald-700 font-bold">{Math.round(proteinG)}P</span>{' '}
            <span className="text-sky-700 font-bold">{Math.round(carbsG)}C</span>{' '}
            <span className="text-amber-700 font-bold">{Math.round(fatG)}G</span>
          </p>
        </div>
      </div>
    </Card>
  );
};
