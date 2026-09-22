import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Utensils, Calendar, Clock, Plus, Scale, Check, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CanonicalFood, Meal, MealType, FoodItem } from '../../types/nutrition.types';
import { LearnedFood } from '../../types/db.types';
import { dbService } from '../../db/dbService';
import { getLocalDateString } from '../../utils/dateUtils';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';
import { parseGramsFromAmount, scaleFoodItem, roundTo } from '../../services/portionScaler';
import { awardXp, checkAndUpdateStreak } from '../../services/gamificationService';

interface LogFoodPortionModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: CanonicalFood | LearnedFood | null;
  onMealAdded?: (meal: Meal) => void;
}

const MEAL_TYPES: { id: MealType; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Desayuno', emoji: '🍳' },
  { id: 'lunch', label: 'Almuerzo', emoji: '🥗' },
  { id: 'dinner', label: 'Cena', emoji: '🐟' },
  { id: 'snack', label: 'Snack / Merienda', emoji: '🍎' },
  { id: 'other', label: 'Suplemento / Otro', emoji: '💊' }
];

export const LogFoodPortionModal: React.FC<LogFoodPortionModalProps> = ({
  isOpen,
  onClose,
  food,
  onMealAdded
}) => {
  if (!food) return null;

  // Determinar si es Canonical o Learned
  const isCanonical = 'servingSize' in food;
  const foodName = food.name;
  const foodBrand = isCanonical ? (food as CanonicalFood).brand : 'Aprendido de comidas';
  const foodEmoji = getSmartFoodEmoji(foodName);

  const baseGrams = useMemo(() => {
    if (isCanonical) {
      const c = food as CanonicalFood;
      return c.servingGrams || parseGramsFromAmount(c.servingSize) || 100;
    } else {
      const l = food as LearnedFood;
      return parseGramsFromAmount(l.sampleAmount) || 100;
    }
  }, [food, isCanonical]);

  // Alimento base normalizado como FoodItem
  const baseFoodItem: FoodItem = useMemo(() => {
    if (isCanonical) {
      const c = food as CanonicalFood;
      return {
        name: c.name,
        emoji: foodEmoji,
        amount: c.servingSize,
        grams: baseGrams,
        servingGrams: baseGrams,
        calories: c.calories,
        protein: c.protein,
        carbs: c.carbs,
        fat: c.fat,
        fiber: c.fiber,
        nutrients: c.nutrients,
        category: c.category
      };
    } else {
      const l = food as LearnedFood;
      return {
        name: l.name,
        emoji: foodEmoji,
        amount: l.sampleAmount || `${baseGrams}g`,
        grams: baseGrams,
        servingGrams: baseGrams,
        calories: l.avgCalories,
        protein: l.avgProtein,
        carbs: l.avgCarbs,
        fat: l.avgFat,
        fiber: l.avgFiber,
        nutrients: l.nutrients
      };
    }
  }, [food, isCanonical, baseGrams, foodEmoji]);

  const [targetGrams, setTargetGrams] = useState<number>(baseGrams);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [date, setDate] = useState<string>(getLocalDateString());
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Alimento escalado en vivo a la porción elegida
  const scaledFood = useMemo(() => {
    return scaleFoodItem(baseFoodItem, targetGrams, baseGrams);
  }, [baseFoodItem, targetGrams, baseGrams]);

  const handleSaveMeal = async () => {
    setIsSaving(true);
    try {
      const newMeal: Meal = {
        name: `${foodName} (${roundTo(targetGrams, 1)}g)`,
        emoji: foodEmoji,
        mealType,
        date,
        time,
        foods: [scaledFood],
        totalCalories: Math.round(scaledFood.calories),
        totalProtein: roundTo(scaledFood.protein, 1),
        totalCarbs: roundTo(scaledFood.carbs, 1),
        totalFat: roundTo(scaledFood.fat, 1),
        totalFiber: roundTo(scaledFood.fiber || 0, 1),
        totalNutrients: scaledFood.nutrients || {},
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await dbService.addMeal(newMeal, false);
      checkAndUpdateStreak(newMeal.date);
      awardXp(20, 'Alimento Canónico Ingerido');

      confetti({
        particleCount: 60,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#059669', '#10B981', '#34D399']
      });

      if (onMealAdded) {
        onMealAdded(newMeal);
      }
      onClose();
    } catch (err) {
      console.error('Error registrando alimento:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Utensils size={18} />
          </div>
          <span className="font-bold text-sm text-slate-900">Ingerir Alimento / Porción</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Ficha del alimento seleccionado */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
          <div className="text-3xl p-2 rounded-2xl bg-white border border-emerald-200 shadow-2xs shrink-0">
            {foodEmoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-slate-700 font-mono border border-slate-200">
                {foodBrand}
              </span>
              <span className="text-[10px] text-emerald-800 font-medium">
                Referencia base: {baseGrams}g
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900 truncate">{foodName}</h4>
            <p className="text-[11px] text-slate-500 font-mono">
              Valores base: {Math.round(baseFoodItem.calories)} kcal | {baseFoodItem.protein}g P | {baseFoodItem.carbs}g C | {baseFoodItem.fat}g G
            </p>
          </div>
        </div>

        {/* Selector Inteligente de Porción / Gramos */}
        <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Scale size={14} className="text-emerald-700" />
              <span>¿Cuánto consumiste? (Gramos)</span>
            </label>
            <span className="text-xs font-mono font-black text-emerald-800 bg-white px-2 py-0.5 rounded-lg border border-emerald-200">
              {roundTo(targetGrams, 1)} g
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="500"
              step="5"
              value={targetGrams}
              onChange={(e) => setTargetGrams(Number(e.target.value))}
              className="flex-1 accent-emerald-600 cursor-pointer"
            />
            <div className="relative w-24 shrink-0">
              <input
                type="number"
                min="1"
                step="1"
                value={targetGrams}
                onChange={(e) => setTargetGrams(Math.max(1, Number(e.target.value) || 0))}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500 text-center"
              />
              <span className="absolute right-2 top-1 text-[10px] font-bold text-slate-400 pointer-events-none">g</span>
            </div>
          </div>

          {/* Chips de acceso rápido */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-slate-400 mr-1">Rápido:</span>
            {[30, 50, 70, 100, 150, 200, 250].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setTargetGrams(g)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all ${
                  targetGrams === g
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200'
                }`}
              >
                {g}g
              </button>
            ))}
          </div>

          {/* Multiplicadores directos */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-bold text-slate-400 mr-1">Factores:</span>
            {[
              { label: '½ Porción', mult: 0.5 },
              { label: '1x Base', mult: 1.0 },
              { label: '1.5x', mult: 1.5 },
              { label: '2x Doble', mult: 2.0 }
            ].map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setTargetGrams(roundTo(baseGrams * m.mult, 1))}
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200"
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desglose de Macros Calculados en Vivo */}
        <div className="grid grid-cols-4 gap-2 text-center p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-0.5">
              <Flame size={10} className="text-rose-500" /> Kcal
            </span>
            <span className="text-sm font-black text-rose-700 font-mono block">
              {Math.round(scaledFood.calories)}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
              <Dumbbell size={10} /> Prot
            </span>
            <span className="text-sm font-black text-emerald-800 font-mono block">
              {roundTo(scaledFood.protein, 1)}g
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-sky-600 flex items-center justify-center gap-0.5">
              <Wheat size={10} /> Carbos
            </span>
            <span className="text-sm font-black text-sky-800 font-mono block">
              {roundTo(scaledFood.carbs, 1)}g
            </span>
          </div>

          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
              <Droplets size={10} /> Grasas
            </span>
            <span className="text-sm font-black text-amber-800 font-mono block">
              {roundTo(scaledFood.fat, 1)}g
            </span>
          </div>
        </div>

        {/* Momento del Día */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Momento del Día</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {MEAL_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMealType(t.id)}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                  mealType === t.id
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <span>{t.emoji}</span>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Calendar size={12} /> Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Clock size={12} /> Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveMeal}
            disabled={isSaving || targetGrams <= 0}
            icon={<Check size={16} />}
          >
            {isSaving ? 'Registrando...' : 'Registrar Ingesta'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
