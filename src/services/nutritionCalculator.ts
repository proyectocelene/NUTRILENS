import { DailyNutritionSummary, Meal, Micronutrients, NutrientDeficiency, NutritionGoals } from '../types/nutrition.types';

// Alimentos ricos en cada nutriente para recomendaciones inteligentes
export const NUTRIENT_RICH_FOODS: Record<string, { name: string; unit: string; foods: string[] }> = {
  protein: {
    name: 'Proteína',
    unit: 'g',
    foods: ['Pechuga de pollo o pavo', 'Atún o salmón', 'Huevos enteros o claras', 'Tofu / Tempeh', 'Proteína en polvo (Whey/Vegana)', 'Yogur Griego']
  },
  fiber: {
    name: 'Fibra Dietética',
    unit: 'g',
    foods: ['Semillas de chía o lino', 'Avena integral', 'Lentejas y garbanzos', 'Brócoli y alcachofas', 'Frambuesas y manzanas con piel']
  },
  vitamin_a_mcg: {
    name: 'Vitamina A',
    unit: 'mcg',
    foods: ['Zanahorias', 'Boniato / Camote', 'Espinacas frescas', 'Hígado de ternera', 'Pimientos rojos']
  },
  vitamin_c_mg: {
    name: 'Vitamina C',
    unit: 'mg',
    foods: ['Pimientos rojos y verdes', 'Kiwi', 'Fresas y naranjas', 'Brócoli al vapor', 'Papaya']
  },
  vitamin_d_iu: {
    name: 'Vitamina D',
    unit: 'IU',
    foods: ['Salmón silvestre', 'Sardinas en conserva', 'Yema de huevo de campo', 'Hongos Maitake / Portobello', 'Leche fortificada']
  },
  vitamin_e_mg: {
    name: 'Vitamina E',
    unit: 'mg',
    foods: ['Semillas de girasol', 'Almendras y avellanas', 'Aguacate', 'Aceite de oliva virgen extra', 'Espinacas']
  },
  vitamin_b12_mcg: {
    name: 'Vitamina B12',
    unit: 'mcg',
    foods: ['Almejas y mejillones', 'Carne magra de res', 'Salmón y trucha', 'Huevos', 'Levadura nutricional fortificada']
  },
  folate_mcg: {
    name: 'Folato (B9)',
    unit: 'mcg',
    foods: ['Espinacas y espárragos', 'Edamame', 'Lentejas cocidas', 'Aguacate', 'Zumo de naranja natural']
  },
  calcium_mg: {
    name: 'Calcio',
    unit: 'mg',
    foods: ['Queso parmesano o fresco', 'Yogur natural', 'Tofu enriquecido', 'Semillas de sésamo/tahini', 'Sardinas con espinas']
  },
  iron_mg: {
    name: 'Hierro',
    unit: 'mg',
    foods: ['Carne roja magra', 'Lentejas y frijoles negros', 'Espinacas con limón (vit C)', 'Semillas de calabaza', 'Cacao puro']
  },
  magnesium_mg: {
    name: 'Magnesio',
    unit: 'mg',
    foods: ['Semillas de calabaza', 'Almendras tostadas', 'Chocolate negro (>85%)', 'Espinacas cocidas', 'Quinoa']
  },
  potassium_mg: {
    name: 'Potasio',
    unit: 'mg',
    foods: ['Plátanos', 'Boniato asado con piel', 'Aguacate', 'Agua de coco natural', 'Patatas cocidas', 'Espinacas']
  },
  sodium_mg: {
    name: 'Sodio',
    unit: 'mg',
    foods: ['Sal marina moderada', 'Encurtidos / Pepinillos', 'Caldo de huesos']
  },
  zinc_mg: {
    name: 'Zinc',
    unit: 'mg',
    foods: ['Ostras y mariscos', 'Carne de ternera', 'Semillas de calabaza y cáñamo', 'Garbanzos', 'Anacardos']
  }
};

// Calcula el desglose diario a partir de una lista de comidas
export function calculateDailySummary(date: string, meals: Meal[], goals: NutritionGoals): DailyNutritionSummary {
  const dayMeals = meals.filter(m => m.date === date);

  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  const totalNutrients: Micronutrients = {};

  for (const meal of dayMeals) {
    totalCalories += meal.totalCalories || 0;
    totalProtein += meal.totalProtein || 0;
    totalCarbs += meal.totalCarbs || 0;
    totalFat += meal.totalFat || 0;
    totalFiber += meal.totalFiber || 0;

    if (meal.totalNutrients && Object.keys(meal.totalNutrients).length > 0) {
      for (const [k, v] of Object.entries(meal.totalNutrients)) {
        const key = k as keyof Micronutrients;
        if (typeof v === 'number') {
          totalNutrients[key] = (totalNutrients[key] || 0) + v;
        }
      }
    } else if (meal.foods) {
      // Si el objeto de comida no tenía totalNutrients pre-calculado, sumar desde foods
      for (const food of meal.foods) {
        if (food.nutrients) {
          for (const [k, v] of Object.entries(food.nutrients)) {
            const key = k as keyof Micronutrients;
            if (typeof v === 'number') {
              totalNutrients[key] = (totalNutrients[key] || 0) + v;
            }
          }
        }
      }
    }
  }

  // Redondear
  totalCalories = Math.round(totalCalories);
  totalProtein = Math.round(totalProtein * 10) / 10;
  totalCarbs = Math.round(totalCarbs * 10) / 10;
  totalFat = Math.round(totalFat * 10) / 10;
  totalFiber = Math.round(totalFiber * 10) / 10;

  for (const k of Object.keys(totalNutrients)) {
    const key = k as keyof Micronutrients;
    if (totalNutrients[key] !== undefined) {
      totalNutrients[key] = Math.round((totalNutrients[key] as number) * 10) / 10;
    }
  }

  const calorieGoalPercent = goals.calories > 0 ? Math.round((totalCalories / goals.calories) * 100) : 0;
  const proteinGoalPercent = goals.protein > 0 ? Math.round((totalProtein / goals.protein) * 100) : 0;
  const carbsGoalPercent = goals.carbs > 0 ? Math.round((totalCarbs / goals.carbs) * 100) : 0;
  const fatGoalPercent = goals.fat > 0 ? Math.round((totalFat / goals.fat) * 100) : 0;
  const fiberGoalPercent = goals.fiber > 0 ? Math.round((totalFiber / goals.fiber) * 100) : 0;

  // Cálculo de Puntuación de Calidad Nutricional (0 - 100)
  let healthScore = 0;
  if (dayMeals.length > 0) {
    // 1. Aporte proteico (hasta 30 pts)
    const protScore = Math.min(30, (proteinGoalPercent / 100) * 30);
    // 2. Fibra adecuada (hasta 25 pts)
    const fiberScore = Math.min(25, (fiberGoalPercent / 100) * 25);
    // 3. Ajuste calórico (hasta 25 pts: máxima puntuación entre 85% y 110% de la meta)
    let calScore = 0;
    if (calorieGoalPercent >= 80 && calorieGoalPercent <= 115) {
      calScore = 25;
    } else if (calorieGoalPercent > 0) {
      calScore = Math.max(0, 25 - Math.abs(100 - calorieGoalPercent) * 0.35);
    }
    // 4. Variedad de micronutrientes registrados (hasta 20 pts)
    const microsCount = Object.keys(totalNutrients).filter(k => (totalNutrients[k as keyof Micronutrients] || 0) > 0).length;
    const microScore = Math.min(20, (microsCount / 8) * 20);

    healthScore = Math.round(protScore + fiberScore + calScore + microScore);
    healthScore = Math.min(100, Math.max(0, healthScore));
  }

  return {
    date,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    totalFiber,
    totalNutrients,
    mealsCount: dayMeals.length,
    meals: dayMeals,
    calorieGoalPercent,
    proteinGoalPercent,
    carbsGoalPercent,
    fatGoalPercent,
    fiberGoalPercent,
    healthScore
  };
}

// Analizador de "Qué me falta hoy" (Deficiencias y excesos con sugerencias)
export function analyzeNutrientGaps(summary: DailyNutritionSummary, goals: NutritionGoals): NutrientDeficiency[] {
  const deficiencies: NutrientDeficiency[] = [];

  // 1. Proteína
  const protDiff = goals.protein - summary.totalProtein;
  const protPct = goals.protein > 0 ? (summary.totalProtein / goals.protein) * 100 : 100;
  deficiencies.push({
    key: 'protein',
    name: 'Proteína',
    current: summary.totalProtein,
    target: goals.protein,
    unit: 'g',
    percent: Math.round(protPct),
    status: protPct < 50 ? 'critical' : protPct < 85 ? 'low' : protPct <= 120 ? 'optimal' : 'excess',
    foodSuggestions: protDiff > 0 ? NUTRIENT_RICH_FOODS.protein.foods : []
  });

  // 2. Fibra
  const fiberDiff = goals.fiber - summary.totalFiber;
  const fiberPct = goals.fiber > 0 ? (summary.totalFiber / goals.fiber) * 100 : 100;
  deficiencies.push({
    key: 'fiber',
    name: 'Fibra',
    current: summary.totalFiber,
    target: goals.fiber,
    unit: 'g',
    percent: Math.round(fiberPct),
    status: fiberPct < 50 ? 'critical' : fiberPct < 85 ? 'low' : fiberPct <= 140 ? 'optimal' : 'excess',
    foodSuggestions: fiberDiff > 0 ? NUTRIENT_RICH_FOODS.fiber.foods : []
  });

  // 3. Micronutrientes evaluados contra microGoals
  const microList: Array<keyof typeof goals.microGoals> = [
    'iron_mg',
    'magnesium_mg',
    'potassium_mg',
    'calcium_mg',
    'zinc_mg',
    'vitamin_c_mg',
    'vitamin_d_iu',
    'vitamin_a_mcg',
    'vitamin_b12_mcg',
    'folate_mcg',
    'vitamin_e_mg'
  ];

  for (const microKey of microList) {
    const target = goals.microGoals[microKey];
    if (!target || target <= 0) continue;

    const current = summary.totalNutrients[microKey as keyof Micronutrients] || 0;
    const pct = Math.round((current / target) * 100);
    const info = NUTRIENT_RICH_FOODS[microKey];

    let status: NutrientDeficiency['status'] = 'good';
    if (pct < 35) status = 'critical';
    else if (pct < 75) status = 'low';
    else if (pct <= 140) status = 'optimal';
    else status = 'excess';

    deficiencies.push({
      key: microKey,
      name: info ? info.name : microKey,
      current: Math.round(current * 10) / 10,
      target,
      unit: info ? info.unit : '',
      percent: pct,
      status,
      foodSuggestions: pct < 80 && info ? info.foods : []
    });
  }

  // Ordenar para mostrar primero los más críticos / con mayor déficit
  return deficiencies.sort((a, b) => a.percent - b.percent);
}

// Calcula porcentajes de macros en calorías (% proteína, % carbos, % grasas)
export function getMacroCalorieDistribution(proteinG: number, carbsG: number, fatG: number) {
  const pKcal = proteinG * 4;
  const cKcal = carbsG * 4;
  const fKcal = fatG * 9;
  const totalKcal = pKcal + cKcal + fKcal;

  if (totalKcal === 0) {
    return { proteinPct: 0, carbsPct: 0, fatPct: 0, totalKcal: 0 };
  }

  return {
    proteinPct: Math.round((pKcal / totalKcal) * 100),
    carbsPct: Math.round((cKcal / totalKcal) * 100),
    fatPct: Math.round((fKcal / totalKcal) * 100),
    totalKcal: Math.round(totalKcal)
  };
}
