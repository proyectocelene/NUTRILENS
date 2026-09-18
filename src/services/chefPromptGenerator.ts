import { DailyNutritionSummary, NutritionGoals } from '../types/nutrition.types';
import { getLocalDateString } from '../utils/dateUtils';

interface ChefPromptOptions {
  dailySummary: DailyNutritionSummary;
  goals: NutritionGoals;
  currentTime?: string;
  userCravingsOrFridge?: string;
  nextMealType?: string; // ej: "cena", "snack", "comida"
}

/**
 * Genera un prompt científico, hiper-personalizado y con nivel de Chef Ejecutivo
 * que incluye la bitácora del día, la hora actual y los macros exactos restantes.
 */
export function buildChefRecommendationPrompt({
  dailySummary,
  goals,
  currentTime = new Date().toTimeString().slice(0, 5),
  userCravingsOrFridge = '',
  nextMealType = 'siguiente comida'
}: ChefPromptOptions): string {
  const remCalories = Math.max(0, goals.calories - dailySummary.totalCalories);
  const remProtein = Math.max(0, Math.round((goals.protein - dailySummary.totalProtein) * 10) / 10);
  const remCarbs = Math.max(0, Math.round((goals.carbs - dailySummary.totalCarbs) * 10) / 10);
  const remFat = Math.max(0, Math.round((goals.fat - dailySummary.totalFat) * 10) / 10);
  const remFiber = Math.max(0, Math.round((goals.fiber - dailySummary.totalFiber) * 10) / 10);

  // Bitácora de lo comido hoy
  let mealsLogText = '';
  if (dailySummary.meals.length === 0) {
    mealsLogText = '*(Aún no he registrado comidas en la app el día de hoy)*';
  } else {
    mealsLogText = dailySummary.meals
      .map((m, idx) => {
        const foodsStr = m.foods
          .map(f => `${f.amount ? f.amount + ' ' : ''}${f.name} (${f.calories} kcal)`)
          .join(', ');
        return `${idx + 1}. ${m.emoji || '🍽️'} ${m.name}${m.time ? ` [${m.time}]` : ''}: ${m.totalCalories} kcal | ${m.totalProtein}g P | ${m.totalCarbs}g C | ${m.totalFat}g G.\n   Ingredientes: ${foodsStr || 'No especificados'}`;
      })
      .join('\n');
  }

  const prompt = `Actúa como mi Nutricionista Clínico Deportivo y Chef Ejecutivo de Alta Cocina especializado en Recomposición Corporal y Bioquímica Nutricional.

=======================================================
CONTEXTO TEMPORAL Y OBJETIVO
=======================================================
- Fecha: ${getLocalDateString()}
- Hora actual del día: ${currentTime}
- Próxima comida planeada: ${nextMealType}
- Protocolo actual: Adonis Recomposición (Objetivo: hipertrofia magra, pérdida de grasa visceral, máxima saciedad y salud metabólica).
- Metas diarias programadas: ${goals.calories} kcal | ${goals.protein}g Proteína | ${goals.carbs}g Carbohidratos | ${goals.fat}g Grasas | ${goals.fiber}g Fibra.

=======================================================
BITÁCORA DE LO CONSUMIDO HOY HASTA ESTE MOMENTO (${currentTime})
=======================================================
${mealsLogText}

=======================================================
BALANCE NUTRICIONAL ACUMULADO Y DÉFICIT RESTANTE HOY
=======================================================
• CALORÍAS: ${dailySummary.totalCalories} / ${goals.calories} kcal  ➜  RESTAN: ~${remCalories} kcal
• PROTEÍNA: ${dailySummary.totalProtein}g / ${goals.protein}g  ➜  RESTAN: ~${remProtein}g
• CARBOHIDRATOS: ${dailySummary.totalCarbs}g / ${goals.carbs}g  ➜  RESTAN: ~${remCarbs}g
• GRASAS: ${dailySummary.totalFat}g / ${goals.fat}g  ➜  RESTAN: ~${remFat}g
• FIBRA: ${dailySummary.totalFiber}g / ${goals.fiber}g  ➜  RESTAN: ~${remFiber}g
• SODIO CONSUMIDO: ${Math.round(dailySummary.totalNutrients.sodium_mg || 0)} mg
• CAFEÍNA CONSUMIDA: ${Math.round(dailySummary.totalNutrients.caffeine_mg || 0)} mg

${userCravingsOrFridge.trim() ? `=======================================================
PREFERENCIAS O INGREDIENTES EN CASA:
"${userCravingsOrFridge.trim()}"
=======================================================` : ''}

=======================================================
TU MISIÓN COMO CHEF & NUTRICIONISTA:
=======================================================
Considerando que son las ${currentTime}, propón 2 opciones realistas, rápidas y saciantes que cubran con máxima precisión matemática los macros que me faltan (~${remCalories} kcal, ~${remProtein}g Proteína, ~${remCarbs}g Carbos, ~${remFat}g Grasa):

1. JUSTIFICACIÓN BIOQUÍMICA Y CRONOBIOLOGÍA:
   - Explica brevemente por qué estos alimentos son ideales a esta hora (${currentTime}), considerando digestión nocturna, ventana de síntesis proteica (MPS) y saciedad.
2. TÉCNICA CULINARIA DEL CHEF:
   - Instrucciones precisas de sazón, texturas y método de cocción (airfryer, sartén, vapor, etc.) para que quede con sabor de restaurante sin añadir calorías invisibles.
3. TIPS DE SALUD Y VARIANTES:
   - Tips para maximizar la absorción de micronutrientes y cómo hacerlo aún más saludable.
4. BLOQUE JSON EN FORMATO NUTRILENS (MANDATORIO):
   - Para la Opción 1 recomendada, entrega ÚNICA Y EXCLUSIVAMENTE el bloque JSON en formato NutriLens para que yo pueda copiarlo y pegarlo directamente en mi app:

\`\`\`json
{
  "name": "Nombre gourmet y descriptivo de la comida",
  "emoji": "🍽️",
  "mealType": "${nextMealType === 'siguiente comida' ? 'dinner' : nextMealType}",
  "date": "${getLocalDateString()}",
  "time": "${currentTime}",
  "totalCalories": ${remCalories},
  "totalProtein": ${remProtein},
  "totalCarbs": ${remCarbs},
  "totalFat": ${remFat},
  "totalFiber": ${remFiber},
  "foods": [
    {
      "name": "Nombre alimento 1",
      "emoji": "🥩",
      "amount": "200g",
      "calories": 0,
      "protein": 0,
      "carbs": 0,
      "fat": 0,
      "fiber": 0,
      "nutrients": {
        "saturated_fat_g": 0,
        "monounsaturated_fat_g": 0,
        "polyunsaturated_fat_g": 0,
        "trans_fat_g": 0,
        "omega3_g": 0,
        "cholesterol_mg": 0,
        "sodium_mg": 0,
        "potassium_mg": 0,
        "magnesium_mg": 0,
        "iron_mg": 0,
        "zinc_mg": 0,
        "sugar_g": 0
      }
    }
  ],
  "healthAnalysis": {
    "score": 90,
    "diagnosis": "Diagnóstico de la comida recomendada...",
    "pros": ["Alto en leucina", "Grasas monoinsaturadas"],
    "cons": ["Atención al sodio"],
    "tips": ["Tip del chef para mejorar sabor o digestión"],
    "healthierAlternatives": "Alternativa de preparación"
  }
}
\`\`\``;

  return prompt;
}
