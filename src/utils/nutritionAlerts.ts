import { Meal } from '../types/nutrition.types';

export interface NutritionAlert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  metric?: string;
  category: 'lipids' | 'minerals' | 'protein' | 'fiber' | 'energy' | 'timing';
}

/**
 * Evalúa una comida y devuelve una lista de alertas y virtudes nutricionales basadas en evidencia.
 */
export function getMealNutritionalAlerts(meal: Meal, caffeineCutoffHour: number = 15): NutritionAlert[] {
  const alerts: NutritionAlert[] = [];
  const micros = meal.totalNutrients || {};
  const cal = Math.max(1, meal.totalCalories);

  // 1. GRASAS TRANS (Alerta Crítica)
  const transFat = micros.trans_fat_g || 0;
  if (transFat > 0.1) {
    alerts.push({
      id: 'trans_fat',
      type: 'danger',
      title: 'Grasas Trans Detectadas',
      description: 'La OMS recomienda 0g de grasas trans industriales. Aumentan el colesterol LDL y la inflamación cardiovascular.',
      metric: `${transFat}g`,
      category: 'lipids'
    });
  }

  // 2. GRASA SATURADA ELEVADA
  const satFat = micros.saturated_fat_g || 0;
  if (satFat >= 10 || (satFat * 9) / cal > 0.20) {
    alerts.push({
      id: 'high_sat_fat',
      type: 'warning',
      title: 'Grasa Saturada Elevada',
      description: 'Supera el 20% calórico del plato. Conviene equilibrarla con fuentes monoinsaturadas (oliva, aguacate) y fibra.',
      metric: `${satFat}g`,
      category: 'lipids'
    });
  }

  // 3. SODIO ELEVADO
  const sodium = micros.sodium_mg || 0;
  if (sodium >= 800) {
    alerts.push({
      id: 'high_sodium',
      type: 'warning',
      title: 'Contenido Alto de Sodio',
      description: 'Supera el 35% del límite recomendado diario (2,300 mg). Asegura buena ingesta de agua y potasio.',
      metric: `${Math.round(sodium)} mg`,
      category: 'minerals'
    });
  }

  // 4. AZÚCARES ELEVADOS
  const sugar = micros.sugar_g || 0;
  if (sugar >= 18) {
    alerts.push({
      id: 'high_sugar',
      type: 'warning',
      title: 'Azúcares Elevados',
      description: 'Concentración considerable de azúcares. Puede generar picos de insulina y rebotes de fatiga postprandial.',
      metric: `${sugar}g`,
      category: 'energy'
    });
  }

  // 5. CAFEÍNA TARDÍA
  const caffeine = micros.caffeine_mg || 0;
  if (caffeine >= 40 && meal.time) {
    const hour = parseInt(meal.time.split(':')[0], 10);
    if (!isNaN(hour) && hour >= caffeineCutoffHour) {
      alerts.push({
        id: 'late_caffeine',
        type: 'warning',
        title: 'Cafeína Tardía',
        description: `Consumida a las ${meal.time} (después de las ${caffeineCutoffHour}:00). Su vida media de 5-7h puede deteriorar la arquitectura del sueño profundo.`,
        metric: `${Math.round(caffeine)} mg`,
        category: 'timing'
      });
    }
  }

  // 6. EXCELENTE DENSIDAD PROTEICA (Virtud)
  const proteinRatio = (meal.totalProtein * 4) / cal;
  if (proteinRatio >= 0.35 && meal.totalCalories >= 120) {
    alerts.push({
      id: 'high_protein_density',
      type: 'success',
      title: 'Alta Densidad Proteica',
      description: `El ${Math.round(proteinRatio * 100)}% de las calorías provienen de proteína. Excelente estímulo de síntesis muscular (MPS) y máxima saciedad.`,
      metric: `${meal.totalProtein}g (${Math.round(proteinRatio * 100)}%)`,
      category: 'protein'
    });
  }

  // 7. RICO EN FIBRA (Virtud)
  if (meal.totalFiber >= 6) {
    alerts.push({
      id: 'rich_fiber',
      type: 'success',
      title: 'Rico en Fibra Dietética',
      description: 'Excelente para ralentizar el vaciado gástrico, nutrir la microbiota colónica y estabilizar la glucemia.',
      metric: `${meal.totalFiber}g`,
      category: 'fiber'
    });
  }

  // 8. RICO EN OMEGA-3 (Virtud)
  const omega3 = micros.omega3_g || 0;
  if (omega3 >= 0.8) {
    alerts.push({
      id: 'rich_omega3',
      type: 'success',
      title: 'Rico en Ácidos Omega-3',
      description: 'Potente acción antiinflamatoria, optimización de sensibilidad a la insulina y soporte cardiovascular.',
      metric: `${omega3}g`,
      category: 'lipids'
    });
  }

  return alerts;
}

/**
 * Evalúa las alertas agregadas para todo el día a partir de las comidas consumidas.
 */
export function getDayNutritionalAlerts(meals: Meal[], cutoffHour: number = 15): NutritionAlert[] {
  const alerts: NutritionAlert[] = [];
  if (meals.length === 0) return alerts;

  let totalSodium = 0;
  let totalSugar = 0;
  let totalTransFat = 0;
  let totalSatFat = 0;
  let totalFiber = 0;

  for (const m of meals) {
    const n = m.totalNutrients || {};
    totalSodium += n.sodium_mg || 0;
    totalSugar += n.sugar_g || 0;
    totalTransFat += n.trans_fat_g || 0;
    totalSatFat += n.saturated_fat_g || 0;
    totalFiber += m.totalFiber || 0;
  }

  if (totalTransFat > 0.3) {
    alerts.push({
      id: 'day_trans_fat',
      type: 'danger',
      title: 'Grasas Trans Totales del Día Elevadas',
      description: 'Se registraron grasas trans industriales en el día. Procura reemplazar alimentos ultraprocesados por ingredientes enteros.',
      metric: `${Math.round(totalTransFat * 10) / 10}g`,
      category: 'lipids'
    });
  }

  if (totalSodium >= 2300) {
    alerts.push({
      id: 'day_high_sodium',
      type: 'warning',
      title: 'Límite Diario de Sodio Superado',
      description: 'Has superado el consumo recomendado de 2,300 mg de sodio hoy. Aumenta tu hidratación para equilibrar el balance electrolítico.',
      metric: `${Math.round(totalSodium)} mg`,
      category: 'minerals'
    });
  }

  if (totalSugar >= 45) {
    alerts.push({
      id: 'day_high_sugar',
      type: 'warning',
      title: 'Consumo Diario Alto de Azúcares',
      description: 'El total de azúcares del día es elevado. Prioriza carbohidratos complejos con matriz de fibra intacta.',
      metric: `${Math.round(totalSugar)}g`,
      category: 'energy'
    });
  }

  if (totalFiber >= 30) {
    alerts.push({
      id: 'day_great_fiber',
      type: 'success',
      title: 'Meta de Fibra Diaria Alcanzada',
      description: '¡Excelente ingesta de fibra hoy! Tu microbiota y salud metabólica están respaldadas.',
      metric: `${Math.round(totalFiber)}g`,
      category: 'fiber'
    });
  }

  return alerts;
}
