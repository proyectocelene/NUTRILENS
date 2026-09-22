import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ArrowUpDown, Flame, Dumbbell, Wheat, Droplets, AlertTriangle, Scale, Trash2, Minus, Plus, Check } from 'lucide-react';
import { FoodItem } from '../../types/nutrition.types';
import { Badge } from '../common/Badge';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';
import { roundTo, parseGramsFromAmount, scaleFoodItem, scaleFoodByMultiplier } from '../../services/portionScaler';

interface FoodItemsListProps {
  foods: FoodItem[];
  compact?: boolean;
  isEditable?: boolean;
  onUpdateFood?: (index: number, updatedFood: FoodItem) => void;
  onRemoveFood?: (index: number) => void;
}

type SortMacro = 'default' | 'calories' | 'protein' | 'carbs' | 'fat';

export const FoodItemsList: React.FC<FoodItemsListProps> = ({
  foods,
  compact = false,
  isEditable = false,
  onUpdateFood,
  onRemoveFood
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortMacro>('default');
  const [adjustingIdx, setAdjustingIdx] = useState<number | null>(null);
  const [tempGrams, setTempGrams] = useState<string>('');

  const totals = useMemo(() => {
    const raw = foods.reduce(
      (acc, f) => {
        acc.cal += Number(f.calories) || 0;
        acc.p += Number(f.protein) || 0;
        acc.c += Number(f.carbs) || 0;
        acc.f += Number(f.fat) || 0;
        return acc;
      },
      { cal: 0, p: 0, c: 0, f: 0 }
    );
    return {
      cal: Math.round(raw.cal),
      p: roundTo(raw.p, 1),
      c: roundTo(raw.c, 1),
      f: roundTo(raw.f, 1)
    };
  }, [foods]);

  const sortedFoods = useMemo(() => {
    if (sortBy === 'default' || foods.length <= 1) return foods;
    const copy = [...foods];
    return copy.sort((a, b) => {
      if (sortBy === 'calories') return (b.calories || 0) - (a.calories || 0);
      if (sortBy === 'protein') return (b.protein || 0) - (a.protein || 0);
      if (sortBy === 'carbs') return (b.carbs || 0) - (a.carbs || 0);
      if (sortBy === 'fat') return (b.fat || 0) - (a.fat || 0);
      return 0;
    });
  }, [foods, sortBy]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-2.5">
      {/* Barra de Filtros / Ordenamiento por Macronutrientes (visible si hay más de 1 ingrediente) */}
      {!compact && foods.length > 1 && (
        <div className="flex items-center justify-between gap-1.5 flex-wrap pb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpDown size={11} /> Ordenar por aporte:
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setSortBy('default')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                sortBy === 'default'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setSortBy('carbs')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortBy === 'carbs'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200'
              }`}
            >
              <Wheat size={10} /> +Carbos
            </button>
            <button
              type="button"
              onClick={() => setSortBy('fat')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortBy === 'fat'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              <Droplets size={10} /> +Grasa
            </button>
            <button
              type="button"
              onClick={() => setSortBy('protein')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortBy === 'protein'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              <Dumbbell size={10} /> +Proteína
            </button>
            <button
              type="button"
              onClick={() => setSortBy('calories')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                sortBy === 'calories'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <Flame size={10} /> +Calorías
            </button>
          </div>
        </div>
      )}

      {/* Lista de Alimentos con Medidores Porcentuales */}
      {sortedFoods.map((food, idx) => {
        const foodId = food.id || `item_${idx}`;
        const isExpanded = expandedId === foodId;
        const hasMicros = food.nutrients && Object.keys(food.nutrients).length > 0;
        const foodEmoji = food.emoji || getSmartFoodEmoji(food.name);

        // Porcentajes de contribución al plato
        const carbPct = totals.c > 0 ? Math.round(((food.carbs || 0) / totals.c) * 100) : 0;
        const fatPct = totals.f > 0 ? Math.round(((food.fat || 0) / totals.f) * 100) : 0;
        const protPct = totals.p > 0 ? Math.round(((food.protein || 0) / totals.p) * 100) : 0;
        const calPct = totals.cal > 0 ? Math.round(((food.calories || 0) / totals.cal) * 100) : 0;

        // Alertas específicas en el ingrediente
        const itemSodium = food.nutrients?.sodium_mg || 0;
        const itemTrans = food.nutrients?.trans_fat_g || 0;
        const itemSugar = food.nutrients?.sugar_g || 0;

        return (
          <div
            key={foodId}
            className={`p-3 rounded-2xl bg-slate-50 border transition-all text-xs ${
              sortBy !== 'default' ? 'hover:bg-white hover:shadow-xs' : ''
            } ${
              sortBy === 'carbs' && carbPct >= 40
                ? 'border-sky-300 bg-sky-50/40'
                : sortBy === 'fat' && fatPct >= 40
                ? 'border-amber-300 bg-amber-50/40'
                : sortBy === 'protein' && protPct >= 40
                ? 'border-emerald-300 bg-emerald-50/40'
                : 'border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="text-base p-1.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                  {foodEmoji}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 truncate">{food.name}</span>
                    {itemTrans > 0 && (
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-extrabold px-1 rounded flex items-center gap-0.5">
                        <AlertTriangle size={8} /> Trans
                      </span>
                    )}
                  </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {food.amount && (
                        <span className="text-[11px] text-slate-500 font-mono font-medium">{food.amount}</span>
                      )}
                      {isEditable && onUpdateFood && (
                        <button
                          type="button"
                          onClick={() => {
                            if (adjustingIdx === idx) {
                              setAdjustingIdx(null);
                            } else {
                              const g = food.grams || parseGramsFromAmount(food.amount) || 100;
                              setTempGrams(String(roundTo(g, 1)));
                              setAdjustingIdx(idx);
                            }
                          }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                            adjustingIdx === idx
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                          title="Ajustar porción / gramos proporcionalmente"
                        >
                          <Scale size={11} />
                          <span>{adjustingIdx === idx ? 'Cerrar' : 'Ajustar Porción'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right font-mono">
                    <span className={`font-bold block ${sortBy === 'calories' ? 'text-rose-700 underline font-black' : 'text-slate-900'}`}>
                      {Math.round(food.calories || 0)} kcal
                    </span>
                    <div className="text-[11px] space-x-1.5 font-medium">
                      <span className={`${sortBy === 'protein' ? 'text-emerald-900 bg-emerald-100 px-1 py-0.2 rounded font-black' : 'text-emerald-700 font-bold'}`}>
                        {roundTo(food.protein || 0, 1)}g P
                      </span>
                      <span className={`${sortBy === 'carbs' ? 'text-sky-900 bg-sky-100 px-1 py-0.2 rounded font-black' : 'text-sky-700 font-bold'}`}>
                        {roundTo(food.carbs || 0, 1)}g C
                      </span>
                      <span className={`${sortBy === 'fat' ? 'text-amber-900 bg-amber-100 px-1 py-0.2 rounded font-black' : 'text-amber-700 font-bold'}`}>
                        {roundTo(food.fat || 0, 1)}g G
                      </span>
                    </div>
                  </div>

                  {hasMicros && !compact && (
                    <button
                      onClick={() => toggleExpand(foodId)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                      aria-label="Ver micronutrientes"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  )}

                  {isEditable && onRemoveFood && (
                    <button
                      type="button"
                      onClick={() => onRemoveFood(idx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                      title="Eliminar ingrediente"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Panel de Ajuste Rápido e Inteligente de Porción */}
              {isEditable && onUpdateFood && adjustingIdx === idx && (
                <div className="mt-2.5 p-3 rounded-xl bg-white border border-emerald-300 shadow-xs space-y-2 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1">
                      <Scale size={13} className="text-emerald-700" />
                      <span>Ajustar Gramos / Proporción de "{food.name}":</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Base previa: ~{roundTo(food.grams || parseGramsFromAmount(food.amount) || 100, 1)}g
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(tempGrams) || 100;
                          const next = Math.max(5, curr - 10);
                          setTempGrams(String(next));
                          const scaled = scaleFoodItem(food, next);
                          onUpdateFood(idx, scaled);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        title="-10g"
                      >
                        <Minus size={12} />
                      </button>

                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={tempGrams}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTempGrams(val);
                            const num = parseFloat(val);
                            if (!isNaN(num) && num > 0) {
                              const scaled = scaleFoodItem(food, num);
                              onUpdateFood(idx, scaled);
                            }
                          }}
                          className="w-20 px-2 py-1 text-xs font-mono font-bold text-center bg-emerald-50/50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Gramos"
                        />
                        <span className="absolute right-2 top-1.5 text-[10px] font-bold text-slate-400 pointer-events-none">g</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const curr = parseFloat(tempGrams) || 100;
                          const next = curr + 10;
                          setTempGrams(String(next));
                          const scaled = scaleFoodItem(food, next);
                          onUpdateFood(idx, scaled);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                        title="+10g"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Chips de porciones comunes rápidas */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {[30, 50, 70, 100, 120, 150, 200].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setTempGrams(String(g));
                            const scaled = scaleFoodItem(food, g);
                            onUpdateFood(idx, scaled);
                          }}
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                            tempGrams === String(g)
                              ? 'bg-emerald-700 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200'
                          }`}
                        >
                          {g}g
                        </button>
                      ))}
                    </div>

                    {/* Multiplicadores rápidos */}
                    <div className="flex items-center gap-1 border-l border-slate-200 pl-1.5">
                      {[
                        { label: '½x', mult: 0.5 },
                        { label: '0.7x', mult: 0.7 },
                        { label: '1.5x', mult: 1.5 },
                        { label: '2x', mult: 2.0 }
                      ].map((m) => (
                        <button
                          key={m.label}
                          type="button"
                          onClick={() => {
                            const scaled = scaleFoodByMultiplier(food, m.mult);
                            const newG = scaled.grams || parseGramsFromAmount(scaled.amount) || 100;
                            setTempGrams(String(roundTo(newG, 1)));
                            onUpdateFood(idx, scaled);
                          }}
                          className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200"
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span>Resultado: <strong className="text-slate-800">{Math.round(food.calories || 0)} kcal</strong> | {roundTo(food.protein || 0, 1)}g P | {roundTo(food.carbs || 0, 1)}g C | {roundTo(food.fat || 0, 1)}g G</span>
                    <button
                      type="button"
                      onClick={() => setAdjustingIdx(null)}
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
                    >
                      <Check size={11} /> Listo
                    </button>
                  </div>
                </div>
              )}

              {/* Barra de Contribución al Macro Seleccionado */}
              {sortBy !== 'default' && (
                <div className="mt-2 pt-2 border-t border-slate-200/60">
                  {sortBy === 'carbs' && (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-sky-800 mb-0.5">
                        <span>🍞 Aporte de Carbohidratos</span>
                        <span>{carbPct}% ({roundTo(food.carbs || 0, 1)}g de {totals.c}g)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, carbPct)}%` }} />
                      </div>
                    </div>
                  )}
                  {sortBy === 'fat' && (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-amber-800 mb-0.5">
                        <span>🥑 Aporte de Grasas</span>
                        <span>{fatPct}% ({roundTo(food.fat || 0, 1)}g de {totals.f}g)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, fatPct)}%` }} />
                      </div>
                    </div>
                  )}
                  {sortBy === 'protein' && (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-emerald-800 mb-0.5">
                        <span>💪 Aporte de Proteína</span>
                        <span>{protPct}% ({roundTo(food.protein || 0, 1)}g de {totals.p}g)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, protPct)}%` }} />
                      </div>
                    </div>
                  )}
                  {sortBy === 'calories' && (
                    <div>
                      <div className="flex justify-between text-[10px] font-bold text-rose-800 mb-0.5">
                        <span>🔥 Aporte Calórico</span>
                        <span>{calPct}% ({Math.round(food.calories || 0)} de {totals.cal} kcal)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, calPct)}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Micronutrientes detallados expandibles */}
            {isExpanded && hasMicros && food.nutrients && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                {itemSodium > 0 && (
                  <Badge variant={itemSodium >= 1200 ? "amber" : "blue"} size="sm">
                    🧂 Sodio: {Math.round(itemSodium)}mg
                  </Badge>
                )}
                {itemSugar >= 10 && (
                  <Badge variant="amber" size="sm">
                    ⚠️ Azúcar: {itemSugar}g
                  </Badge>
                )}
                {Object.entries(food.nutrients).map(([k, v]) => {
                  if (typeof v !== 'number' || v <= 0) return null;
                  if (['sodium_mg', 'sugar_g'].includes(k) && (v as number) >= (k === 'sodium_mg' ? 0 : 10)) return null;
                  const label = k.replace(/_/g, ' ');
                  return (
                    <Badge key={k} variant="slate" size="sm">
                      <span className="text-slate-500 capitalize">{label}:</span> {v}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
