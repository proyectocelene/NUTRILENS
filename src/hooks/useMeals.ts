import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Meal } from '../types/nutrition.types';

export function useMeals(dateFilter?: string) {
  const meals = useLiveQuery(
    async () => {
      if (dateFilter) {
        return await db.meals.where('date').equals(dateFilter).toArray();
      }
      return await db.meals.orderBy('createdAt').reverse().toArray();
    },
    [dateFilter]
  );

  return {
    meals: meals || [],
    isLoading: meals === undefined
  };
}

export function useAllMeals() {
  const meals = useLiveQuery(async () => {
    return await db.meals.orderBy('createdAt').reverse().toArray();
  }, []);

  return {
    meals: meals || [],
    isLoading: meals === undefined
  };
}
