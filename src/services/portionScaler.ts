import { FoodItem, Meal, Micronutrients } from '../types/nutrition.types';

/**
 * Redondea un número limpiamente a los decimales indicados evitando artefactos de punto flotante.
 */
export function roundTo(val: number, decimals: number = 1): number {
  if (val === undefined || val === null || isNaN(val)) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round((val + Number.EPSILON) * multiplier) / multiplier;
}

/**
 * Extrae los gramos o mililitros a partir de la propiedad `grams`, `servingGrams` o de la cadena `amount`.
 * Soporta formatos: "100g", "70 gr", "60 gramos", "240ml", "2 rebanadas (60g)", "1 taza (~150g)", "1/2 pieza (50g)".
 */
export function parseGramsFromAmount(amount?: string, fallbackGrams?: number): number | null {
  if (fallbackGrams && fallbackGrams > 0) return fallbackGrams;
  if (!amount || typeof amount !== 'string') return null;

  const trimmed = amount.trim();

  // 1. Buscar si hay contenido entre paréntesis con 'g' o 'ml': ej "(60g)", "(~100 g)", "(240 ml)"
  const parenMatch = trimmed.match(/\((?:~)?\s*(\d+(?:\.\d+)?)\s*(?:g|gr|gramos|ml|mililitros)\b/i);
  if (parenMatch && parenMatch[1]) {
    const parsed = parseFloat(parenMatch[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 2. Buscar patrón general de número seguido de g/gr/gramos/ml: ej "100g", "70 gr", "250 ml"
  const directMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(?:g|gr|gramos|ml|mililitros)\b/i);
  if (directMatch && directMatch[1]) {
    const parsed = parseFloat(directMatch[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  // 3. Si solo viene un número aislado
  const pureNumMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (pureNumMatch && pureNumMatch[1]) {
    const parsed = parseFloat(pureNumMatch[1]);
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  return null;
}

/**
 * Actualiza la descripción de cantidad de forma legible al cambiar los gramos.
 */
export function formatAmountWithGrams(oldAmount: string | undefined, newGrams: number, baseGrams?: number): string {
  const cleanGrams = roundTo(newGrams, 1);
  if (!oldAmount || !oldAmount.trim()) {
    return `${cleanGrams}g`;
  }

  const trimmed = oldAmount.trim();

  // Si tiene paréntesis con gramos ej: "2 rebanadas (60g)"
  if (/\((?:~)?\s*\d+(?:\.\d+)?\s*(?:g|gr|gramos|ml)\)/i.test(trimmed)) {
    if (baseGrams && baseGrams > 0 && cleanGrams !== baseGrams) {
      // Intentar ajustar la unidad previa si empieza con un número ej: "2 rebanadas"
      const unitMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(.+?)\s*\(/);
      if (unitMatch) {
        const oldUnitCount = parseFloat(unitMatch[1]);
        const unitName = unitMatch[2];
        const newUnitCount = roundTo((oldUnitCount * cleanGrams) / baseGrams, 1);
        return `${newUnitCount} ${unitName} (${cleanGrams}g)`;
      }
    }
    return trimmed.replace(/\((?:~)?\s*\d+(?:\.\d+)?\s*(?:g|gr|gramos|ml)\)/i, `(${cleanGrams}g)`);
  }

  // Si era solo "100g" o "100 g"
  if (/^\d+(?:\.\d+)?\s*(?:g|gr|gramos|ml)$/i.test(trimmed)) {
    const isMl = /ml/i.test(trimmed);
    return `${cleanGrams}${isMl ? 'ml' : 'g'}`;
  }

  // Si empieza con número y texto ej "100g de pollo"
  if (/^\d+(?:\.\d+)?\s*(?:g|gr|gramos|ml)\s+/i.test(trimmed)) {
    return trimmed.replace(/^\d+(?:\.\d+)?\s*(?:g|gr|gramos|ml)/i, `${cleanGrams}g`);
  }

  // En cualquier otro caso, agregar el nuevo gramaje
  return `${trimmed} (${cleanGrams}g)`;
}

/**
 * Escala todos los micronutrientes proporcionales al factor de escala.
 */
export function scaleNutrients(nutrients: Micronutrients | undefined, scaleFactor: number): Micronutrients {
  if (!nutrients || typeof nutrients !== 'object') return {};
  const scaled: Micronutrients = {};

  for (const [key, val] of Object.entries(nutrients)) {
    if (val !== undefined && val !== null && typeof val === 'number') {
      // Redondear a 2 decimales para vitaminas/minerales
      (scaled as any)[key] = roundTo(val * scaleFactor, 2);
    }
  }

  return scaled;
}

/**
 * Escala un alimento individual (`FoodItem`) a un nuevo gramaje objetivo (`targetGrams`),
 * calculando proporcionalmente calorías, macros (P, C, G, Fibra) y todos los 24 micronutrientes.
 */
export function scaleFoodItem(
  food: FoodItem,
  targetGrams: number,
  baseGramsInput?: number
): FoodItem {
  const currentGrams =
    baseGramsInput ||
    food.grams ||
    parseGramsFromAmount(food.amount, food.servingGrams) ||
    100; // Si no hay referencia, asume 100g como base canónica

  if (currentGrams <= 0 || targetGrams <= 0) {
    return { ...food, grams: targetGrams };
  }

  const scaleFactor = targetGrams / currentGrams;

  const newCalories = Math.round((Number(food.calories) || 0) * scaleFactor);
  const newProtein = roundTo((Number(food.protein) || 0) * scaleFactor, 1);
  const newCarbs = roundTo((Number(food.carbs) || 0) * scaleFactor, 1);
  const newFat = roundTo((Number(food.fat) || 0) * scaleFactor, 1);
  const newFiber = food.fiber !== undefined ? roundTo((Number(food.fiber) || 0) * scaleFactor, 1) : 0;
  const newNutrients = scaleNutrients(food.nutrients, scaleFactor);
  const newAmount = formatAmountWithGrams(food.amount, targetGrams, currentGrams);

  return {
    ...food,
    amount: newAmount,
    grams: roundTo(targetGrams, 1),
    servingGrams: currentGrams,
    calories: newCalories,
    protein: newProtein,
    carbs: newCarbs,
    fat: newFat,
    fiber: newFiber,
    nutrients: newNutrients
  };
}

/**
 * Escala un alimento individual por un multiplicador directo (ej: 0.7x, 1.5x, 2x).
 */
export function scaleFoodByMultiplier(food: FoodItem, multiplier: number): FoodItem {
  if (multiplier <= 0) return { ...food };

  const currentGrams = food.grams || parseGramsFromAmount(food.amount, food.servingGrams) || 100;
  const targetGrams = roundTo(currentGrams * multiplier, 1);

  return scaleFoodItem(food, targetGrams, currentGrams);
}

/**
 * Recalcula deterministamente los totales de una comida a partir de sus alimentos.
 */
export function recalculateMealTotals(foods: FoodItem[]): {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalNutrients: Micronutrients;
} {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  const totalNutrients: Micronutrients = {};

  for (const f of foods) {
    totalCalories += Number(f.calories) || 0;
    totalProtein += Number(f.protein) || 0;
    totalCarbs += Number(f.carbs) || 0;
    totalFat += Number(f.fat) || 0;
    totalFiber += Number(f.fiber) || 0;

    if (f.nutrients) {
      for (const [key, val] of Object.entries(f.nutrients)) {
        if (typeof val === 'number' && !isNaN(val)) {
          (totalNutrients as any)[key] = ((totalNutrients as any)[key] || 0) + val;
        }
      }
    }
  }

  // Redondear totales para evitar decimales flotantes infinitos
  for (const key of Object.keys(totalNutrients)) {
    (totalNutrients as any)[key] = roundTo((totalNutrients as any)[key], 2);
  }

  return {
    totalCalories: Math.round(totalCalories),
    totalProtein: roundTo(totalProtein, 1),
    totalCarbs: roundTo(totalCarbs, 1),
    totalFat: roundTo(totalFat, 1),
    totalFiber: roundTo(totalFiber, 1),
    totalNutrients
  };
}

/**
 * Escala un plato completo (`Meal`) por un factor global (ej: 0.7 para el 70% de la comida).
 */
export function scaleMealPortion(meal: Meal, scaleFactor: number): Meal {
  const updatedFoods = meal.foods.map(f => scaleFoodByMultiplier(f, scaleFactor));
  const totals = recalculateMealTotals(updatedFoods);

  return {
    ...meal,
    foods: updatedFoods,
    ...totals
  };
}

/**
 * Convierte un objeto Meal en un bloque JSON limpio, legible y normalizado para exportar o sincronizar el editor.
 */
export function formatMealForJson(meal: Meal, allMeals?: Meal[]): string {
  if (allMeals && allMeals.length > 1) {
    const list = allMeals.map(m => cleanMealForExport(m));
    return JSON.stringify(list, null, 2);
  }
  return JSON.stringify(cleanMealForExport(meal), null, 2);
}

function cleanMealForExport(meal: Meal): Record<string, any> {
  return {
    name: meal.name,
    emoji: meal.emoji || '🍽️',
    mealType: meal.mealType || 'lunch',
    date: meal.date,
    time: meal.time || '12:00',
    totalCalories: meal.totalCalories,
    totalProtein: meal.totalProtein,
    totalCarbs: meal.totalCarbs,
    totalFat: meal.totalFat,
    totalFiber: meal.totalFiber,
    foods: (meal.foods || []).map(f => {
      const item: Record<string, any> = {
        name: f.name,
        emoji: f.emoji || '🍽️',
        amount: f.amount,
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fat: f.fat,
        fiber: f.fiber || 0
      };
      if (f.grams !== undefined) item.grams = f.grams;
      if (f.nutrients && Object.keys(f.nutrients).length > 0) item.nutrients = f.nutrients;
      return item;
    }),
    totalNutrients: meal.totalNutrients || {},
    ...(meal.biofeedback && Object.keys(meal.biofeedback).length > 0 ? { biofeedback: meal.biofeedback } : {}),
    ...(meal.healthDiagnostic ? { healthAnalysis: meal.healthDiagnostic } : {})
  };
}

