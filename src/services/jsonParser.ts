import { FoodItem, Meal, MealType, Micronutrients } from '../types/nutrition.types';
import { getSmartFoodEmoji } from '../utils/foodEmoji';

// Helper para convertir cadenas o números de forma segura
function safeNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    // Remover unidades tipo "g", "mg", "kcal", "mcg", "iu"
    const cleaned = val.replace(/[^0-9.-]+/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Normaliza las claves de micronutrientes (soporta español, inglés y variantes)
function normalizeNutrients(raw: any): Micronutrients {
  if (!raw || typeof raw !== 'object') return {};
  const n: Micronutrients = {};

  const keyMap: Record<string, keyof Micronutrients> = {
    // Vitaminas
    'vitamin_a': 'vitamin_a_mcg',
    'vitamina_a': 'vitamin_a_mcg',
    'vitamin_a_mcg': 'vitamin_a_mcg',
    'vit_a': 'vitamin_a_mcg',

    'vitamin_c': 'vitamin_c_mg',
    'vitamina_c': 'vitamin_c_mg',
    'vitamin_c_mg': 'vitamin_c_mg',
    'vit_c': 'vitamin_c_mg',

    'vitamin_d': 'vitamin_d_iu',
    'vitamina_d': 'vitamin_d_iu',
    'vitamin_d_iu': 'vitamin_d_iu',
    'vit_d': 'vitamin_d_iu',

    'vitamin_e': 'vitamin_e_mg',
    'vitamina_e': 'vitamin_e_mg',
    'vitamin_e_mg': 'vitamin_e_mg',

    'vitamin_k': 'vitamin_k_mcg',
    'vitamina_k': 'vitamin_k_mcg',
    'vitamin_k_mcg': 'vitamin_k_mcg',

    'vitamin_b1': 'vitamin_b1_mg',
    'tiamina': 'vitamin_b1_mg',
    'vitamin_b2': 'vitamin_b2_mg',
    'riboflavina': 'vitamin_b2_mg',
    'vitamin_b3': 'vitamin_b3_mg',
    'niacina': 'vitamin_b3_mg',
    'vitamin_b6': 'vitamin_b6_mg',
    'vitamin_b6_mg': 'vitamin_b6_mg',
    'vitamin_b12': 'vitamin_b12_mcg',
    'vitamin_b12_mcg': 'vitamin_b12_mcg',
    'vitamina_b12': 'vitamin_b12_mcg',
    'folate': 'folate_mcg',
    'folatos': 'folate_mcg',
    'acido_folico': 'folate_mcg',
    'folate_mcg': 'folate_mcg',

    // Minerales
    'calcium': 'calcium_mg',
    'calcio': 'calcium_mg',
    'calcium_mg': 'calcium_mg',

    'iron': 'iron_mg',
    'hierro': 'iron_mg',
    'iron_mg': 'iron_mg',

    'magnesium': 'magnesium_mg',
    'magnesio': 'magnesium_mg',
    'magnesium_mg': 'magnesium_mg',

    'potassium': 'potassium_mg',
    'potasio': 'potassium_mg',
    'potassium_mg': 'potassium_mg',

    'sodium': 'sodium_mg',
    'sodio': 'sodium_mg',
    'sodium_mg': 'sodium_mg',

    'zinc': 'zinc_mg',
    'zinc_mg': 'zinc_mg',

    'phosphorus': 'phosphorus_mg',
    'fosforo': 'phosphorus_mg',
    'phosphorus_mg': 'phosphorus_mg',

    'selenium': 'selenium_mcg',
    'selenio': 'selenium_mcg',
    'selenium_mcg': 'selenium_mcg',

    // Perfil Lipídico Completo y Otros
    'cholesterol': 'cholesterol_mg',
    'colesterol': 'cholesterol_mg',
    'cholesterol_mg': 'cholesterol_mg',
    
    'sugar': 'sugar_g',
    'azucar': 'sugar_g',
    'azucares': 'sugar_g',
    'azucares_totales': 'sugar_g',
    'sugar_g': 'sugar_g',
    
    'saturated_fat': 'saturated_fat_g',
    'saturated_fat_g': 'saturated_fat_g',
    'grasas_saturadas': 'saturated_fat_g',
    'grasa_saturada': 'saturated_fat_g',
    
    'monounsaturated_fat': 'monounsaturated_fat_g',
    'monounsaturated_fat_g': 'monounsaturated_fat_g',
    'grasas_monoinsaturadas': 'monounsaturated_fat_g',
    'grasa_monoinsaturada': 'monounsaturated_fat_g',
    
    'polyunsaturated_fat': 'polyunsaturated_fat_g',
    'polyunsaturated_fat_g': 'polyunsaturated_fat_g',
    'grasas_poliinsaturadas': 'polyunsaturated_fat_g',
    'grasa_poliinsaturada': 'polyunsaturated_fat_g',
    
    'trans_fat': 'trans_fat_g',
    'trans_fat_g': 'trans_fat_g',
    'grasas_trans': 'trans_fat_g',
    'grasa_trans': 'trans_fat_g',
    
    'omega3': 'omega3_g',
    'omega_3': 'omega3_g',
    'omega3_g': 'omega3_g',
    'acidos_grasos_omega_3': 'omega3_g',
    
    'choline': 'choline_mg',
    'colina': 'choline_mg',
    'choline_mg': 'choline_mg'
  };

  for (const [rawKey, rawVal] of Object.entries(raw)) {
    const cleanKey = rawKey.toLowerCase().trim();
    const mapped = keyMap[cleanKey];
    if (mapped) {
      n[mapped] = safeNumber(rawVal);
    }
  }

  return n;
}

// Normaliza un alimento individual
export function normalizeFoodItem(item: any, index: number = 0): FoodItem {
  if (!item || typeof item !== 'object') {
    return {
      id: `food_${Date.now()}_${index}`,
      name: `Alimento ${index + 1}`,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    };
  }

  // Nombre
  const name = item.name || item.nombre || item.food || item.alimento || item.item || `Alimento ${index + 1}`;
  const amount = item.amount || item.cantidad || item.porcion || item.portion || item.serving || '';

  // Macros directos
  const calories = safeNumber(item.calories ?? item.calorias ?? item.kcal ?? item.energy ?? item.energia);
  const protein = safeNumber(item.protein ?? item.proteina ?? item.proteinas ?? item.prot);
  const carbs = safeNumber(item.carbs ?? item.carbohidratos ?? item.hidratos ?? item.carbohydrates ?? item.ch);
  const fat = safeNumber(item.fat ?? item.grasas ?? item.grasa ?? item.fats ?? item.lipidos);
  const fiber = safeNumber(item.fiber ?? item.fibra ?? item.fibers);

  // Micronutrientes (pueden venir en objeto .nutrients, .micronutrients, .micros o en la raíz)
  const nestedNutrients = item.nutrients || item.micronutrients || item.nutrientes || item.micros || {};
  // Extraer también cualquier clave nutricional que esté en el nivel raíz del alimento
  const rootNutrients = normalizeNutrients(item);
  const mergedNutrients = {
    ...rootNutrients,
    ...normalizeNutrients(nestedNutrients)
  };

  const cleanName = String(name).trim();
  return {
    id: item.id || `food_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: cleanName,
    emoji: item.emoji || getSmartFoodEmoji(cleanName),
    amount: String(amount).trim(),
    calories: Math.round(calories * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    carbs: Math.round(carbs * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fiber * 10) / 10,
    nutrients: mergedNutrients,
    category: item.category || item.categoria || undefined,
    notes: item.notes || item.notas || undefined
  };
}

export interface ParseResult {
  success: boolean;
  meal?: Meal;
  error?: string;
}

// Parsea un string JSON o texto con soporte tolerante a fallos
export function parseMealJson(input: string): ParseResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'El contenido JSON está vacío.' };
  }

  let parsed: any;
  try {
    // Intenta parsear directamente
    parsed = JSON.parse(input);
  } catch (err: any) {
    // Si falla, intenta limpiar bloques de markdown ```json ... ```
    const match = input.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        parsed = JSON.parse(match[1]);
      } catch (innerErr: any) {
        return { success: false, error: `Error de sintaxis JSON: ${innerErr.message}` };
      }
    } else {
      return { success: false, error: `Error de sintaxis JSON: ${err.message}` };
    }
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    let mealName = 'Comida Registrada';
    let mealType: MealType = 'lunch';
    let date = today;
    let time = nowTime;
    let notes = '';
    let foodsList: any[] = [];

    if (Array.isArray(parsed)) {
      // Es un arreglo directo de alimentos
      foodsList = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      mealName = parsed.name || parsed.nombre || parsed.title || parsed.titulo || 'Comida Registrada';
      
      const rawMealType = (parsed.mealType || parsed.meal_type || parsed.tipo || parsed.tipoComida || 'lunch').toLowerCase();
      if (['breakfast', 'desayuno'].includes(rawMealType)) mealType = 'breakfast';
      else if (['lunch', 'almuerzo', 'comida'].includes(rawMealType)) mealType = 'lunch';
      else if (['dinner', 'cena'].includes(rawMealType)) mealType = 'dinner';
      else if (['snack', 'merienda', 'tentempie', 'colacion'].includes(rawMealType)) mealType = 'snack';
      else mealType = 'other';

      date = parsed.date || parsed.fecha || today;
      time = parsed.time || parsed.hora || nowTime;
      notes = parsed.notes || parsed.notas || parsed.descripcion || '';

      // Alimentos pueden estar en .foods, .alimentos, .items, .ingredientes, .ingredients
      const candidateFoods = parsed.foods || parsed.alimentos || parsed.items || parsed.ingredients || parsed.ingredientes;
      if (Array.isArray(candidateFoods)) {
        foodsList = candidateFoods;
      } else if (parsed.calories !== undefined || parsed.protein !== undefined) {
        // Es un solo alimento o resumen directo
        foodsList = [parsed];
      }
    } else {
      return { success: false, error: 'El formato proporcionado no es un objeto ni un arreglo JSON válido.' };
    }

    if (foodsList.length === 0) {
      return { success: false, error: 'No se encontraron alimentos en el JSON. Asegúrate de incluir la lista de ingredientes o alimentos.' };
    }

    // Normalizar alimentos
    const foods: FoodItem[] = foodsList.map((item, idx) => normalizeFoodItem(item, idx));

    // Sumar totales
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    const totalNutrients: Micronutrients = {};

    for (const food of foods) {
      totalCalories += food.calories;
      totalProtein += food.protein;
      totalCarbs += food.carbs;
      totalFat += food.fat;
      totalFiber += (food.fiber || 0);

      if (food.nutrients) {
        for (const [k, v] of Object.entries(food.nutrients)) {
          const key = k as keyof Micronutrients;
          if (typeof v === 'number' && !isNaN(v)) {
            totalNutrients[key] = (totalNutrients[key] || 0) + v;
          }
        }
      }
    }

    // Si la IA devolvió totalNutrients calculado a nivel plato, fusionar con prioridad
    if (typeof parsed === 'object' && parsed !== null && parsed.totalNutrients) {
      const normalizedAiTotals = normalizeNutrients(parsed.totalNutrients);
      for (const [k, v] of Object.entries(normalizedAiTotals)) {
        const key = k as keyof Micronutrients;
        if (typeof v === 'number' && !isNaN(v)) {
          totalNutrients[key] = v;
        }
      }
    }

    // Redondear totales
    for (const k of Object.keys(totalNutrients)) {
      const key = k as keyof Micronutrients;
      if (totalNutrients[key] !== undefined) {
        totalNutrients[key] = Math.round((totalNutrients[key] as number) * 10) / 10;
      }
    }

    const meal: Meal = {
      id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: mealName,
      emoji: (typeof parsed === 'object' && parsed?.emoji) ? parsed.emoji : getSmartFoodEmoji(mealName, mealType),
      mealType,
      date,
      time,
      foods,
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 10) / 10,
      totalCarbs: Math.round(totalCarbs * 10) / 10,
      totalFat: Math.round(totalFat * 10) / 10,
      totalFiber: Math.round(totalFiber * 10) / 10,
      totalNutrients,
      notes: notes || undefined,
      sourceJson: input,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    return { success: true, meal };
  } catch (err: any) {
    return { success: false, error: `Error procesando datos nutricionales: ${err.message}` };
  }
}
