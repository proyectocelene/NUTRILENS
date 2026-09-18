import { db } from './index';
import { Meal, NutritionGoals, CanonicalFood } from '../types/nutrition.types';
import { DbRecipe, DbDailyLog, LearnedFood } from '../types/db.types';
import { 
  syncMealToFirestore, 
  deleteMealFromFirestore, 
  syncRecipeToFirestore, 
  deleteRecipeFromFirestore, 
  syncGoalsToFirestore,
  syncDailyLogToFirestore,
  syncCanonicalFoodToFirestore,
  deleteCanonicalFoodFromFirestore
} from '../services/firebaseService';
import { SAMPLE_JSON_TEMPLATES } from './seedData';
import { getLocalDateString } from '../utils/dateUtils';

export const dbService = {
  // Comidas con Auto-extracción al Banco de Recetas y Sincronización en la Nube
  async addMeal(meal: Meal, autoAddToRecipes: boolean = true): Promise<string> {
    const id = meal.id || `meal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newMeal: Meal = { ...meal, id, createdAt: Date.now(), updatedAt: Date.now() };
    await db.meals.put(newMeal);

    // Sincronizar silenciosamente con Firestore
    syncMealToFirestore(newMeal).catch(() => {});

    // Auto-construcción del Banco de Recetas
    if (autoAddToRecipes && meal.foods && meal.foods.length > 0) {
      try {
        const existingRecipes = await db.recipes.where('name').equals(meal.name).toArray();
        const recipeId = existingRecipes.length > 0 ? existingRecipes[0].id : `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        const newRecipe: DbRecipe = {
          id: recipeId,
          name: meal.name,
          category: meal.mealType,
          servings: 1,
          foods: meal.foods,
          totalCalories: meal.totalCalories,
          totalProtein: meal.totalProtein,
          totalCarbs: meal.totalCarbs,
          totalFat: meal.totalFat,
          totalFiber: meal.totalFiber,
          totalNutrients: meal.totalNutrients,
          createdAt: existingRecipes.length > 0 ? existingRecipes[0].createdAt : Date.now()
        };

        await db.recipes.put(newRecipe);
        syncRecipeToFirestore(newRecipe).catch(() => {});
      } catch (err) {
        console.warn('Auto recipe extraction warning:', err);
      }
    }

    return id;
  },

  async updateMeal(meal: Meal): Promise<void> {
    const updated = { ...meal, updatedAt: Date.now() };
    await db.meals.put(updated);
    syncMealToFirestore(updated).catch(() => {});
  },

  async deleteMeal(id: string): Promise<void> {
    await db.meals.delete(id);
    deleteMealFromFirestore(id).catch(() => {});
  },

  async getMealsByDate(date: string): Promise<Meal[]> {
    return await db.meals.where('date').equals(date).toArray();
  },

  async getAllMeals(): Promise<Meal[]> {
    return await db.meals.orderBy('createdAt').reverse().toArray();
  },

  // Recetas
  async saveRecipe(recipe: DbRecipe): Promise<string> {
    const id = recipe.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newRecipe = { ...recipe, id, createdAt: recipe.createdAt || Date.now() };
    await db.recipes.put(newRecipe);
    syncRecipeToFirestore(newRecipe).catch(() => {});
    return id;
  },

  async deleteRecipe(id: string): Promise<void> {
    await db.recipes.delete(id);
    deleteRecipeFromFirestore(id).catch(() => {});
  },

  async getAllRecipes(): Promise<DbRecipe[]> {
    return await db.recipes.orderBy('createdAt').reverse().toArray();
  },

  // Alimentos y Etiquetas Canónicas
  async saveCanonicalFood(food: CanonicalFood): Promise<string> {
    const id = food.id || `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newFood: CanonicalFood = { ...food, id, createdAt: food.createdAt || Date.now(), updatedAt: Date.now() };
    await db.canonicalFoods.put(newFood);
    syncCanonicalFoodToFirestore(newFood).catch(() => {});
    return id;
  },

  async deleteCanonicalFood(id: string): Promise<void> {
    await db.canonicalFoods.delete(id);
    deleteCanonicalFoodFromFirestore(id).catch(() => {});
  },

  async getAllCanonicalFoods(): Promise<CanonicalFood[]> {
    return await db.canonicalFoods.orderBy('createdAt').reverse().toArray();
  },

  async getCanonicalFoodById(id: string): Promise<CanonicalFood | undefined> {
    return await db.canonicalFoods.get(id);
  },

  // Alimentos Aprendidos de Comidas (Banco No Canónico / Histórico)
  async getLearnedFoods(): Promise<LearnedFood[]> {
    const meals = await db.meals.toArray();
    const canonicalList = await db.canonicalFoods.toArray();
    const canonicalNames = new Set(canonicalList.map(c => c.name.trim().toLowerCase()));

    const map = new Map<string, {
      name: string;
      count: number;
      totalCalories: number;
      totalProtein: number;
      totalCarbs: number;
      totalFat: number;
      totalFiber: number;
      lastDate: string;
      sampleAmount: string;
      sampleMealName: string;
      nutrients?: any;
    }>();

    for (const meal of meals) {
      if (!meal.foods) continue;
      for (const food of meal.foods) {
        if (!food.name || !food.name.trim()) continue;
        const key = food.name.trim().toLowerCase();
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
          existing.totalCalories += Number(food.calories) || 0;
          existing.totalProtein += Number(food.protein) || 0;
          existing.totalCarbs += Number(food.carbs) || 0;
          existing.totalFat += Number(food.fat) || 0;
          existing.totalFiber += Number(food.fiber) || 0;
          if (meal.date >= existing.lastDate) {
            existing.lastDate = meal.date;
            existing.sampleAmount = food.amount || existing.sampleAmount;
            existing.sampleMealName = meal.name;
          }
        } else {
          map.set(key, {
            name: food.name.trim(),
            count: 1,
            totalCalories: Number(food.calories) || 0,
            totalProtein: Number(food.protein) || 0,
            totalCarbs: Number(food.carbs) || 0,
            totalFat: Number(food.fat) || 0,
            totalFiber: Number(food.fiber) || 0,
            lastDate: meal.date,
            sampleAmount: food.amount || '1 porción (~100g)',
            sampleMealName: meal.name,
            nutrients: food.nutrients
          });
        }
      }
    }

    return Array.from(map.values()).map(item => ({
      id: `learned_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      name: item.name,
      count: item.count,
      lastUsedDate: item.lastDate,
      avgCalories: Math.round(item.totalCalories / item.count),
      avgProtein: Math.round((item.totalProtein / item.count) * 10) / 10,
      avgCarbs: Math.round((item.totalCarbs / item.count) * 10) / 10,
      avgFat: Math.round((item.totalFat / item.count) * 10) / 10,
      avgFiber: Math.round((item.totalFiber / item.count) * 10) / 10,
      sampleAmount: item.sampleAmount,
      sampleMealName: item.sampleMealName,
      nutrients: item.nutrients,
      isAlreadyCanonical: canonicalNames.has(item.name.toLowerCase())
    })).sort((a, b) => b.count - a.count);
  },

  // Metas
  async getGoals(): Promise<NutritionGoals | undefined> {
    return await db.goals.get('user_default_goals');
  },

  async updateGoals(goals: NutritionGoals): Promise<void> {
    const updated = { ...goals, id: 'user_default_goals' };
    await db.goals.put(updated);
    syncGoalsToFirestore(updated).catch(() => {});
  },

  // Logs diarios (Agua, Peso, etc.)
  async getDailyLog(date: string): Promise<DbDailyLog | undefined> {
    const logs = await db.dailyLogs.where('date').equals(date).toArray();
    return logs[0];
  },

  async updateDailyLog(log: DbDailyLog): Promise<void> {
    const id = log.id || `log_${log.date}`;
    const updated = { ...log, id };
    await db.dailyLogs.put(updated);
    syncDailyLogToFirestore(updated).catch(() => {});
  },

  // Cargar datos de prueba del Protocolo Adonis
  async seedDemoMeals(): Promise<void> {
    const todayStr = getLocalDateString();

    for (let i = 0; i < SAMPLE_JSON_TEMPLATES.length; i++) {
      const tmpl = SAMPLE_JSON_TEMPLATES[i];
      try {
        const parsed: Meal = JSON.parse(tmpl.json);
        parsed.id = `adonis_meal_${i + 1}_${Date.now()}`;
        parsed.date = todayStr;
        parsed.createdAt = Date.now() - (SAMPLE_JSON_TEMPLATES.length - i) * 60000;
        parsed.updatedAt = Date.now();
        await this.addMeal(parsed, true);
      } catch (err) {
        console.error('Error cargando comida del plan:', err);
      }
    }
  }
};
