import Dexie, { Table } from 'dexie';
import { Meal, NutritionGoals, CanonicalFood } from '../types/nutrition.types';
import { DbRecipe, DbDailyLog } from '../types/db.types';
import { DEFAULT_NUTRITION_GOALS, DEFAULT_CANONICAL_FOODS } from './seedData';
import { getLocalDateString, isValidDateFormat } from '../utils/dateUtils';

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

export const CURRENT_PLAN_VERSION = 'adonis_1950_v1';
const CANONICAL_SEED_VERSION = 'canonical_v2_fast';

let isInitializing = false;

// Inicializar configuración inicial, metas del plan y banco canónico de forma ultra rápida
export async function initializeDatabase(): Promise<void> {
  if (isInitializing) return;
  isInitializing = true;

  try {
    // 1. Inicializar o Migrar Metas al Protocolo Adonis Oficial si están desactualizadas
    const existingGoals = await db.goals.get('user_default_goals');
    const hasOldPlan = !existingGoals || 
      (existingGoals as any).planVersion !== CURRENT_PLAN_VERSION || 
      existingGoals.calories !== DEFAULT_NUTRITION_GOALS.calories;

    if (hasOldPlan) {
      await db.goals.put({
        ...DEFAULT_NUTRITION_GOALS,
        id: 'user_default_goals',
        planVersion: CURRENT_PLAN_VERSION
      } as any);
    }

    // 2. Inicializar banco canónico en un solo lote atómico (solo si no se ha sembrado esta versión)
    const lastSeed = localStorage.getItem('nutrilens_canonical_seed_ver');
    if (lastSeed !== CANONICAL_SEED_VERSION) {
      await db.transaction('rw', db.canonicalFoods, async () => {
        const existingList = await db.canonicalFoods.toArray();
        const existingMap = new Map(existingList.map(f => [f.id, f]));
        const foodsToPut: CanonicalFood[] = [];

        for (const food of DEFAULT_CANONICAL_FOODS) {
          const existing = existingMap.get(food.id);
          if (!existing) {
            foodsToPut.push(food);
          } else if (food.nutrients && Object.keys(food.nutrients).length > 0) {
            const mergedNutrients: any = { ...food.nutrients, ...(existing.nutrients || {}) };
            for (const [k, v] of Object.entries(food.nutrients)) {
              if (existing.nutrients?.[k as keyof typeof existing.nutrients] === undefined || existing.nutrients?.[k as keyof typeof existing.nutrients] === 0) {
                mergedNutrients[k] = v;
              }
            }
            foodsToPut.push({
              ...existing,
              nutrients: mergedNutrients
            });
          }
        }

        if (foodsToPut.length > 0) {
          await db.canonicalFoods.bulkPut(foodsToPut);
        }
      });

      localStorage.setItem('nutrilens_canonical_seed_ver', CANONICAL_SEED_VERSION);
    }

    // Reparar automáticamente comidas con fecha "YYYY-MM-DD" o inválidas guardadas previamente
    try {
      const orphanedMeals = await db.meals.filter(m => !isValidDateFormat(m.date)).toArray();
      if (orphanedMeals.length > 0) {
        console.log(`[DB] Reparando ${orphanedMeals.length} comidas con fecha no válida...`);
        for (const meal of orphanedMeals) {
          const fixedDate = meal.createdAt ? getLocalDateString(new Date(meal.createdAt)) : getLocalDateString();
          if (meal.id) {
            await db.meals.update(meal.id, { date: fixedDate });
          }
        }
      }
    } catch (e) {
      console.warn('[DB] Error verificando comidas huérfanas:', e);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    isInitializing = false;
  }
}
