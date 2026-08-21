import { Meal, Micronutrients, NutritionGoals } from '../types/nutrition.types';
import { calculateDailySummary, NUTRIENT_RICH_FOODS } from './nutritionCalculator';

export interface DayTrendPoint {
  date: string;
  displayDate: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number;
  targetCalories: number;
  targetProtein: number;
}

export interface StatsOverview {
  daysAnalyzed: number;
  activeDaysCount: number;
  avgCalories: number;
  avgProtein: number;
  avgCarbs: number;
  avgFat: number;
  avgFiber: number;
  avgHealthScore: number;
  proteinGoalMetRate: number; // % de días cumplidos
  calorieGoalMetRate: number;
  trends: DayTrendPoint[];
  recurringDeficiencies: Array<{
    nutrientKey: string;
    nutrientName: string;
    unit: string;
    deficiencyRate: number; // % de días con déficit
    avgIntake: number;
    target: number;
    suggestedFoods: string[];
  }>;
  smartInsights: Array<{
    id: string;
    type: 'positive' | 'warning' | 'info';
    title: string;
    message: string;
    icon?: string;
  }>;
}

export function generateStatsOverview(meals: Meal[], goals: NutritionGoals, daysCount: number = 7): StatsOverview {
  const trends: DayTrendPoint[] = [];
  const today = new Date();
  
  // Generar lista de fechas ordenadas cronológicamente
  const dateStrings: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    dateStrings.push(d.toISOString().split('T')[0]);
  }

  let totalCal = 0;
  let totalProt = 0;
  let totalCarb = 0;
  let totalFat = 0;
  let totalFib = 0;
  let totalScore = 0;
  let activeDays = 0;
  let proteinMetDays = 0;
  let calorieMetDays = 0;

  // Mapa de recuento de micronutrientes para detectar deficiencias recurrentes
  const microAccumulator: Record<string, { total: number; deficientDays: number }> = {};
  const microKeys = Object.keys(goals.microGoals) as Array<keyof typeof goals.microGoals>;
  microKeys.forEach(k => {
    microAccumulator[k] = { total: 0, deficientDays: 0 };
  });

  for (const dateStr of dateStrings) {
    const summary = calculateDailySummary(dateStr, meals, goals);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const displayDate = dateObj.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });

    trends.push({
      date: dateStr,
      displayDate,
      calories: summary.totalCalories,
      protein: summary.totalProtein,
      carbs: summary.totalCarbs,
      fat: summary.totalFat,
      fiber: summary.totalFiber,
      healthScore: summary.healthScore,
      targetCalories: goals.calories,
      targetProtein: goals.protein
    });

    if (summary.mealsCount > 0) {
      activeDays++;
      totalCal += summary.totalCalories;
      totalProt += summary.totalProtein;
      totalCarb += summary.totalCarbs;
      totalFat += summary.totalFat;
      totalFib += summary.totalFiber;
      totalScore += summary.healthScore;

      if (summary.totalProtein >= goals.protein * 0.85) proteinMetDays++;
      if (summary.totalCalories >= goals.calories * 0.85 && summary.totalCalories <= goals.calories * 1.15) {
        calorieMetDays++;
      }

      // Evaluar micronutrientes
      microKeys.forEach(k => {
        const val = summary.totalNutrients[k as keyof Micronutrients] || 0;
        microAccumulator[k].total += val;
        if (val < (goals.microGoals[k] || 0) * 0.7) {
          microAccumulator[k].deficientDays++;
        }
      });
    }
  }

  const divisor = activeDays > 0 ? activeDays : 1;
  const avgCalories = Math.round(totalCal / divisor);
  const avgProtein = Math.round((totalProt / divisor) * 10) / 10;
  const avgCarbs = Math.round((totalCarb / divisor) * 10) / 10;
  const avgFat = Math.round((totalFat / divisor) * 10) / 10;
  const avgFiber = Math.round((totalFib / divisor) * 10) / 10;
  const avgHealthScore = Math.round(totalScore / divisor);
  const proteinGoalMetRate = Math.round((proteinMetDays / divisor) * 100);
  const calorieGoalMetRate = Math.round((calorieMetDays / divisor) * 100);

  // Deficiencias recurrentes
  const recurringDeficiencies: StatsOverview['recurringDeficiencies'] = [];
  if (activeDays > 0) {
    microKeys.forEach(k => {
      const data = microAccumulator[k];
      const rate = Math.round((data.deficientDays / activeDays) * 100);
      const avg = Math.round((data.total / activeDays) * 10) / 10;
      const target = goals.microGoals[k] || 0;
      const info = NUTRIENT_RICH_FOODS[k];

      if (rate >= 40 && info) {
        recurringDeficiencies.push({
          nutrientKey: k,
          nutrientName: info.name,
          unit: info.unit,
          deficiencyRate: rate,
          avgIntake: avg,
          target,
          suggestedFoods: info.foods
        });
      }
    });
  }

  // Ordenar de mayor tasa de déficit a menor
  recurringDeficiencies.sort((a, b) => b.deficiencyRate - a.deficiencyRate);

  // Generar Insights Inteligentes
  const smartInsights: StatsOverview['smartInsights'] = [];

  if (activeDays === 0) {
    smartInsights.push({
      id: 'no_data',
      type: 'info',
      title: 'Comienza tu registro',
      message: 'Pega tu primer JSON de comida para activar las estadísticas inteligentes y el análisis de hábitos.'
    });
  } else {
    // Insight de proteína
    if (proteinGoalMetRate >= 70) {
      smartInsights.push({
        id: 'protein_great',
        type: 'positive',
        title: 'Excelente ingesta de proteína 💪',
        message: `Has alcanzado tu objetivo proteico en el ${proteinGoalMetRate}% de tus días registrados (${avgProtein}g promedio).`
      });
    } else {
      smartInsights.push({
        id: 'protein_low',
        type: 'warning',
        title: 'Potencia tu ingesta proteica',
        message: `Tu promedio diario es de ${avgProtein}g frente a tu meta de ${goals.protein}g. Prueba agregar huevos, yogur griego o pechuga de pollo.`
      });
    }

    // Insight de fibra
    if (avgFiber >= goals.fiber * 0.85) {
      smartInsights.push({
        id: 'fiber_good',
        type: 'positive',
        title: 'Salud digestiva óptima 🌾',
        message: `Excelente consumo de fibra (${avgFiber}g/día). Mantiene tu saciedad y microbiota saludable.`
      });
    } else {
      smartInsights.push({
        id: 'fiber_low',
        type: 'warning',
        title: 'Aumenta tu fibra dietética',
        message: `Consumes ${avgFiber}g de los ${goals.fiber}g recomendados. Añadir semillas de chía o avena en tus comidas marcará la diferencia.`
      });
    }

    // Insight de micronutrientes principales
    if (recurringDeficiencies.length > 0) {
      const topDef = recurringDeficiencies[0];
      smartInsights.push({
        id: 'micro_alert',
        type: 'warning',
        title: `Carencia recurrente: ${topDef.nutrientName}`,
        message: `Has estado bajo en ${topDef.nutrientName} en el ${topDef.deficiencyRate}% de tus días. Alimentos recomendados: ${topDef.suggestedFoods.slice(0, 3).join(', ')}.`
      });
    }

    // Puntuación de calidad
    if (avgHealthScore >= 80) {
      smartInsights.push({
        id: 'score_elite',
        type: 'positive',
        title: 'Calidad Nutricional Alta ⭐',
        message: `Tu índice promedio de calidad es de ${avgHealthScore}/100. ¡Tus elecciones de alimentos son muy balanceadas!`
      });
    }
  }

  return {
    daysAnalyzed: daysCount,
    activeDaysCount: activeDays,
    avgCalories,
    avgProtein,
    avgCarbs,
    avgFat,
    avgFiber,
    avgHealthScore,
    proteinGoalMetRate,
    calorieGoalMetRate,
    trends,
    recurringDeficiencies,
    smartInsights
  };
}
