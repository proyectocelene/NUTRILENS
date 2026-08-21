import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Card } from '../common/Card';
import { StatsOverview } from '../../services/statsEngine';

interface SmartInsightsProps {
  insights: StatsOverview['smartInsights'];
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({ insights }) => {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Análisis y Sugerencias Inteligentes</h3>
          <p className="text-xs text-slate-500">Patrones detectados por el motor nutricional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => {
          const isPositive = insight.type === 'positive';
          const isWarning = insight.type === 'warning';

          return (
            <div
              key={insight.id}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all ${
                isPositive
                  ? 'bg-emerald-50/70 border-emerald-200'
                  : isWarning
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isPositive
                    ? 'bg-emerald-100 text-emerald-800'
                    : isWarning
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {isPositive ? (
                  <CheckCircle2 size={18} />
                ) : isWarning ? (
                  <AlertTriangle size={18} />
                ) : (
                  <Info size={18} />
                )}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900">{insight.title}</h4>
                <p className="text-[11px] text-slate-700 mt-1 leading-relaxed">
                  {insight.message}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
