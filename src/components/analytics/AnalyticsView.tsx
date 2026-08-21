import React, { useState } from 'react';
import { BarChart3, Award, Flame, Zap, ShieldCheck } from 'lucide-react';
import { Meal, NutritionGoals } from '../../types/nutrition.types';
import { useTrendStats } from '../../hooks/useDailyStats';
import { Card } from '../common/Card';
import { MacroTrendsChart } from './MacroTrendsChart';
import { DeficiencyHeatmap } from './DeficiencyHeatmap';
import { SmartInsights } from './SmartInsights';

interface AnalyticsViewProps {
  allMeals: Meal[];
  goals: NutritionGoals;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ allMeals, goals }) => {
  const [daysRange, setDaysRange] = useState<7 | 14 | 30>(7);
  const stats = useTrendStats(allMeals, goals, daysRange);

  return (
    <div className="space-y-6">
      {/* Encabezado y Selector de Rango */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 size={20} className="text-emerald-700" />
            <span>Análisis Estadístico Inteligente</span>
          </h2>
          <p className="text-xs text-slate-500">
            Resumen consolidado y tendencias de los últimos {daysRange} días
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 self-start sm:self-auto text-xs shadow-xs">
          {([7, 14, 30] as const).map((r) => (
            <button
              key={r}
              onClick={() => setDaysRange(r)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                daysRange === r
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r} Días
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
            <Flame size={14} className="text-amber-600" />
            <span>Promedio Calórico</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {stats.avgCalories} <span className="text-xs font-normal text-slate-500">kcal/día</span>
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Meta: {goals.calories} kcal
          </span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
            <Zap size={14} className="text-emerald-600" />
            <span>Proteína Media</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {stats.avgProtein} <span className="text-xs font-normal text-slate-500">g/día</span>
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Meta: {goals.protein}g ({stats.proteinGoalMetRate}% éxito)
          </span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
            <Award size={14} className="text-sky-600" />
            <span>Calidad Nutricional</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-sky-700 font-mono">
            {stats.avgHealthScore} <span className="text-xs font-normal text-slate-500">/100</span>
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            Índice de balance y micros
          </span>
        </Card>

        <Card className="p-4 border-slate-200 bg-white">
          <div className="flex items-center gap-2 text-slate-600 text-xs font-bold mb-1">
            <ShieldCheck size={14} className="text-purple-600" />
            <span>Días con Registro</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-purple-800 font-mono">
            {stats.activeDaysCount} <span className="text-xs font-normal text-slate-500">/ {daysRange}</span>
          </p>
          <span className="text-[11px] text-slate-500 block mt-1">
            {Math.round((stats.activeDaysCount / daysRange) * 100)}% consistencia
          </span>
        </Card>
      </div>

      {/* Gráfico de Tendencias */}
      <MacroTrendsChart trends={stats.trends} />

      {/* Sugerencias Inteligentes */}
      <SmartInsights insights={stats.smartInsights} />

      {/* Mapa de Carencias */}
      <DeficiencyHeatmap
        deficiencies={stats.recurringDeficiencies}
        activeDays={stats.activeDaysCount}
      />
    </div>
  );
};
