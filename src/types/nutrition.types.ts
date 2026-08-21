export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';

export interface Micronutrients {
  // Vitaminas
  vitamin_a_mcg?: number;
  vitamin_c_mg?: number;
  vitamin_d_iu?: number;
  vitamin_e_mg?: number;
  vitamin_k_mcg?: number;
  vitamin_b1_mg?: number;
  vitamin_b2_mg?: number;
  vitamin_b3_mg?: number;
  vitamin_b6_mg?: number;
  vitamin_b12_mcg?: number;
  folate_mcg?: number;
  
  // Minerales
  calcium_mg?: number;
  iron_mg?: number;
  magnesium_mg?: number;
  phosphorus_mg?: number;
  potassium_mg?: number;
  sodium_mg?: number;
  zinc_mg?: number;
  selenium_mcg?: number;
  iodine_mcg?: number;
  
  // Perfil Lipídico Completo y Otros
  cholesterol_mg?: number;
  sugar_g?: number;
  saturated_fat_g?: number;
  monounsaturated_fat_g?: number;
  polyunsaturated_fat_g?: number;
  trans_fat_g?: number;
  omega3_g?: number;
  choline_mg?: number;
}

export interface CanonicalFood {
  id: string;
  name: string;
  brand?: string;
  servingSize: string; // ej: "2 rebanadas (60g)", "1 vaso (240ml)", "100g"
  servingGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  nutrients: Micronutrients;
  barcode?: string;
  category?: 'protein' | 'dairy' | 'grains' | 'fats' | 'fruits_veggies' | 'supplements' | 'beverages' | 'other';
  notes?: string;
  sourceType: 'label_scan' | 'manual' | 'json';
  createdAt: number;
  updatedAt: number;
}

export interface FoodItem {
  id?: string;
  name: string;
  emoji?: string; // Emoji específico del ingrediente (ej: 🍞, 🥚, 🦃, 🧀, 🥛)
  amount?: string;
  calories: number;
  protein: number; // en gramos
  carbs: number;   // en gramos
  fat: number;     // en gramos
  fiber?: number;  // en gramos
  nutrients?: Micronutrients;
  category?: string;
  notes?: string;
}

export type SatietyLevel = 'light' | 'satisfied' | 'full' | 'stuffed';
export type DigestionFeeling = 'great' | 'normal' | 'heavy' | 'bloated' | 'heartburn';
export type EnergyLevel = 'energized' | 'normal' | 'sleepy' | 'tired';

export interface MealBiofeedback {
  satiety?: SatietyLevel;
  digestion?: DigestionFeeling;
  energy?: EnergyLevel;
  feelingNotes?: string;
}

export interface Meal {
  id?: string;
  name: string;
  emoji?: string; // Emoji representativo del plato (ej: 🥪, 🍳, 🥤, 🥗, 🥩)
  mealType: MealType;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  foods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalNutrients: Micronutrients;
  biofeedback?: MealBiofeedback;
  notes?: string;
  sourceJson?: string;
  originalPrompt?: string;   // Descripción original escrita/dictada por el usuario
  aiModelUsed?: string;      // Modelo Gemini que procesó la comida
  aiFeedback?: string;       // Consejo o análisis bioquímico devuelto por la IA
  isRecipe?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfileMeta {
  age: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  bmrKcal: number;
  bodyFatPct: number;
  visceralFatLevel: number;
  targetWaistInches: number;
  currentWaistInches: number;
  targetWaterLiters: number;
  creatineDailyGrams: number;
}

export interface NutritionGoals {
  id?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  waterLiters: number;
  profile?: UserProfileMeta;
  // Metas recomendadas diarias de micronutrientes para deportista / recomposición
  microGoals: {
    vitamin_a_mcg: number;
    vitamin_c_mg: number;
    vitamin_d_iu: number;
    vitamin_e_mg: number;
    vitamin_b6_mg?: number;
    vitamin_b12_mcg: number;
    folate_mcg: number;
    calcium_mg: number;
    iron_mg: number;
    magnesium_mg: number;
    potassium_mg: number;
    sodium_mg: number;
    zinc_mg: number;
  };
  weightKg?: number;
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryGoal?: 'maintenance' | 'fat_loss' | 'muscle_gain' | 'recomposition';
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalNutrients: Micronutrients;
  mealsCount: number;
  meals: Meal[];
  calorieGoalPercent: number;
  proteinGoalPercent: number;
  carbsGoalPercent: number;
  fatGoalPercent: number;
  fiberGoalPercent: number;
  healthScore: number; // 0 a 100
}

export interface NutrientDeficiency {
  key: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  percent: number;
  status: 'critical' | 'low' | 'good' | 'optimal' | 'excess';
  foodSuggestions: string[];
}
