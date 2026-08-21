import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../common/Card';
import { getMacroCalorieDistribution } from '../../services/nutritionCalculator';

interface MacroDonutChartProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatGoal?: number;
  title?: string;
}

export const MacroDonutChart: React.FC<MacroDonutChartProps> = ({
  protein,
  carbs,
  fat,
  proteinGoal = 175,
  carbsGoal = 245,
  fatGoal = 58,
  title = "Distribución del Día"
}) => {
  const dist = getMacroCalorieDistribution(protein, carbs, fat);

  const data = [
    { 
      name: 'Proteínas', 
      value: protein * 4, 
      grams: protein, 
      pctCalories: dist.proteinPct, 
      color: '#059669', 
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-800',
      barColor: 'bg-emerald-600',
      goal: proteinGoal,
      kcal: Math.round(protein * 4)
    },
    { 
      name: 'Carbohidratos', 
      value: carbs * 4, 
      grams: carbs, 
      pctCalories: dist.carbsPct, 
      color: '#0284C7', 
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-800',
      barColor: 'bg-sky-600',
      goal: carbsGoal,
      kcal: Math.round(carbs * 4)
    },
    { 
      name: 'Grasas', 
      value: fat * 9, 
      grams: fat, 
      pctCalories: dist.fatPct, 
      color: '#D97706', 
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-800',
      barColor: 'bg-amber-600',
      goal: fatGoal,
      kcal: Math.round(fat * 9)
    }
  ];

  const hasData = protein > 0 || carbs > 0 || fat > 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-2.5 rounded-xl shadow-xl text-xs space-y-0.5">
          <p className="font-bold" style={{ color: d.color }}>{d.name}</p>
          <p className="text-slate-800 font-semibold">{d.grams}g consumidos</p>
          <p className="text-slate-500 text-[10px]">{d.kcal} kcal ({d.pctCalories}% de las calorías de hoy)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-500">Aporte calórico vs Meta diaria recomendada</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 font-mono">
          {dist.totalKcal} kcal consumidas
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center min-w-0">
        {/* Gráfico Donut de Proporción Calórica */}
        <div className="sm:col-span-5 h-44 relative flex items-center justify-center min-w-0 w-full overflow-hidden">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#FFFFFF"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 flex flex-col items-center">
              <span>Sin comidas registradas</span>
            </div>
          )}

          {/* Centro del Donut: Total de Calorías Reales del Día */}
          {hasData && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-black text-slate-900 font-mono leading-none">{dist.totalKcal}</span>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight mt-0.5">kcal hoy</span>
            </div>
          )}
        </div>

        {/* Desglose Explicativo de Cada Macro */}
        <div className="sm:col-span-7 flex flex-col gap-2">
          {data.map((macro) => {
            const goalPct = macro.goal && macro.goal > 0 ? Math.min(100, Math.round((macro.grams / macro.goal) * 100)) : 0;
            const remainingGrams = macro.goal ? Math.max(0, Math.round((macro.goal - macro.grams) * 10) / 10) : 0;

            return (
              <div key={macro.name} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                {/* Nombre y Gramos */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: macro.color }} />
                    <span className="text-slate-900">{macro.name}</span>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-black text-slate-900">{macro.grams}g</span>
                    <span className="text-slate-400 text-[11px] font-normal"> / {macro.goal}g</span>
                  </div>
                </div>

                {/* Barra de Progreso hacia la Meta Diaria */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className={`h-full ${macro.barColor} rounded-full transition-all duration-500`}
                    style={{ width: `${goalPct}%` }}
                  />
                </div>

                {/* Explicación de los 2 Porcentajes */}
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 pt-0.5">
                  <span className="text-slate-700">
                    <strong className={macro.textColor}>{goalPct}%</strong> de tu meta diaria {remainingGrams > 0 ? `(faltan ${remainingGrams}g)` : '✓'}
                  </span>
                  <span className="font-mono text-slate-600 bg-white px-1.5 py-0.2 rounded-md border border-slate-200">
                    {macro.pctCalories}% de tus kcal
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
