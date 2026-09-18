import React, { useState } from 'react';
import { 
  HeartPulse, 
  ChefHat, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Meal } from '../../types/nutrition.types';
import { getMealNutritionalAlerts, NutritionAlert } from '../../utils/nutritionAlerts';

interface MealHealthCardProps {
  meal: Meal;
  defaultExpanded?: boolean;
}

export const MealHealthCard: React.FC<MealHealthCardProps> = ({ meal, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const diag = meal.healthDiagnostic;
  const alerts = getMealNutritionalAlerts(meal);

  const hasContent = !!(
    diag?.diagnosis ||
    (diag?.pros && diag.pros.length > 0) ||
    (diag?.cons && diag.cons.length > 0) ||
    (diag?.tips && diag.tips.length > 0) ||
    diag?.healthierAlternatives ||
    meal.aiFeedback ||
    alerts.length > 0
  );

  if (!hasContent) return null;

  // Calcular score de salud estimado si la IA no devolvió uno explícito
  let calculatedScore = diag?.score;
  if (!calculatedScore) {
    let base = 80;
    // Bonificaciones
    if ((meal.totalProtein * 4) / Math.max(1, meal.totalCalories) >= 0.30) base += 8;
    if (meal.totalFiber >= 5) base += 7;
    if ((meal.totalNutrients?.omega3_g || 0) >= 0.5) base += 5;
    // Penalizaciones
    if ((meal.totalNutrients?.trans_fat_g || 0) > 0) base -= 25;
    if ((meal.totalNutrients?.sodium_mg || 0) > 800) base -= 8;
    if ((meal.totalNutrients?.sugar_g || 0) > 18) base -= 7;
    calculatedScore = Math.max(35, Math.min(99, base));
  }

  const scoreBadgeColor =
    calculatedScore >= 85
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : calculatedScore >= 70
      ? 'bg-sky-100 text-sky-900 border-sky-300'
      : calculatedScore >= 50
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-rose-100 text-rose-900 border-rose-300';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 overflow-hidden shadow-2xs transition-all">
      {/* Barra superior de diagnóstico */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 bg-slate-50/90 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between gap-2 transition-colors select-none"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
            <HeartPulse size={16} />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Diagnóstico & Salud
              </span>
              <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md border ${scoreBadgeColor}`}>
                Score: {calculatedScore}/100
              </span>
            </div>
            {diag?.diagnosis ? (
              <p className="text-[11px] text-slate-600 truncate mt-0.5">{diag.diagnosis}</p>
            ) : alerts.length > 0 ? (
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} e indicadores detectados
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 p-1 rounded-lg shrink-0"
          aria-label={isExpanded ? 'Colapsar diagnóstico' : 'Expandir diagnóstico'}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {/* Contenido expandible detallado */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3.5 border-t border-slate-200/80 text-xs">
          {/* Diagnóstico clínico de la IA */}
          {(diag?.diagnosis || meal.aiFeedback) && (
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-emerald-950">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1 flex items-center gap-1">
                <ShieldCheck size={12} /> Diagnóstico Nutricional:
              </span>
              <p className="text-xs leading-relaxed text-slate-800">
                {diag?.diagnosis || meal.aiFeedback}
              </p>
            </div>
          )}

          {/* Sección Pros (Lo Bueno) y Cons (A Mejorar) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Pros */}
            {diag?.pros && diag.pros.length > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50/40 border border-emerald-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 block mb-1.5 flex items-center gap-1">
                  <CheckCircle2 size={12} className="text-emerald-700" /> Lo Bueno (Fortalezas):
                </span>
                <ul className="space-y-1">
                  {diag.pros.map((pro, i) => (
                    <li key={i} className="text-[11px] text-slate-800 flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold shrink-0">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {diag?.cons && diag.cons.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-50/40 border border-amber-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 block mb-1.5 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-700" /> A Mejorar / Atención:
                </span>
                <ul className="space-y-1">
                  {diag.cons.map((con, i) => (
                    <li key={i} className="text-[11px] text-slate-800 flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tips del Chef & Cómo hacerlo más saludable */}
          {((diag?.tips && diag.tips.length > 0) || diag?.healthierAlternatives) && (
            <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/90 text-amber-950">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 block mb-1.5 flex items-center gap-1.5">
                <ChefHat size={14} className="text-amber-700" /> Tips del Chef para hacerlo más saludable:
              </span>
              {diag?.tips && (
                <ul className="space-y-1.5 mb-2">
                  {diag.tips.map((tip, i) => (
                    <li key={i} className="text-[11px] text-slate-800 flex items-start gap-1.5">
                      <Lightbulb size={12} className="text-amber-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
              {diag?.healthierAlternatives && (
                <div className="mt-1.5 pt-1.5 border-t border-amber-200/60 text-[11px] text-slate-700">
                  <strong className="text-amber-900">Variante saludable sugerida:</strong> {diag.healthierAlternatives}
                </div>
              )}
            </div>
          )}

          {/* Alertas Clínicas del Plato */}
          {alerts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                Alertas Nutricionales del Plato:
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {alerts.map(a => (
                  <div
                    key={a.id}
                    className={`p-2 rounded-xl border flex items-start gap-2 text-[11px] ${
                      a.type === 'danger'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : a.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : a.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {a.type === 'danger' ? (
                        <AlertCircle size={14} className="text-rose-600" />
                      ) : a.type === 'warning' ? (
                        <AlertTriangle size={14} className="text-amber-600" />
                      ) : a.type === 'success' ? (
                        <Zap size={14} className="text-emerald-600" />
                      ) : (
                        <ShieldCheck size={14} className="text-slate-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold">{a.title}</span>
                        {a.metric && (
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-white/80 border border-slate-200 shrink-0">
                            {a.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] opacity-90 leading-tight mt-0.5">{a.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
