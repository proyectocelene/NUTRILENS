import React, { useState } from 'react';
import { Clock, Trash2, Copy, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { Meal, MealType } from '../../types/nutrition.types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FoodItemsList } from '../nutrition/FoodItemsList';
import { dbService } from '../../db/dbService';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';

interface MealCardProps {
  meal: Meal;
  onDeleted?: () => void;
  onReuseJson?: (json: string) => void;
}

const MEAL_BADGE_MAP: Record<MealType, { label: string; variant: 'emerald' | 'amber' | 'blue' | 'purple' | 'slate' }> = {
  breakfast: { label: 'Desayuno', variant: 'amber' },
  lunch: { label: 'Almuerzo', variant: 'emerald' },
  dinner: { label: 'Cena', variant: 'blue' },
  snack: { label: 'Snack', variant: 'purple' },
  other: { label: 'Comida', variant: 'slate' }
};

export const MealCard: React.FC<MealCardProps> = ({ meal, onDeleted, onReuseJson }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const badgeInfo = MEAL_BADGE_MAP[meal.mealType] || MEAL_BADGE_MAP.other;
  const foodEmoji = meal.emoji || getSmartFoodEmoji(meal.name, meal.mealType);

  const handleDelete = async () => {
    if (meal.id) {
      await dbService.deleteMeal(meal.id);
      if (onDeleted) onDeleted();
    }
  };

  const handleCopyJson = () => {
    const jsonStr = meal.sourceJson || JSON.stringify(meal, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <Card className="border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs">
      {/* Encabezado de la comida */}
      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="text-xl sm:text-2xl p-1.5 sm:p-2 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
            {foodEmoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-0.5">
              <Badge variant={badgeInfo.variant} size="sm">
                {badgeInfo.label}
              </Badge>
              {meal.time && (
                <span className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                  <Clock size={10} /> {meal.time}
                </span>
              )}
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{meal.name}</h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
              {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''} registrado{meal.foods.length !== 1 ? 's' : ''}
            </p>

            {/* Biofeedback Chips si existen */}
            {meal.biofeedback && (meal.biofeedback.satiety || meal.biofeedback.digestion || meal.biofeedback.energy) && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5">
                {meal.biofeedback.satiety && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                    {meal.biofeedback.satiety === 'light' ? '🪶 Ligero' : meal.biofeedback.satiety === 'satisfied' ? '😊 Saciado' : meal.biofeedback.satiety === 'full' ? '🫄 Lleno' : '😮‍💨 Pesado'}
                  </span>
                )}
                {meal.biofeedback.digestion && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 font-medium">
                    {meal.biofeedback.digestion === 'great' ? '✨ Digestión Top' : meal.biofeedback.digestion === 'normal' ? '👍 Normal' : meal.biofeedback.digestion === 'heavy' ? '⚠️ Pesadez' : meal.biofeedback.digestion === 'bloated' ? '💨 Gases' : '🔥 Acidez'}
                  </span>
                )}
                {meal.biofeedback.energy && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    {meal.biofeedback.energy === 'energized' ? '⚡ Energía Alta' : meal.biofeedback.energy === 'normal' ? '👌 Normal' : meal.biofeedback.energy === 'sleepy' ? '🥱 Sueño' : '🔋 Cansado'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Macros */}
        <div className="text-right shrink-0 pl-1">
          <span className="text-sm sm:text-base font-extrabold text-amber-800 block font-mono">
            {meal.totalCalories} <span className="text-[10px] sm:text-xs text-slate-500 font-normal">kcal</span>
          </span>
          <div className="text-[10px] sm:text-[11px] space-x-1 sm:space-x-1.5 font-bold mt-0.5">
            <span className="text-emerald-700">{meal.totalProtein}g P</span>
            <span className="text-sky-700">{meal.totalCarbs}g C</span>
            <span className="text-amber-700">{meal.totalFat}g G</span>
          </div>
        </div>
      </div>

      {/* Botones de acción rápida y expandir */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 text-xs">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp size={15} /> Ocultar detalle
            </>
          ) : (
            <>
              <ChevronDown size={15} /> Ver ingredientes ({meal.foods.length})
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyJson}
            title="Copiar JSON original de esta comida"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {copiedJson ? <Check size={14} className="text-emerald-700" /> : <Copy size={14} />}
          </button>

          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200">
              <span className="text-[10px] text-rose-800 font-bold px-1">¿Borrar?</span>
              <button
                onClick={handleDelete}
                className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-500"
              >
                Sí
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2 py-0.5 rounded-lg bg-slate-200 text-slate-700 text-[10px]"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsConfirmingDelete(true)}
              title="Eliminar comida"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Lista detallada de ingredientes al expandir */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
          {/* Metadata de IA si fue procesada por Gemini */}
          {(meal.originalPrompt || meal.aiModelUsed || meal.aiFeedback) && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              {meal.aiModelUsed && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    Modelo de Procesamiento:
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                    🤖 {meal.aiModelUsed}
                  </span>
                </div>
              )}

              {meal.originalPrompt && (
                <div>
                  <span className="text-[10px] font-bold text-slate-600 block">Texto / Dictado Original del Usuario:</span>
                  <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 mt-0.5">
                    "{meal.originalPrompt}"
                  </p>
                </div>
              )}

              {meal.aiFeedback && (
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 block">Análisis Nutricional de la IA:</span>
                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-emerald-100 mt-0.5">
                    💡 {meal.aiFeedback}
                  </p>
                </div>
              )}
            </div>
          )}

          <FoodItemsList foods={meal.foods} />
        </div>
      )}
    </Card>
  );
};
