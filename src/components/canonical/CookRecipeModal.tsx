import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { ChefHat, Plus, Trash2, Search, Scale, Save, Check, Utensils, Calendar, Clock, BookOpen, Flame, Dumbbell, Wheat, Droplets } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CanonicalFood, Meal, MealType, FoodItem } from '../../types/nutrition.types';
import { LearnedFood, DbRecipe } from '../../types/db.types';
import { dbService } from '../../db/dbService';
import { getLocalDateString } from '../../utils/dateUtils';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';
import { parseGramsFromAmount, scaleFoodItem, recalculateMealTotals, roundTo } from '../../services/portionScaler';
import { awardXp, checkAndUpdateStreak } from '../../services/gamificationService';

interface CookRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalFoods: CanonicalFood[];
  learnedFoods: LearnedFood[];
  initialSelectedFood?: CanonicalFood | LearnedFood | null;
  onMealAdded?: (meal: Meal) => void;
  onRecipeCreated?: (recipe: DbRecipe) => void;
}

export const CookRecipeModal: React.FC<CookRecipeModalProps> = ({
  isOpen,
  onClose,
  canonicalFoods,
  learnedFoods,
  initialSelectedFood,
  onMealAdded,
  onRecipeCreated
}) => {
  const [dishName, setDishName] = useState('Mi Receta / Plato');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [date, setDate] = useState<string>(getLocalDateString());
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  const [ingredients, setIngredients] = useState<FoodItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar con alimento seleccionado si fue provisto
  React.useEffect(() => {
    if (initialSelectedFood) {
      const isCanon = 'servingSize' in initialSelectedFood;
      const g = isCanon
        ? (initialSelectedFood as CanonicalFood).servingGrams || parseGramsFromAmount((initialSelectedFood as CanonicalFood).servingSize) || 100
        : parseGramsFromAmount((initialSelectedFood as LearnedFood).sampleAmount) || 100;

      const item: FoodItem = {
        name: initialSelectedFood.name,
        emoji: getSmartFoodEmoji(initialSelectedFood.name),
        amount: isCanon ? (initialSelectedFood as CanonicalFood).servingSize : `${g}g`,
        grams: g,
        servingGrams: g,
        calories: isCanon ? (initialSelectedFood as CanonicalFood).calories : (initialSelectedFood as LearnedFood).avgCalories,
        protein: isCanon ? (initialSelectedFood as CanonicalFood).protein : (initialSelectedFood as LearnedFood).avgProtein,
        carbs: isCanon ? (initialSelectedFood as CanonicalFood).carbs : (initialSelectedFood as LearnedFood).avgCarbs,
        fat: isCanon ? (initialSelectedFood as CanonicalFood).fat : (initialSelectedFood as LearnedFood).avgFat,
        fiber: isCanon ? (initialSelectedFood as CanonicalFood).fiber : (initialSelectedFood as LearnedFood).avgFiber,
        nutrients: initialSelectedFood.nutrients || {}
      };
      setIngredients([item]);
      setDishName(`Plato con ${initialSelectedFood.name}`);
    } else {
      setIngredients([]);
      setDishName('Mi Receta / Plato');
    }
  }, [initialSelectedFood, isOpen]);

  // Lista unificada para el buscador
  const availableFoods = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return [];

    const canonMatches = canonicalFoods
      .filter(f => f.name.toLowerCase().includes(q) || (f.brand && f.brand.toLowerCase().includes(q)))
      .slice(0, 6)
      .map(c => ({
        type: 'canonical' as const,
        data: c,
        name: c.name,
        brand: c.brand,
        servingSize: c.servingSize,
        servingGrams: c.servingGrams || parseGramsFromAmount(c.servingSize) || 100,
        calories: c.calories,
        protein: c.protein,
        carbs: c.carbs,
        fat: c.fat,
        fiber: c.fiber,
        nutrients: c.nutrients
      }));

    const learnedMatches = learnedFoods
      .filter(f => f.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map(l => ({
        type: 'learned' as const,
        data: l,
        name: l.name,
        brand: 'Aprendido',
        servingSize: l.sampleAmount || '100g',
        servingGrams: parseGramsFromAmount(l.sampleAmount) || 100,
        calories: l.avgCalories,
        protein: l.avgProtein,
        carbs: l.avgCarbs,
        fat: l.avgFat,
        fiber: l.avgFiber,
        nutrients: l.nutrients
      }));

    return [...canonMatches, ...learnedMatches];
  }, [canonicalFoods, learnedFoods, searchQuery]);

  const handleAddIngredient = (item: any) => {
    const g = item.servingGrams || 100;
    const newFood: FoodItem = {
      name: item.name,
      emoji: getSmartFoodEmoji(item.name),
      amount: item.servingSize || `${g}g`,
      grams: g,
      servingGrams: g,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
      fiber: item.fiber || 0,
      nutrients: item.nutrients || {}
    };

    setIngredients(prev => [...prev, newFood]);
    setSearchQuery('');
  };

  const handleUpdateIngredientGrams = (index: number, newGrams: number) => {
    if (newGrams <= 0) return;
    const target = ingredients[index];
    if (!target) return;

    const scaled = scaleFoodItem(target, newGrams);
    const updated = [...ingredients];
    updated[index] = scaled;
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

  // Totales acumulados en vivo
  const totals = useMemo(() => {
    return recalculateMealTotals(ingredients);
  }, [ingredients]);

  // Acción 1: Ingerir como Comida
  const handleLogAsMeal = async () => {
    if (ingredients.length === 0) return;
    setIsSaving(true);
    try {
      const meal: Meal = {
        name: dishName.trim() || 'Comida Preparada',
        emoji: '🍳',
        mealType,
        date,
        time,
        foods: ingredients,
        ...totals,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await dbService.addMeal(meal, true);
      checkAndUpdateStreak(meal.date);
      awardXp(30, 'Plato Cocinado e Ingerido');

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#059669', '#0284C7', '#F59E0B']
      });

      if (onMealAdded) onMealAdded(meal);
      onClose();
    } catch (err) {
      console.error('Error registrando comida:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Acción 2: Guardar en el Banco de Recetas
  const handleSaveAsRecipe = async () => {
    if (ingredients.length === 0) return;
    setIsSaving(true);
    try {
      const recipe: DbRecipe = {
        name: dishName.trim() || 'Nueva Receta',
        category: mealType,
        servings: 1,
        foods: ingredients,
        ...totals,
        createdAt: Date.now()
      };

      const id = await dbService.saveRecipe(recipe);
      awardXp(25, 'Receta Creada en el Banco');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#6366F1', '#10B981', '#F59E0B']
      });

      if (onRecipeCreated) onRecipeCreated({ ...recipe, id });
      onClose();
    } catch (err) {
      console.error('Error guardando receta:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-800">
            <ChefHat size={20} />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 block">Cocinar / Crear Receta con Banco Canónico</span>
            <span className="text-[11px] text-slate-500 font-normal">Combina ingredientes con porciones inteligentes</span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Nombre del plato y Momento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Plato / Receta</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              placeholder="Ej: Bowl de Pollo y Arroz con Aguacate"
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Momento Sugerido</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
            >
              <option value="breakfast">🌅 Desayuno</option>
              <option value="lunch">☀️ Almuerzo / Comida</option>
              <option value="dinner">🌙 Cena</option>
              <option value="snack">🍎 Snack / Merienda</option>
              <option value="other">🍽️ Otro / Suplemento</option>
            </select>
          </div>
        </div>

        {/* Totales Nutricionales Acumulados */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center shadow-2xs">
          <div className="p-2 rounded-xl bg-white border border-indigo-100">
            <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-0.5">
              <Flame size={11} className="text-rose-500" /> Kcal Total
            </span>
            <span className="text-base font-black text-rose-700 font-mono block">
              {totals.totalCalories}
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-indigo-100">
            <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-0.5">
              <Dumbbell size={11} /> Proteína
            </span>
            <span className="text-base font-black text-emerald-800 font-mono block">
              {totals.totalProtein}g
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-indigo-100">
            <span className="text-[10px] font-bold text-sky-600 flex items-center justify-center gap-0.5">
              <Wheat size={11} /> Carbos
            </span>
            <span className="text-base font-black text-sky-800 font-mono block">
              {totals.totalCarbs}g
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-indigo-100">
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-center gap-0.5">
              <Droplets size={11} /> Grasas
            </span>
            <span className="text-base font-black text-amber-800 font-mono block">
              {totals.totalFat}g
            </span>
          </div>

          <div className="p-2 rounded-xl bg-white border border-indigo-100 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-purple-600 block">Fibra</span>
            <span className="text-base font-black text-purple-800 font-mono block">
              {totals.totalFiber}g
            </span>
          </div>
        </div>

        {/* Buscador de Alimentos del Banco Canónico y Aprendidos */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Plus size={14} className="text-indigo-600" />
            <span>Agregar Ingrediente desde tu Banco de Alimentos</span>
          </label>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escribe el nombre del alimento (ej: Pollo, Avena, Arroz, Aguacate)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Resultados flotantes / inmediatos de búsqueda */}
          {availableFoods.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg p-1 space-y-1">
              {availableFoods.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddIngredient(f)}
                  className="w-full text-left p-2 rounded-lg hover:bg-indigo-50/70 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{getSmartFoodEmoji(f.name)}</span>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-900 block truncate">{f.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {f.brand} • Porción base: {f.servingSize} ({f.calories} kcal)
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md shrink-0 border border-indigo-200">
                    + Añadir
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Ingredientes en el Plato */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-800 block">
            Ingredientes en el Plato ({ingredients.length})
          </span>

          {ingredients.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
              <Utensils size={24} className="text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs text-slate-600 font-medium">Aún no has agregado ingredientes a este plato.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Usa el buscador arriba para sumar alimentos de tu banco canónico.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {ingredients.map((food, idx) => {
                const currentG = food.grams || parseGramsFromAmount(food.amount) || 100;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{food.emoji}</span>
                        <div className="truncate">
                          <span className="font-bold text-xs text-slate-900 truncate block">{food.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{food.amount}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {Math.round(food.calories)} kcal
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveIngredient(idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar ingrediente"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Ajustador de Gramos del Ingrediente */}
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1">
                        <Scale size={12} className="text-indigo-600" />
                        <span className="text-[10px] font-bold text-slate-600">Gramos:</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={currentG}
                          onChange={(e) => handleUpdateIngredientGrams(idx, Number(e.target.value) || 1)}
                          className="w-16 bg-white border border-slate-300 rounded-lg px-2 py-0.5 text-xs font-mono font-bold text-center text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                        <span className="text-[10px] font-bold text-slate-400">g</span>
                      </div>

                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <span className="text-emerald-700 font-bold">{roundTo(food.protein, 1)}g P</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sky-700 font-bold">{roundTo(food.carbs, 1)}g C</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-amber-700 font-bold">{roundTo(food.fat, 1)}g G</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Botones de acción doble: Ingerir Ahora vs Guardar Receta */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-200">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSaving} className="w-full sm:w-auto">
            Cancelar
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveAsRecipe}
              disabled={isSaving || ingredients.length === 0}
              icon={<BookOpen size={14} />}
              className="flex-1 sm:flex-none border-indigo-300 text-indigo-800 hover:bg-indigo-50"
            >
              Guardar en Recetario
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleLogAsMeal}
              disabled={isSaving || ingredients.length === 0}
              icon={<Utensils size={14} />}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
            >
              Ingerir como Comida Ahora
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
