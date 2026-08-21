import React, { useState } from 'react';
import { 
  Sparkles, 
  ChefHat, 
  Loader2, 
  Check, 
  Utensils, 
  Plus, 
  AlertCircle, 
  Clock, 
  Heart,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Meal, NutritionGoals, DailyNutritionSummary, MealType } from '../../types/nutrition.types';
import { analyzeFoodWithAI } from '../../services/aiNutritionService';
import { dbService } from '../../db/dbService';
import { awardXp, unlockAchievement } from '../../services/gamificationService';

interface AiMealSuggesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailySummary: DailyNutritionSummary;
  goals: NutritionGoals;
  onMealAdded?: (meal: Meal) => void;
}

export const AiMealSuggesterModal: React.FC<AiMealSuggesterModalProps> = ({
  isOpen,
  onClose,
  dailySummary,
  goals,
  onMealAdded
}) => {
  const [selectedType, setSelectedType] = useState<MealType>('dinner');
  const [userPreferences, setUserPreferences] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedMeal, setSuggestedMeal] = useState<Meal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const remCalories = Math.max(0, goals.calories - dailySummary.totalCalories);
  const remProtein = Math.max(0, Math.round((goals.protein - dailySummary.totalProtein) * 10) / 10);
  const remCarbs = Math.max(0, Math.round((goals.carbs - dailySummary.totalCarbs) * 10) / 10);
  const remFat = Math.max(0, Math.round((goals.fat - dailySummary.totalFat) * 10) / 10);

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setSuggestedMeal(null);

    const promptText = `Actúa como mi chef y nutricionista bioquímico personal de alta precisión.
ESTADO DE CONSUMO DE HOY:
- Consumido hasta ahora: ${dailySummary.totalCalories} kcal (${dailySummary.totalProtein}g P, ${dailySummary.totalCarbs}g C, ${dailySummary.totalFat}g F).
- Metas diarias: ${goals.calories} kcal (${goals.protein}g P, ${goals.carbs}g C, ${goals.fat}g F).

DEFICIT EXACTO RESTANTE A CUBRIR HOY:
- Calorías restantes: ~${remCalories} kcal
- Proteína restante: ~${remProtein}g
- Carbohidratos restantes: ~${remCarbs}g
- Grasas restantes: ~${remFat}g

INSTRUCCIÓN DE DISEÑO DE RECETA:
Diseña una comida deliciosa y fácil de preparar para el momento "${selectedType}" ${userPreferences ? `considerando estos ingredientes o preferencias: "${userPreferences}"` : 'con ingredientes densos en nutrientes y alta saciedad'} que se ajuste con máxima fidelidad matemática a estos macros restantes.
Calcula todos los lípidos (omega3_g, grasas monoinsaturadas, saturadas, colesterol_mg, colina_mg) y micronutrientes para maximizar la recomposición corporal.`;

    try {
      const result = await analyzeFoodWithAI(promptText);
      if (result.success && result.meal) {
        result.meal.mealType = selectedType;
        result.meal.name = `Sugerencia IA: ${result.meal.name.replace(/^Sugerencia IA:\s*/, '')}`;
        setSuggestedMeal(result.meal);
      } else {
        setErrorMessage(result.error || 'No se pudo generar la sugerencia. Intenta de nuevo.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al conectar con la IA');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogSuggestedMeal = async () => {
    if (!suggestedMeal) return;

    setIsSaving(true);
    try {
      await dbService.addMeal(suggestedMeal, true);
      awardXp(35, 'Comida Sugerida por IA Ingerida');
      unlockAchievement('ai_vision');

      if (onMealAdded) {
        onMealAdded(suggestedMeal);
      }
      onClose();
    } catch (e) {
      console.error('Error guardando comida sugerida:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-purple-100 text-purple-800">
            <ChefHat size={18} />
          </div>
          <span>Sugeridor Inteligente de Comidas con IA</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Resumen del Déficit Restante del Día */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 block mb-1">
            Lo que te falta consumir hoy para clavar tus metas:
          </span>
          <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono">
            <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Calorías</span>
              <span className="text-sm font-black text-amber-800">{remCalories} kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Proteína</span>
              <span className="text-sm font-black text-emerald-800">{remProtein}g</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Carbos</span>
              <span className="text-sm font-black text-sky-800">{remCarbs}g</span>
            </div>
            <div className="p-2 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-[10px] text-slate-500 block">Grasas</span>
              <span className="text-sm font-black text-amber-700">{remFat}g</span>
            </div>
          </div>
        </div>

        {/* Tipo de comida a sugerir */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
            ¿Qué momento del día deseas planificar?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {[
              { id: 'dinner', label: 'Cena', emoji: '🐟' },
              { id: 'lunch', label: 'Almuerzo', emoji: '🥗' },
              { id: 'breakfast', label: 'Desayuno', emoji: '🍳' },
              { id: 'snack', label: 'Snack / Post-Entreno', emoji: '🍎' }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id as MealType)}
                className={`py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all border ${
                  selectedType === t.id
                    ? 'bg-purple-100 text-purple-950 font-bold border-purple-300 shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{t.emoji}</span>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preferencias o Ingredientes Disponibles */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Ingredientes que tienes o antojo (opcional):
          </label>
          <input
            type="text"
            value={userPreferences}
            onChange={(e) => setUserPreferences(e.target.value)}
            placeholder="Ej: 'Tengo pechuga de pollo y aguacate', 'Quiero algo rápido de 10 min'..."
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500 font-medium"
          />
        </div>

        {/* Botón Generar */}
        <Button
          variant="primary"
          size="md"
          onClick={handleGenerateSuggestion}
          disabled={isGenerating}
          icon={isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          className="w-full shadow-md shadow-purple-600/20"
        >
          {isGenerating ? 'La IA está diseñando tu comida a la medida exacta...' : '✨ Sugerir Comida Inteligente para Mis Macros'}
        </Button>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Resultado Sugerido */}
        {suggestedMeal && (
          <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-sm space-y-3 animate-fadeIn">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Plato Recomendado por la IA:
                </span>
                <h4 className="text-sm font-black text-slate-900">{suggestedMeal.name}</h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-base font-black text-amber-800 font-mono block">{suggestedMeal.totalCalories} kcal</span>
                <span className="text-[10px] text-slate-500 font-mono font-bold">
                  {suggestedMeal.totalProtein}g P • {suggestedMeal.totalCarbs}g C • {suggestedMeal.totalFat}g F
                </span>
              </div>
            </div>

            {/* Ingredientes de la receta */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
              <span className="font-bold text-slate-700 block mb-1">Ingredientes & Porciones Calculadas:</span>
              {suggestedMeal.foods.map((food, i) => (
                <div key={i} className="flex items-center justify-between text-slate-700 border-b border-slate-100 pb-1 last:border-0 last:pb-0">
                  <span className="font-medium">• {food.name} <strong className="text-slate-900 font-mono">({food.amount})</strong></span>
                  <span className="font-mono text-slate-600 font-bold">{food.calories} kcal ({food.protein}g P)</span>
                </div>
              ))}
            </div>

            {/* Análisis y Consejo Nutricional de la IA */}
            {suggestedMeal.aiFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold block text-[11px] mb-0.5">💡 Consejo Bioquímico:</span>
                <p className="text-[11px] text-slate-700">{suggestedMeal.aiFeedback}</p>
              </div>
            )}

            {/* Botón para Ingerir la Sugerencia */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="primary"
                size="sm"
                onClick={handleLogSuggestedMeal}
                disabled={isSaving}
                icon={<Plus size={15} />}
                className="shadow-sm"
              >
                {isSaving ? 'Guardando...' : 'Registrar esta Comida en mi Diario (+35 XP)'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
