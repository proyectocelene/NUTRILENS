import { Meal, NutritionGoals, CanonicalFood } from './nutrition.types';

export interface DbRecipe {
  id?: string;
  name: string;
  category: string;
  servings: number;
  foods: Meal['foods'];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalNutrients: Meal['totalNutrients'];
  instructions?: string;
  tags?: string[];
  createdAt: number;
}

export type ReflectionReasonTag = 
  | 'perfect_day' 
  | 'time_busy' 
  | 'social_event' 
  | 'intense_workout' 
  | 'low_appetite' 
  | 'cravings' 
  | 'forgot_supplements' 
  | 'eating_out'
  | 'other';

export interface DbDailyLog {
  id?: string;
  date: string; // YYYY-MM-DD (unique index)
  notes?: string;
  waterMl?: number;
  weightKg?: number;
  energyLevel?: number; // 1-5
  completedGoals?: boolean;
  reasonTag?: ReflectionReasonTag;
  reflectionNotes?: string;
  creatineTaken?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'streak' | 'nutrition' | 'hydration' | 'ai' | 'discipline';
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GamificationState {
  totalXp: number;
  currentLevel: number;
  levelTitle: string;
  currentStreak: number;
  bestStreak: number;
  lastLoggedDate: string;
  unlockedAchievementIds: string[];
}

export interface ExportDataPayload {
  version: number;
  exportDate: string;
  meals: Meal[];
  recipes: DbRecipe[];
  goals: NutritionGoals;
  logs: DbDailyLog[];
  canonicalFoods?: CanonicalFood[];
}
