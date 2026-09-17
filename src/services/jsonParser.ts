import { FoodItem, Meal, MealType, Micronutrients } from '../types/nutrition.types';
import { getSmartFoodEmoji } from '../utils/foodEmoji';

// Helper robusto para convertir cadenas o números a flotantes limpios
export function safeNumber(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (typeof val === 'string') {
    let clean = val.trim();
    if (!clean) return 0;

    // Si viene en formato fraccional ej: "1/2", "3/4"
    if (/^\d+\/\d+$/.test(clean)) {
      const parts = clean.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      return den !== 0 ? num / den : 0;
    }

    // Reemplazar coma decimal por punto (ej: "2,5" -> "2.5")
    clean = clean.replace(/(\d+),(\d+)/g, '$1.$2');

    // Remover caracteres no numéricos excepto dígitos, punto y signo negativo
    clean = clean.replace(/[^0-9.-]+/g, '');

    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }
  return 0;
}

// Extractor tolerante a fallos para extraer JSON puro desde cualquier respuesta de ChatGPT, Claude o Gemini
export function extractJsonFromString(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let text = input.trim();

  // 1. Si contiene bloques de código markdown ```json ... ``` o ``` ... ```
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    text = codeBlockMatch[1].trim();
  }

  // 2. Si aún contiene texto conversacional previo o posterior, buscar desde el primer '{' o '[' hasta el último '}' o ']'
  const firstBrace = text.indexOf('{');
  const firstBracket = text.indexOf('[');
  
  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = text.lastIndexOf('}');
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = text.lastIndexOf(']');
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    text = text.substring(startIdx, endIdx + 1);
  }

  // 3. Limpiar trailing commas antes de llaves o corchetes de cierre (muy común en respuestas de IA)
  text = text.replace(/,\s*([\}\]])/g, '$1');

  // 4. Limpiar comentarios de una línea // ...
  text = text.replace(/\/\/.*$/gm, '');

  return text;
}

// Normaliza las claves de micronutrientes (soporta español, inglés y variantes de IA)
export function normalizeNutrients(raw: any): Micronutrients {
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

    // Perfil Lipídico
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
    'choline_mg': 'choline_mg',

    // Suplementos
    'caffeine': 'caffeine_mg',
    'cafeina': 'caffeine_mg',
    'caffeine_mg': 'caffeine_mg',

    'creatine': 'creatine_g',
    'creatina': 'creatine_g',
    'creatine_g': 'creatine_g'
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

// Normaliza un alimento individual limpiando unidades y tipos
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

  const name = item.name || item.nombre || item.food || item.alimento || item.item || `Alimento ${index + 1}`;
  const amount = item.amount || item.cantidad || item.porcion || item.portion || item.serving || '';

  // Macros directos
  let calories = safeNumber(item.calories ?? item.calorias ?? item.kcal ?? item.energy ?? item.energia);
  const protein = safeNumber(item.protein ?? item.proteina ?? item.proteinas ?? item.prot);
  const carbs = safeNumber(item.carbs ?? item.carbohidratos ?? item.hidratos ?? item.carbohydrates ?? item.ch);
  const fat = safeNumber(item.fat ?? item.grasas ?? item.grasa ?? item.fats ?? item.lipidos);
  const fiber = safeNumber(item.fiber ?? item.fibra ?? item.fibers);

  // Si no se proporcionaron calorías pero sí macros, calcular por Atwater
  if (calories === 0 && (protein > 0 || carbs > 0 || fat > 0)) {
    calories = Math.round((protein * 4) + (carbs * 4) + (fat * 9));
  }

  // Micronutrientes
  const nestedNutrients = item.nutrients || item.micronutrients || item.nutrientes || item.micros || {};
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

export interface MathVerificationReport {
  isMathematicallySound: boolean;
  foodsSumCalories: number;
  foodsSumProtein: number;
  foodsSumCarbs: number;
  foodsSumFat: number;
  foodsSumFiber: number;
  atwaterCalculatedCalories: number;
  declaredCalories: number;
  calorieDifference: number;
  discrepancies: {
    field: string;
    message: string;
    declared: number;
    calculated: number;
  }[];
}

// Verifica la lógica matemática entre ingredientes, macros totales y fórmula Atwater
export function verifyMealMath(meal: Meal, declaredTotals?: { calories?: number; protein?: number; carbs?: number; fat?: number; fiber?: number }): MathVerificationReport {
  let sumCal = 0;
  let sumP = 0;
  let sumC = 0;
  let sumF = 0;
  let sumFib = 0;

  for (const f of meal.foods) {
    sumCal += f.calories || 0;
    sumP += f.protein || 0;
    sumC += f.carbs || 0;
    sumF += f.fat || 0;
    sumFib += (f.fiber || 0);
  }

  sumCal = Math.round(sumCal);
  sumP = Math.round(sumP * 10) / 10;
  sumC = Math.round(sumC * 10) / 10;
  sumF = Math.round(sumF * 10) / 10;
  sumFib = Math.round(sumFib * 10) / 10;

  const atwaterCal = Math.round((meal.totalProtein * 4) + (meal.totalCarbs * 4) + (meal.totalFat * 9));
  const declaredCal = declaredTotals?.calories !== undefined ? declaredTotals.calories : meal.totalCalories;

  const discrepancies: MathVerificationReport['discrepancies'] = [];

  // 1. Discrepancia entre suma de ingredientes y total
  if (meal.foods.length > 0 && Math.abs(sumCal - meal.totalCalories) > Math.max(10, meal.totalCalories * 0.10)) {
    discrepancies.push({
      field: 'calories_sum',
      message: `La suma de los ingredientes da ${sumCal} kcal, pero el total declarado es ${meal.totalCalories} kcal.`,
      declared: meal.totalCalories,
      calculated: sumCal
    });
  }

  // 2. Discrepancia con fórmula Atwater (4P + 4C + 9G)
  if (meal.totalCalories > 30 && Math.abs(atwaterCal - meal.totalCalories) > Math.max(15, meal.totalCalories * 0.18)) {
    discrepancies.push({
      field: 'atwater',
      message: `El balance bioquímico 4P+4C+9G suma ${atwaterCal} kcal, difiriendo de las ${meal.totalCalories} kcal declaradas.`,
      declared: meal.totalCalories,
      calculated: atwaterCal
    });
  }

  // 3. Discrepancia de proteínas
  if (declaredTotals?.protein !== undefined && Math.abs(declaredTotals.protein - sumP) > 2) {
    discrepancies.push({
      field: 'protein',
      message: `Proteína declarada (${declaredTotals.protein}g) difiere de la suma de ingredientes (${sumP}g).`,
      declared: declaredTotals.protein,
      calculated: sumP
    });
  }

  return {
    isMathematicallySound: discrepancies.length === 0,
    foodsSumCalories: sumCal,
    foodsSumProtein: sumP,
    foodsSumCarbs: sumC,
    foodsSumFat: sumF,
    foodsSumFiber: sumFib,
    atwaterCalculatedCalories: atwaterCal,
    declaredCalories: declaredCal,
    calorieDifference: Math.abs(atwaterCal - declaredCal),
    discrepancies
  };
}

// Auto-balancea matemáticamente la comida corrigiendo cualquier error aritmético de la IA
export function autoBalanceMealMath(meal: Meal): Meal {
  let sumCal = 0;
  let sumP = 0;
  let sumC = 0;
  let sumF = 0;
  let sumFib = 0;
  const totalNutrients: Micronutrients = {};

  const balancedFoods: FoodItem[] = meal.foods.map(food => {
    const p = food.protein || 0;
    const c = food.carbs || 0;
    const f = food.fat || 0;
    const fib = food.fiber || 0;
    
    // Si las calorías del alimento no cuadran con sus macros, balancear
    const expectedFoodCal = Math.round((p * 4) + (c * 4) + (f * 9));
    const foodCal = food.calories > 0 && Math.abs(food.calories - expectedFoodCal) <= Math.max(10, food.calories * 0.15)
      ? food.calories
      : (expectedFoodCal > 0 ? expectedFoodCal : food.calories);

    sumCal += foodCal;
    sumP += p;
    sumC += c;
    sumF += f;
    sumFib += fib;

    if (food.nutrients) {
      for (const [k, v] of Object.entries(food.nutrients)) {
        const key = k as keyof Micronutrients;
        if (typeof v === 'number' && !isNaN(v)) {
          totalNutrients[key] = (totalNutrients[key] || 0) + v;
        }
      }
    }

    return {
      ...food,
      calories: foodCal
    };
  });

  // Redondear
  for (const k of Object.keys(totalNutrients)) {
    const key = k as keyof Micronutrients;
    if (totalNutrients[key] !== undefined) {
      totalNutrients[key] = Math.round((totalNutrients[key] as number) * 10) / 10;
    }
  }

  return {
    ...meal,
    foods: balancedFoods,
    totalCalories: Math.round(sumCal),
    totalProtein: Math.round(sumP * 10) / 10,
    totalCarbs: Math.round(sumC * 10) / 10,
    totalFat: Math.round(sumF * 10) / 10,
    totalFiber: Math.round(sumFib * 10) / 10,
    totalNutrients: {
      ...totalNutrients,
      ...(meal.totalNutrients || {})
    },
    updatedAt: Date.now()
  };
}

export interface ParseResult {
  success: boolean;
  meal?: Meal;
  mathReport?: MathVerificationReport;
  error?: string;
}

// Parsea un string JSON con tolerancia a fallos, extracción de texto conversacional y validación matemática
export function parseMealJson(input: string): ParseResult {
  if (!input || !input.trim()) {
    return { success: false, error: 'El contenido JSON está vacío.' };
  }

  const cleanJson = extractJsonFromString(input);
  if (!cleanJson) {
    return { success: false, error: 'No se pudo detectar una estructura JSON válida en el texto.' };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (err: any) {
    return { success: false, error: `Error de formato JSON: ${err.message}. Verifica que no haya comas de más o comillas faltantes.` };
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

      const candidateFoods = parsed.foods || parsed.alimentos || parsed.items || parsed.ingredients || parsed.ingredientes;
      if (Array.isArray(candidateFoods)) {
        foodsList = candidateFoods;
      } else if (parsed.calories !== undefined || parsed.protein !== undefined) {
        foodsList = [parsed];
      }
    } else {
      return { success: false, error: 'El formato proporcionado no es un objeto ni un arreglo JSON válido.' };
    }

    if (foodsList.length === 0) {
      return { success: false, error: 'No se encontraron alimentos en el JSON. Asegúrate de incluir la lista de ingredientes.' };
    }

    // Normalizar alimentos y limpiar unidades
    const foods: FoodItem[] = foodsList.map((item, idx) => normalizeFoodItem(item, idx));

    // Sumar totales reales de los ingredientes
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

    // Si la IA declaró totales en la raíz y la suma de alimentos es cero, usar los declarados
    if (typeof parsed === 'object' && parsed !== null) {
      const declaredCal = safeNumber(parsed.totalCalories ?? parsed.calories ?? parsed.calorias ?? parsed.kcal);
      const declaredProt = safeNumber(parsed.totalProtein ?? parsed.protein ?? parsed.proteina);
      const declaredCarbs = safeNumber(parsed.totalCarbs ?? parsed.carbs ?? parsed.carbohidratos);
      const declaredFat = safeNumber(parsed.totalFat ?? parsed.fat ?? parsed.grasa);
      const declaredFiber = safeNumber(parsed.totalFiber ?? parsed.fiber ?? parsed.fibra);

      if (totalCalories === 0 && declaredCal > 0) totalCalories = declaredCal;
      if (totalProtein === 0 && declaredProt > 0) totalProtein = declaredProt;
      if (totalCarbs === 0 && declaredCarbs > 0) totalCarbs = declaredCarbs;
      if (totalFat === 0 && declaredFat > 0) totalFat = declaredFat;
      if (totalFiber === 0 && declaredFiber > 0) totalFiber = declaredFiber;

      // Fusionar micronutrientes declarados a nivel raíz
      if (parsed.totalNutrients) {
        const normalizedAiTotals = normalizeNutrients(parsed.totalNutrients);
        for (const [k, v] of Object.entries(normalizedAiTotals)) {
          const key = k as keyof Micronutrients;
          if (typeof v === 'number' && !isNaN(v)) {
            totalNutrients[key] = v;
          }
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

    const mathReport = verifyMealMath(meal, typeof parsed === 'object' ? {
      calories: safeNumber(parsed.totalCalories ?? parsed.calories),
      protein: safeNumber(parsed.totalProtein ?? parsed.protein),
      carbs: safeNumber(parsed.totalCarbs ?? parsed.carbs),
      fat: safeNumber(parsed.totalFat ?? parsed.fat),
      fiber: safeNumber(parsed.totalFiber ?? parsed.fiber)
    } : undefined);

    return { success: true, meal, mathReport };
  } catch (err: any) {
    return { success: false, error: `Error procesando datos nutricionales: ${err.message}` };
  }
}
