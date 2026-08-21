import React from 'react';
import { CheckCircle2, Lightbulb, ShieldAlert } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { StatsOverview } from '../../services/statsEngine';

interface DeficiencyHeatmapProps {
  deficiencies: StatsOverview['recurringDeficiencies'];
  activeDays: number;
}

export const DeficiencyHeatmap: React.FC<DeficiencyHeatmapProps> = ({ deficiencies, activeDays }) => {
  if (activeDays === 0 || deficiencies.length === 0) {
    return (
      <Card className="border-emerald-200 bg-emerald-50/70 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-emerald-900">Sin Deficiencias Crónicas Detectadas</h4>
            <p className="text-xs text-slate-700">
              No se observan carencias recurrentes en el período analizado. ¡Excelente balance de nutrientes!
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Mapa de Carencias Recurrentes</h3>
            <p className="text-xs text-slate-500">Nutrientes que no alcanzan tu objetivo con mayor frecuencia</p>
          </div>
        </div>

        <Badge variant="rose" size="sm">
          {deficiencies.length} detectados
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {deficiencies.map((item) => (
          <div
            key={item.nutrientKey}
            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900">{item.nutrientName}</span>
                <span className="text-[11px] font-extrabold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                  Déficit en {item.deficiencyRate}% de días
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono mb-2">
                <span>Promedio: {item.avgIntake} {item.unit}</span>
                <span>Objetivo: {item.target} {item.unit}</span>
              </div>
            </div>

            {item.suggestedFoods.length > 0 && (
              <div className="pt-2 border-t border-slate-200 flex items-start gap-1.5 text-[11px]">
                <Lightbulb size={13} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">
                  <strong className="text-emerald-800">Alimentos clave:</strong> {item.suggestedFoods.slice(0, 3).join(', ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
