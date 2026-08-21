import { useMemo } from 'react';
import { Meal, NutritionGoals } from '../types/nutrition.types';
import { calculateDailySummary, analyzeNutrientGaps } from '../services/nutritionCalculator';
import { generateStatsOverview } from '../services/statsEngine';

export function useDailyStats(selectedDate: string, allMeals: Meal[], goals: NutritionGoals) {
  const dailySummary = useMemo(() => {
    return calculateDailySummary(selectedDate, allMeals, goals);
  }, [selectedDate, allMeals, goals]);

  const nutrientGaps = useMemo(() => {
    return analyzeNutrientGaps(dailySummary, goals);
  }, [dailySummary, goals]);

  return {
    dailySummary,
    nutrientGaps
  };
}

export function useTrendStats(allMeals: Meal[], goals: NutritionGoals, daysCount: number = 7) {
  const statsOverview = useMemo(() => {
    return generateStatsOverview(allMeals, goals, daysCount);
  }, [allMeals, goals, daysCount]);

  return statsOverview;
}
