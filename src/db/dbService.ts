import { db } from './index';
import { Meal, NutritionGoals, CanonicalFood } from '../types/nutrition.types';
import { DbRecipe, DbDailyLog } from '../types/db.types';
import { 
  syncMealToFirestore, 
  deleteMealFromFirestore, 
  syncRecipeToFirestore, 
  deleteRecipeFromFirestore, 
  syncGoalsToFirestore 
} from '../services/firebaseService';
import { SAMPLE_JSON_TEMPLATES } from './seedData';

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
    return id;
  },

  async deleteCanonicalFood(id: string): Promise<void> {
    await db.canonicalFoods.delete(id);
  },

  async getAllCanonicalFoods(): Promise<CanonicalFood[]> {
    return await db.canonicalFoods.orderBy('createdAt').reverse().toArray();
  },

  async getCanonicalFoodById(id: string): Promise<CanonicalFood | undefined> {
    return await db.canonicalFoods.get(id);
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
    await db.dailyLogs.put({ ...log, id });
  },

  // Cargar datos de prueba del Protocolo Adonis
  async seedDemoMeals(): Promise<void> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

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
