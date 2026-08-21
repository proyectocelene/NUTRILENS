import confetti from 'canvas-confetti';
import { GamificationState, Achievement } from '../types/db.types';
import { Meal, DailyNutritionSummary } from '../types/nutrition.types';

const LOCAL_STORAGE_GAME_KEY = 'nutrilens_gamification_state';

export const LEVEL_TIERS = [
  { level: 1, title: 'Principiante Disciplinado', minXp: 0, maxXp: 200, icon: '🌱' },
  { level: 2, title: 'Constructor de Hábitos', minXp: 200, maxXp: 500, icon: '⚡' },
  { level: 3, title: 'Maestro de Macros', minXp: 500, maxXp: 1000, icon: '🎯' },
  { level: 4, title: 'Biohacker Nutricional', minXp: 1000, maxXp: 2000, icon: '🧬' },
  { level: 5, title: 'Atleta de Alto Rendimiento', minXp: 2000, maxXp: 3500, icon: '🔥' },
  { level: 6, title: 'Titán de la Recomposición', minXp: 3500, maxXp: 99999, icon: '👑' }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_meal',
    title: 'Primer Bocado Registrado',
    description: 'Registraste tu primera comida o suplemento en NutriLens',
    icon: '🍳',
    xpReward: 50,
    category: 'nutrition',
    unlocked: false
  },
  {
    id: 'ai_vision',
    title: 'Visión Bioquímica IA',
    description: 'Analizaste una comida o foto usando la Inteligencia Artificial',
    icon: '🤖',
    xpReward: 60,
    category: 'ai',
    unlocked: false
  },
  {
    id: 'protein_king',
    title: 'Monarca Proteico',
    description: 'Alcanzaste o superaste el 100% de tu requerimiento proteico diario',
    icon: '🥩',
    xpReward: 80,
    category: 'nutrition',
    unlocked: false
  },
  {
    id: 'streak_3',
    title: 'Racha de Fuego (3 Días)',
    description: 'Mantuviste el registro constante durante 3 días consecutivos',
    icon: '🔥',
    xpReward: 100,
    category: 'streak',
    unlocked: false
  },
  {
    id: 'streak_7',
    title: 'Semana de Hierro (7 Días)',
    description: '7 días ininterrumpidos de disciplina y control nutricional',
    icon: '🛡️',
    xpReward: 200,
    category: 'streak',
    unlocked: false
  },
  {
    id: 'biofeedback_master',
    title: 'Mente & Cuerpo Sincronizados',
    description: 'Registraste tu nivel de saciedad, digestión y energía post-comida',
    icon: '🧠',
    xpReward: 40,
    category: 'discipline',
    unlocked: false
  },
  {
    id: 'micronutrient_shield',
    title: 'Escudo de Micronutrientes',
    description: 'Cubriste el 100% en al menos 5 vitaminas y minerales clave',
    icon: '🥑',
    xpReward: 90,
    category: 'nutrition',
    unlocked: false
  },
  {
    id: 'creatine_habit',
    title: 'Fuerza & Creatina',
    description: 'Registraste tu toma diaria de creatina o suplementación clave',
    icon: '⚡',
    xpReward: 50,
    category: 'hydration',
    unlocked: false
  }
];

export const getGamificationState = (): GamificationState => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GAME_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}

  return {
    totalXp: 50,
    currentLevel: 1,
    levelTitle: 'Principiante Disciplinado',
    currentStreak: 1,
    bestStreak: 1,
    lastLoggedDate: new Date().toISOString().split('T')[0],
    unlockedAchievementIds: ['first_meal']
  };
};

export const saveGamificationState = (state: GamificationState): void => {
  localStorage.setItem(LOCAL_STORAGE_GAME_KEY, JSON.stringify(state));
};

export const calculateLevelInfo = (xp: number) => {
  const tier = LEVEL_TIERS.find(t => xp >= t.minXp && xp < t.maxXp) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - tier.minXp) / Math.max(1, tier.maxXp - tier.minXp)) * 100)));
  const xpToNext = tier.maxXp === 99999 ? 0 : tier.maxXp - xp;

  return {
    ...tier,
    progressPercent,
    xpToNext
  };
};

export const awardXp = (amount: number, reason: string): { newXp: number; leveledUp: boolean; newLevel: number } => {
  const current = getGamificationState();
  const oldLevel = current.currentLevel;
  const newXp = current.totalXp + amount;
  
  const levelInfo = calculateLevelInfo(newXp);
  const leveledUp = levelInfo.level > oldLevel;

  const updated: GamificationState = {
    ...current,
    totalXp: newXp,
    currentLevel: levelInfo.level,
    levelTitle: levelInfo.title
  };

  saveGamificationState(updated);

  if (leveledUp) {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899']
    });
  }

  return { newXp, leveledUp, newLevel: levelInfo.level };
};

export const checkAndUpdateStreak = (todayStr: string = new Date().toISOString().split('T')[0]): number => {
  const state = getGamificationState();
  if (state.lastLoggedDate === todayStr) {
    return state.currentStreak;
  }

  const lastDate = new Date(state.lastLoggedDate);
  const currentDate = new Date(todayStr);
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

  let newStreak = state.currentStreak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const updated: GamificationState = {
    ...state,
    currentStreak: newStreak,
    bestStreak: Math.max(state.bestStreak, newStreak),
    lastLoggedDate: todayStr
  };

  saveGamificationState(updated);
  return newStreak;
};

export const unlockAchievement = (achievementId: string): boolean => {
  const state = getGamificationState();
  if (state.unlockedAchievementIds.includes(achievementId)) {
    return false;
  }

  const achievement = INITIAL_ACHIEVEMENTS.find(a => a.id === achievementId);
  const xpReward = achievement ? achievement.xpReward : 50;

  const updated: GamificationState = {
    ...state,
    totalXp: state.totalXp + xpReward,
    unlockedAchievementIds: [...state.unlockedAchievementIds, achievementId]
  };

  const levelInfo = calculateLevelInfo(updated.totalXp);
  updated.currentLevel = levelInfo.level;
  updated.levelTitle = levelInfo.title;

  saveGamificationState(updated);

  confetti({
    particleCount: 70,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#10B981', '#3B82F6', '#F59E0B']
  });

  return true;
};
