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

export interface LearnedFood {
  id: string;
  name: string;
  count: number;
  lastUsedDate: string;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
  sampleAmount: string;
  sampleMealName: string;
  nutrients?: Meal['totalNutrients'];
  isAlreadyCanonical: boolean;
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
  creatineG?: number;
  caffeineMg?: number;
  sodiumMg?: number;
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

export interface DatabaseAuditDiagnostic {
  totalEntitiesCount: number;
  mealsCount: number;
  individualFoodsCount: number;
  recipesCount: number;
  canonicalFoodsCount: number;
  learnedFoodsCount: number;
  dailyLogsCount: number;
  integrityScorePct: number; // 0 - 100
  atwaterDiscrepanciesCount: number;
  lipidDiscrepanciesCount: number;
  issuesList: {
    type: 'warning' | 'error' | 'info';
    entityType: 'meal' | 'food' | 'canonical' | 'recipe' | 'log';
    id: string;
    title: string;
    description: string;
    expected?: string;
    actual?: string;
  }[];
}

export interface ExportDataPayload {
  version: number;
  app: string;
  exportDate: string;
  auditSummary?: DatabaseAuditDiagnostic;
  meals: Meal[];
  recipes: DbRecipe[];
  goals: NutritionGoals;
  logs: DbDailyLog[];
  canonicalFoods?: CanonicalFood[];
  learnedFoods?: LearnedFood[];
  gamification?: GamificationState;
  localSettings?: {
    aiProvider?: string;
    aiModel?: string;
    hasFirebaseSync?: boolean;
  };
}
