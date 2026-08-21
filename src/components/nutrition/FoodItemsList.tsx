import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FoodItem } from '../../types/nutrition.types';
import { Badge } from '../common/Badge';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';

interface FoodItemsListProps {
  foods: FoodItem[];
  compact?: boolean;
}

export const FoodItemsList: React.FC<FoodItemsListProps> = ({ foods, compact = false }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-2">
      {foods.map((food, idx) => {
        const foodId = food.id || `item_${idx}`;
        const isExpanded = expandedId === foodId;
        const hasMicros = food.nutrients && Object.keys(food.nutrients).length > 0;
        const foodEmoji = food.emoji || getSmartFoodEmoji(food.name);

        return (
          <div
            key={foodId}
            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="text-base p-1.5 rounded-xl bg-white border border-slate-200 shrink-0 shadow-2xs">
                  {foodEmoji}
                </div>
                <div className="truncate">
                  <span className="font-bold text-slate-900 block truncate">{food.name}</span>
                  {food.amount && (
                    <span className="text-[11px] text-slate-500 font-mono">{food.amount}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right font-mono">
                  <span className="font-bold text-slate-900">{food.calories} kcal</span>
                  <div className="text-[11px] space-x-1.5 font-medium">
                    <span className="text-emerald-700 font-bold">{food.protein}g P</span>
                    <span className="text-sky-700 font-bold">{food.carbs}g C</span>
                    <span className="text-amber-700 font-bold">{food.fat}g G</span>
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
              </div>
            </div>

            {/* Micronutrientes detallados expandibles */}
            {isExpanded && hasMicros && food.nutrients && (
              <div className="mt-2.5 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
                {Object.entries(food.nutrients).map(([k, v]) => {
                  if (typeof v !== 'number' || v <= 0) return null;
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
