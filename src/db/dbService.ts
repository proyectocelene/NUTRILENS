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

  // Cargar datos de prueba
  async seedDemoMeals(): Promise<void> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const yest = new Date();
    yest.setDate(today.getDate() - 1);
    const yestStr = yest.toISOString().split('T')[0];

    const demoMeals: Meal[] = [
      {
        id: `demo_1_${Date.now()}`,
        name: "Comida 1: Desayuno Post-Entreno (Huevos, Claras y Avena)",
        mealType: "breakfast",
        date: todayStr,
        time: "08:30",
        totalCalories: 778,
        totalProtein: 52,
        totalCarbs: 81,
        totalFat: 29,
        totalFiber: 11,
        totalNutrients: {
          iron_mg: 7.3,
          magnesium_mg: 152,
          potassium_mg: 1140,
          vitamin_c_mg: 8.7,
          vitamin_d_iu: 164,
          vitamin_b12_mcg: 1.8,
          zinc_mg: 5.4,
          sodium_mg: 510
        },
        foods: [
          { name: "Huevos enteros grandes (4 u)", amount: "200g", calories: 288, protein: 24.8, carbs: 1.6, fat: 20 },
          { name: "Claras de huevo líquidas", amount: "135ml", calories: 70, protein: 15.0, carbs: 1.0, fat: 0.2 },
          { name: "Avena Integral en hojuelas", amount: "80g", calories: 304, protein: 10.8, carbs: 53.0, fat: 5.6, fiber: 8.5 },
          { name: "Plátano maduro", amount: "100g", calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6 }
        ],
        createdAt: Date.now() - 10000,
        updatedAt: Date.now() - 10000
      },
      {
        id: `demo_2_${Date.now()}`,
        name: "Comida 2: Almuerzo Principal (Pechuga, Arroz y Aguacate)",
        mealType: "lunch",
        date: todayStr,
        time: "14:00",
        totalCalories: 809,
        totalProtein: 63,
        totalCarbs: 100,
        totalFat: 18,
        totalFiber: 10,
        totalNutrients: {
          iron_mg: 4.0,
          magnesium_mg: 117,
          potassium_mg: 1435,
          calcium_mg: 115,
          vitamin_a_mcg: 650,
          vitamin_c_mg: 45,
          vitamin_b6_mg: 1.4,
          zinc_mg: 4.2,
          sodium_mg: 170
        },
        foods: [
          { name: "Pechuga de pollo (crudo)", amount: "240g", calories: 396, protein: 74, carbs: 0, fat: 8.6 },
          { name: "Arroz jazmín cocido", amount: "350g", calories: 455, protein: 9.5, carbs: 98, fat: 1.2, fiber: 1.8 },
          { name: "Ensalada verde mixta", amount: "200g", calories: 42, protein: 3.2, carbs: 6.8, fat: 0.5, fiber: 3.6 },
          { name: "Aguacate Hass", amount: "70g", calories: 112, protein: 1.4, carbs: 6.0, fat: 10.5, fiber: 4.8 }
        ],
        createdAt: Date.now() - 5000,
        updatedAt: Date.now() - 5000
      }
    ];

    for (const m of demoMeals) {
      await this.addMeal(m, true);
    }
  }
};
