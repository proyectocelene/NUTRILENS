import Dexie, { Table } from 'dexie';
import { Meal, NutritionGoals, CanonicalFood } from '../types/nutrition.types';
import { DbRecipe, DbDailyLog } from '../types/db.types';
import { DEFAULT_NUTRITION_GOALS, DEFAULT_CANONICAL_FOODS } from './seedData';

export class NutriLensDatabase extends Dexie {
  meals!: Table<Meal, string>;
  recipes!: Table<DbRecipe, string>;
  goals!: Table<NutritionGoals, string>;
  dailyLogs!: Table<DbDailyLog, string>;
  canonicalFoods!: Table<CanonicalFood, string>;

  constructor() {
    super('NutriLensDB');
    this.version(1).stores({
      meals: 'id, date, mealType, name, createdAt, isRecipe',
      recipes: 'id, name, category, createdAt',
      goals: 'id',
      dailyLogs: 'id, date'
    });

    this.version(2).stores({
      meals: 'id, date, mealType, name, createdAt, isRecipe',
      recipes: 'id, name, category, createdAt',
      goals: 'id',
      dailyLogs: 'id, date',
      canonicalFoods: 'id, name, brand, category, createdAt'
    });
  }
}

export const db = new NutriLensDatabase();

// Inicializar configuración inicial, metas del plan y banco canónico
export async function initializeDatabase(): Promise<void> {
  try {
    const existingGoals = await db.goals.get('user_default_goals');
    if (!existingGoals) {
      await db.goals.put(DEFAULT_NUTRITION_GOALS);
    } else {
      await db.goals.put({
        ...DEFAULT_NUTRITION_GOALS,
        ...existingGoals,
        calories: existingGoals.calories || DEFAULT_NUTRITION_GOALS.calories,
        protein: existingGoals.protein || DEFAULT_NUTRITION_GOALS.protein,
        carbs: existingGoals.carbs || DEFAULT_NUTRITION_GOALS.carbs,
        fat: existingGoals.fat || DEFAULT_NUTRITION_GOALS.fat,
        waterLiters: DEFAULT_NUTRITION_GOALS.waterLiters,
        profile: DEFAULT_NUTRITION_GOALS.profile,
        microGoals: {
          ...DEFAULT_NUTRITION_GOALS.microGoals,
          ...(existingGoals.microGoals || {})
        }
      });
    }

    // Inicializar alimentos canónicos si está vacío
    const count = await db.canonicalFoods.count();
    if (count === 0 && DEFAULT_CANONICAL_FOODS.length > 0) {
      await db.canonicalFoods.bulkPut(DEFAULT_CANONICAL_FOODS);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
