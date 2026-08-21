import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { NutrientDeficiency } from '../../types/nutrition.types';

interface NutrientGapAlertProps {
  gaps: NutrientDeficiency[];
}

export const NutrientGapAlert: React.FC<NutrientGapAlertProps> = ({ gaps }) => {
  const [showAll, setShowAll] = useState(false);

  const criticalAndLowGaps = gaps.filter(g => g.percent < 80);
  const displayedGaps = showAll ? gaps : criticalAndLowGaps.slice(0, 4);

  if (criticalAndLowGaps.length === 0 && gaps.length > 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/70">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-emerald-900">¡Metas Nutricionales Cubiertas!</h3>
            <p className="text-xs text-slate-700">
              Has alcanzado o estás muy cerca de todos tus requerimientos diarios recomendados (macros y micronutrientes).
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white">
      <div className="flex items-start sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-slate-900 truncate">Diagnóstico Nutricional</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              {criticalAndLowGaps.length} nutriente{criticalAndLowGaps.length !== 1 ? 's' : ''} por debajo del objetivo diario
            </p>
          </div>
        </div>

        <Badge variant={criticalAndLowGaps.length > 3 ? 'rose' : 'amber'} size="sm" className="shrink-0">
          {criticalAndLowGaps.length} pendientes
        </Badge>
      </div>

      <div className="space-y-2.5 mt-4">
        {displayedGaps.map((item) => {
          const missingAmount = Math.max(0, Math.round((item.target - item.current) * 10) / 10);
          const isCritical = item.percent < 40;

          return (
            <div
              key={item.key}
              className={`p-3 rounded-2xl border transition-all ${
                isCritical
                  ? 'bg-rose-50/60 border-rose-200'
                  : item.percent < 80
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{item.name}</span>
                  <Badge
                    variant={isCritical ? 'rose' : item.percent < 80 ? 'amber' : 'emerald'}
                    size="sm"
                  >
                    {item.percent}%
                  </Badge>
                </div>

                <span className="text-xs text-slate-600 font-mono">
                  {item.current} / {item.target} {item.unit}
                </span>
              </div>

              {/* Barra de progreso sutil */}
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isCritical ? 'bg-rose-500' : item.percent < 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>

              {/* Sugerencias de alimentos */}
              {item.foodSuggestions && item.foodSuggestions.length > 0 && (
                <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-slate-200/80 text-xs">
                  <Lightbulb size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-700">
                    <span className="text-slate-500">Te faltan {missingAmount} {item.unit}. Agrega: </span>
                    <span className="text-emerald-800 font-semibold">
                      {item.foodSuggestions.slice(0, 3).join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {gaps.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-center gap-1.5 transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp size={16} /> Ver solo pendientes principales
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Ver análisis completo de todos los nutrientes ({gaps.length})
            </>
          )}
        </button>
      )}
    </Card>
  );
};
