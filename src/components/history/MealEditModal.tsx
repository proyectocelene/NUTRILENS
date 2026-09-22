import React, { useState, useEffect } from 'react';
import { Edit3, Plus, Trash2, Save, X, Utensils, Clock, Calendar, Scale } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Meal, FoodItem, MealType } from '../../types/nutrition.types';
import { dbService } from '../../db/dbService';
import { scaleFoodItem, parseGramsFromAmount, roundTo } from '../../services/portionScaler';

interface MealEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: Meal;
  onSaved?: (updatedMeal: Meal) => void;
}

export const MealEditModal: React.FC<MealEditModalProps> = ({
  isOpen,
  onClose,
  meal,
  onSaved
}) => {
  const [name, setName] = useState(meal.name);
  const [mealType, setMealType] = useState<MealType>(meal.mealType);
  const [date, setDate] = useState(meal.date);
  const [time, setTime] = useState(meal.time || '12:00');
  const [foods, setFoods] = useState<FoodItem[]>(meal.foods || []);
  const [notes, setNotes] = useState(meal.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(meal.name);
    setMealType(meal.mealType);
    setDate(meal.date);
    setTime(meal.time || '12:00');
    setFoods(meal.foods ? JSON.parse(JSON.stringify(meal.foods)) : []);
    setNotes(meal.notes || '');
  }, [meal, isOpen]);

  // Totales calculados en tiempo real
  const totalCalories = Math.round(foods.reduce((sum, f) => sum + (Number(f.calories) || 0), 0));
  const totalProtein = Math.round(foods.reduce((sum, f) => sum + (Number(f.protein) || 0), 0) * 10) / 10;
  const totalCarbs = Math.round(foods.reduce((sum, f) => sum + (Number(f.carbs) || 0), 0) * 10) / 10;
  const totalFat = Math.round(foods.reduce((sum, f) => sum + (Number(f.fat) || 0), 0) * 10) / 10;
  const totalFiber = Math.round(foods.reduce((sum, f) => sum + (Number(f.fiber) || 0), 0) * 10) / 10;

  const handleUpdateFood = (index: number, key: keyof FoodItem, value: any) => {
    const updated = [...foods];
    updated[index] = { ...updated[index], [key]: value };
    setFoods(updated);
  };

  const handleScaleFood = (index: number, targetGrams: number) => {
    const target = foods[index];
    if (!target) return;
    const scaled = scaleFoodItem(target, targetGrams);
    const updated = [...foods];
    updated[index] = scaled;
    setFoods(updated);
  };

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const handleAddFood = () => {
    setFoods([
      ...foods,
      {
        name: 'Nuevo ingrediente',
        amount: '1 porción (~100g)',
        calories: 100,
        protein: 5,
        carbs: 10,
        fat: 2,
        fiber: 1
      }
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      const updatedMeal: Meal = {
        ...meal,
        name: name.trim(),
        mealType,
        date,
        time,
        notes: notes.trim(),
        foods,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
        totalFiber,
        updatedAt: Date.now()
      };

      await dbService.updateMeal(updatedMeal);
      if (onSaved) onSaved(updatedMeal);
      onClose();
    } catch (err) {
      console.error('Error guardando comida editada:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Edit3 size={16} />
          </div>
          <span className="font-bold text-sm text-slate-900">Editar Comida Registrada</span>
        </div>
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Cabecera de la comida: Nombre y Momento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Comida</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Desayuno Proteico"
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Momento del Día</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="breakfast">🌅 Desayuno</option>
              <option value="lunch">☀️ Almuerzo / Comida</option>
              <option value="dinner">🌙 Cena</option>
              <option value="snack">🍎 Snack / Merienda</option>
              <option value="other">🍽️ Otro momento</option>
            </select>
          </div>
        </div>

        {/* Fecha y Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Calendar size={13} className="text-slate-400" /> Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1 mb-1">
              <Clock size={13} className="text-slate-400" /> Hora
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Barra de Totales Calculados en Vivo */}
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between flex-wrap gap-2">
          <div>
            <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
              Totales Recalculados
            </span>
            <span className="text-lg font-black text-emerald-950 font-mono">
              {totalCalories} <span className="text-xs font-normal text-slate-600">kcal</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold">
            <span className="px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800">
              {totalProtein}g P
            </span>
            <span className="px-2 py-1 rounded-lg bg-white border border-sky-200 text-sky-800">
              {totalCarbs}g C
            </span>
            <span className="px-2 py-1 rounded-lg bg-white border border-amber-200 text-amber-800">
              {totalFat}g G
            </span>
            <span className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-700">
              {totalFiber}g F
            </span>
          </div>
        </div>

        {/* Lista de Alimentos / Ingredientes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Utensils size={14} className="text-emerald-700" /> Ingredientes ({foods.length})
            </label>
            <button
              type="button"
              onClick={handleAddFood}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus size={13} /> Agregar Alimento
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
            {foods.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                No hay ingredientes en esta comida. Pulsa "+ Agregar Alimento".
              </p>
            ) : (
              foods.map((food, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={food.name}
                      onChange={(e) => handleUpdateFood(idx, 'name', e.target.value)}
                      placeholder="Nombre del alimento"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      value={food.amount || ''}
                      onChange={(e) => {
                        const newAmount = e.target.value;
                        handleUpdateFood(idx, 'amount', newAmount);
                        const parsedG = parseGramsFromAmount(newAmount);
                        if (parsedG && parsedG > 0) {
                          handleScaleFood(idx, parsedG);
                        }
                      }}
                      placeholder="Porción (ej: 100g)"
                      className="w-28 bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 font-mono"
                      title="Escribe la porción con gramos (ej: 70g) para auto-escalar macros proporcionalmente"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFood(idx)}
                      title="Eliminar este ingrediente"
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Acceso rápido a porciones comunes */}
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Scale size={11} className="text-emerald-700 shrink-0" />
                    <span>Ajuste rápido:</span>
                    {[50, 70, 100, 150, 200].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleScaleFood(idx, g)}
                        className="px-1.5 py-0.2 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 border border-slate-200 font-mono font-bold transition-colors"
                      >
                        {g}g
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block">Kcal</span>
                      <input
                        type="number"
                        value={food.calories || 0}
                        onChange={(e) => handleUpdateFood(idx, 'calories', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-slate-800 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-600 block">Prot (g)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={food.protein || 0}
                        onChange={(e) => handleUpdateFood(idx, 'protein', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-emerald-800 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-sky-600 block">Carb (g)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={food.carbs || 0}
                        onChange={(e) => handleUpdateFood(idx, 'carbs', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-sky-800 font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] text-amber-600 block">Grasa (g)</span>
                      <input
                        type="number"
                        step="0.1"
                        value={food.fat || 0}
                        onChange={(e) => handleUpdateFood(idx, 'fat', Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-xs text-amber-800 font-bold"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
