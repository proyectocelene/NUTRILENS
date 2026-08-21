import React, { useState } from 'react';
import { Calendar, Clock, CheckCircle, Smile, Activity, Heart, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { Meal, MealType, SatietyLevel, DigestionFeeling, EnergyLevel } from '../../types/nutrition.types';
import { FoodItemsList } from '../nutrition/FoodItemsList';

interface PreviewMealCardProps {
  meal: Meal;
  onUpdateMealMeta: (updates: Partial<Meal>) => void;
}

const MEAL_TYPES: { id: MealType; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Desayuno', emoji: '🍳' },
  { id: 'lunch', label: 'Almuerzo', emoji: '🥗' },
  { id: 'dinner', label: 'Cena', emoji: '🐟' },
  { id: 'snack', label: 'Snack / Merienda', emoji: '🍎' },
  { id: 'other', label: 'Suplemento / Otro', emoji: '💊' }
];

const SATIETY_OPTIONS: { id: SatietyLevel; label: string; emoji: string }[] = [
  { id: 'light', label: 'Ligero', emoji: '🪶' },
  { id: 'satisfied', label: 'Saciado Óptimo', emoji: '😊' },
  { id: 'full', label: 'Lleno', emoji: '🫄' },
  { id: 'stuffed', label: 'Muy Pesado', emoji: '😮‍💨' }
];

const DIGESTION_OPTIONS: { id: DigestionFeeling; label: string; emoji: string }[] = [
  { id: 'great', label: 'Perfecta', emoji: '✨' },
  { id: 'normal', label: 'Normal', emoji: '👍' },
  { id: 'heavy', label: 'Pesadez', emoji: '⚠️' },
  { id: 'bloated', label: 'Inflamación/Gases', emoji: '💨' },
  { id: 'heartburn', label: 'Acidez/Reflujo', emoji: '🔥' }
];

const ENERGY_OPTIONS: { id: EnergyLevel; label: string; emoji: string }[] = [
  { id: 'energized', label: 'Alta / Listo para Entrenar', emoji: '⚡' },
  { id: 'normal', label: 'Normal / Estable', emoji: '👌' },
  { id: 'sleepy', label: 'Sueño post-comida', emoji: '🥱' },
  { id: 'tired', label: 'Fatiga / Pesado', emoji: '🔋' }
];

export const PreviewMealCard: React.FC<PreviewMealCardProps> = ({ meal, onUpdateMealMeta }) => {
  const microsCount = meal.totalNutrients ? Object.keys(meal.totalNutrients).length : 0;
  const [showBiofeedback, setShowBiofeedback] = useState(true);

  const biofeedback = meal.biofeedback || {};

  const handleUpdateBio = (key: string, value: any) => {
    onUpdateMealMeta({
      biofeedback: {
        ...biofeedback,
        [key]: value
      }
    });
  };

  return (
    <div className="space-y-4 rounded-2xl bg-slate-50 p-4 border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle size={16} className="text-emerald-700" />
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Vista Previa Verificada</span>
        </div>
        <span className="text-xs text-slate-500 font-mono">
          {meal.foods.length} alimento{meal.foods.length !== 1 ? 's' : ''} detectado{meal.foods.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Nombre y Tipo de Comida */}
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Plato o Suplemento</label>
          <input
            type="text"
            value={meal.name}
            onChange={(e) => onUpdateMealMeta({ name: e.target.value })}
            className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            placeholder="Ej: Bowl de Pollo y Quinoa"
          />
        </div>

        {/* Tipo de comida */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">Momento del Día</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            {MEAL_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onUpdateMealMeta({ mealType: t.id })}
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-medium transition-all ${
                  meal.mealType === t.id
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold shadow-xs'
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
              value={meal.date}
              onChange={(e) => onUpdateMealMeta({ date: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Clock size={12} /> Hora
            </label>
            <input
              type="time"
              value={meal.time || '12:00'}
              onChange={(e) => onUpdateMealMeta({ time: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Totales Nutricionales */}
      <div className="p-3 rounded-2xl bg-white border border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center shadow-xs">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block">Calorías</span>
          <span className="text-base font-extrabold text-amber-800">{meal.totalCalories}</span>
          <span className="text-[10px] text-slate-400 block">kcal</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block">Proteína</span>
          <span className="text-base font-extrabold text-emerald-800">{meal.totalProtein}g</span>
          <span className="text-[10px] text-slate-400 block">{Math.round((meal.totalProtein * 4 / Math.max(1, meal.totalCalories)) * 100)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block">Carbos</span>
          <span className="text-base font-extrabold text-sky-800">{meal.totalCarbs}g</span>
          <span className="text-[10px] text-slate-400 block">{Math.round((meal.totalCarbs * 4 / Math.max(1, meal.totalCalories)) * 100)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[10px] font-bold text-slate-500 block">Grasas</span>
          <span className="text-base font-extrabold text-amber-700">{meal.totalFat}g</span>
          <span className="text-[10px] text-slate-400 block">{Math.round((meal.totalFat * 9 / Math.max(1, meal.totalCalories)) * 100)}%</span>
        </div>
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-slate-500 block">Fibra / Micros</span>
          <span className="text-base font-extrabold text-purple-800">{meal.totalFiber}g</span>
          <span className="text-[10px] text-slate-400 block">{microsCount} micros</span>
        </div>
      </div>

      {/* SECCIÓN BIOFEEDBACK: Cómo me sentí con esta comida (+15 XP) */}
      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Heart size={15} className="text-rose-500" />
            <span>Biofeedback: ¿Cómo te sentiste con esta comida?</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-md border border-amber-200">+15 XP</span>
          </div>

          <button
            type="button"
            onClick={() => setShowBiofeedback(!showBiofeedback)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold"
          >
            {showBiofeedback ? 'Ocultar' : 'Añadir sensaciones'}
          </button>
        </div>

        {showBiofeedback && (
          <div className="space-y-2.5 pt-1">
            {/* 1. Nivel de Saciedad */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Saciedad Post-Comida:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {SATIETY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleUpdateBio('satiety', opt.id)}
                    className={`py-1.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border ${
                      biofeedback.satiety === opt.id
                        ? 'bg-emerald-100 text-emerald-950 font-bold border-emerald-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Digestión */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Sensación Digestiva:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {DIGESTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleUpdateBio('digestion', opt.id)}
                    className={`py-1 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border ${
                      biofeedback.digestion === opt.id
                        ? 'bg-teal-100 text-teal-950 font-bold border-teal-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Nivel de Energía */}
            <div>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                Nivel de Energía:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ENERGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleUpdateBio('energy', opt.id)}
                    className={`py-1 px-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all border ${
                      biofeedback.energy === opt.id
                        ? 'bg-amber-100 text-amber-950 font-bold border-amber-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Notas opcionales de sensaciones */}
            <div>
              <input
                type="text"
                value={biofeedback.feelingNotes || ''}
                onChange={(e) => handleUpdateBio('feelingNotes', e.target.value)}
                placeholder="Notas libres (ej: 'Mucha fuerza para el entreno', 'Demasiada sal', etc.)..."
                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de alimentos individualizados */}
      <div>
        <span className="text-xs font-bold text-slate-800 block mb-2">Desglose de Alimentos & Suplementos</span>
        <FoodItemsList foods={meal.foods} />
      </div>
    </div>
  );
};
