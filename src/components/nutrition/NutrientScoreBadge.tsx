import React from 'react';
import { Award, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';

interface NutrientScoreBadgeProps {
  score: number; // 0 - 100
}

export const NutrientScoreBadge: React.FC<NutrientScoreBadgeProps> = ({ score }) => {
  let statusText = "Excelente";
  let statusColor = "text-emerald-700";
  let bgGradient = "from-emerald-50 to-teal-50/40";
  let borderColor = "border-emerald-200";
  let badgeBg = "bg-emerald-100 text-emerald-800";
  let Icon = Sparkles;

  if (score < 45) {
    statusText = "Incompleto";
    statusColor = "text-rose-700";
    bgGradient = "from-rose-50 to-red-50/40";
    borderColor = "border-rose-200";
    badgeBg = "bg-rose-100 text-rose-800";
    Icon = AlertCircle;
  } else if (score < 70) {
    statusText = "Moderado";
    statusColor = "text-amber-800";
    bgGradient = "from-amber-50 to-yellow-50/40";
    borderColor = "border-amber-200";
    badgeBg = "bg-amber-100 text-amber-900";
    Icon = ShieldCheck;
  } else if (score < 85) {
    statusText = "Bueno";
    statusColor = "text-sky-700";
    bgGradient = "from-sky-50 to-blue-50/40";
    borderColor = "border-sky-200";
    badgeBg = "bg-sky-100 text-sky-800";
    Icon = Award;
  }

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${bgGradient} ${borderColor} border shadow-xs`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className={`p-2 sm:p-2.5 rounded-2xl bg-white border ${borderColor} ${statusColor} shadow-xs shrink-0`}>
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider">Índice Nutricional</span>
              <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md ${badgeBg}`}>
                {statusText}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5 truncate">
              Densidad proteica, fibra y micronutrientes
            </p>
          </div>
        </div>

        <div className="flex items-baseline gap-0.5 sm:gap-1 shrink-0 pl-1">
          <span className={`text-2xl sm:text-3xl font-black ${statusColor} tracking-tight font-mono`}>{score}</span>
          <span className="text-[10px] sm:text-xs text-slate-500 font-medium">/100</span>
        </div>
      </div>
    </Card>
  );
};
