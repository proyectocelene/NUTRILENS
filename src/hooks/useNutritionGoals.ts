import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { DEFAULT_NUTRITION_GOALS } from '../db/seedData';
import { NutritionGoals } from '../types/nutrition.types';
import { dbService } from '../db/dbService';

export function useNutritionGoals() {
  const goals = useLiveQuery(async () => {
    const res = await db.goals.get('user_default_goals');
    return res || DEFAULT_NUTRITION_GOALS;
  }, []);

  const updateGoals = async (newGoals: Partial<NutritionGoals>) => {
    const current = goals || DEFAULT_NUTRITION_GOALS;
    const merged: NutritionGoals = {
      ...current,
      ...newGoals,
      microGoals: {
        ...current.microGoals,
        ...(newGoals.microGoals || {})
      }
    };
    await dbService.updateGoals(merged);
  };

  return {
    goals: goals || DEFAULT_NUTRITION_GOALS,
    isLoading: goals === undefined,
    updateGoals
  };
}
