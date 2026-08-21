import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { DayTrendPoint } from '../../services/statsEngine';
import { Card } from '../common/Card';

interface MacroTrendsChartProps {
  trends: DayTrendPoint[];
}

export const MacroTrendsChart: React.FC<MacroTrendsChartProps> = ({ trends }) => {
  const [metricMode, setMetricMode] = useState<'calories' | 'macros'>('macros');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[140px]">
          <p className="font-bold text-slate-900 border-b border-slate-100 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex justify-between items-center gap-3">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-bold text-slate-900 font-mono">
                {entry.value} {metricMode === 'calories' ? 'kcal' : 'g'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tendencias de Ingesta Diaria</h3>
          <p className="text-xs text-slate-500">Evolución de macronutrientes y calorías a lo largo del tiempo</p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-auto">
          <button
            onClick={() => setMetricMode('macros')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              metricMode === 'macros'
                ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Macronutrientes (g)
          </button>
          <button
            onClick={() => setMetricMode('calories')}
            className={`px-3 py-1 rounded-lg font-medium transition-all ${
              metricMode === 'calories'
                ? 'bg-white text-amber-800 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Calorías (kcal)
          </button>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          {metricMode === 'macros' ? (
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
              />
              <Bar dataKey="protein" name="Proteína" fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carbs" name="Carbohidratos" fill="#0284C7" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fat" name="Grasas" fill="#D97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="calGradientLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="displayDate" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="calories"
                name="Calorías Consumidas"
                stroke="#D97706"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#calGradientLight)"
              />
              <Area
                type="monotone"
                dataKey="targetCalories"
                name="Meta Calórica"
                stroke="#94A3B8"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
