import { Meal, CanonicalFood } from '../types/nutrition.types';
import { parseMealJson } from './jsonParser';
import { db } from '../db';

const LOCAL_STORAGE_GEMINI_KEY = 'nutrilens_gemini_api_key';
const LOCAL_STORAGE_GEMINI_MODEL = 'nutrilens_gemini_model';
const LOCAL_STORAGE_DEEPSEEK_KEY = 'nutrilens_deepseek_api_key';
const LOCAL_STORAGE_DEEPSEEK_MODEL = 'nutrilens_deepseek_model';
const LOCAL_STORAGE_AI_PROVIDER = 'nutrilens_ai_provider'; // 'hybrid' | 'deepseek' | 'gemini'

export const getStoredGeminiApiKey = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
};

export const setStoredGeminiApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
  }
};

export const getStoredDeepSeekApiKey = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_DEEPSEEK_KEY) || (import.meta as any).env?.VITE_DEEPSEEK_API_KEY || '';
};

export const setStoredDeepSeekApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem(LOCAL_STORAGE_DEEPSEEK_KEY, key.trim());
  } else {
    localStorage.removeItem(LOCAL_STORAGE_DEEPSEEK_KEY);
  }
};

export const getStoredAiProvider = (): 'hybrid' | 'deepseek' | 'gemini' => {
  return (localStorage.getItem(LOCAL_STORAGE_AI_PROVIDER) as any) || 'hybrid';
};

export const setStoredAiProvider = (provider: 'hybrid' | 'deepseek' | 'gemini'): void => {
  localStorage.setItem(LOCAL_STORAGE_AI_PROVIDER, provider);
};

export const DEEPSEEK_FALLBACK_CHAIN = [
  'deepseek-v4-pro',      // 1. DeepSeek V4 Pro (Máxima capacidad y velocidad ~300ms)
  'deepseek-v4-flash',    // 2. DeepSeek V4 Flash
  'deepseek-chat',        // 3. DeepSeek V3 Chat Estable
  'deepseek-reasoner'     // 4. DeepSeek R1 Razonamiento
];

export const GEMINI_FALLBACK_CHAIN = [
  'gemini-2.5-flash-lite', // 1. Flash Lite 2.5 (Latencia mínima)
  'gemini-flash-latest',   // 2. Flash Latest
  'gemini-2.5-flash',      // 3. Flash 2.5 Producción
  'gemini-3.7-flash'       // 4. Flash 3.7
];

export const getStoredDeepSeekModel = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_DEEPSEEK_MODEL) || 'deepseek-v4-pro';
};

export const setStoredDeepSeekModel = (model: string): void => {
  localStorage.setItem(LOCAL_STORAGE_DEEPSEEK_MODEL, model);
};

export const getStoredGeminiModel = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_GEMINI_MODEL) || 'gemini-2.5-flash-lite';
};

export const setStoredGeminiModel = (model: string): void => {
  localStorage.setItem(LOCAL_STORAGE_GEMINI_MODEL, model);
};

export interface ConversationTurn {
  role: 'user' | 'model' | 'assistant';
  text?: string;
  image?: string;
}

export interface AiAnalysisResult {
  success: boolean;
  meal?: Meal;
  rawJson?: string;
  clarificationQuestions?: string[];
  quickSuggestions?: string[];
  nutritionalFeedback?: string;
  modelUsed?: string;
  error?: string;
}

const buildSystemInstruction = (canonicalList: CanonicalFood[]): string => {
  let canonContext = '';
  if (canonicalList.length > 0) {
    canonContext = `\n\nTABLA CANÓNICA PERSONAL DEL USUARIO (PRIORIDAD MÁXIMA - Si el usuario menciona alguno de estos productos o marcas, USA EXACTAMENTE sus porciones y nutrientes):\n` +
      canonicalList.map(c => {
        return `- ${c.name} (${c.brand || 'Marca'}) [Porción: ${c.servingSize}]: ${c.calories} kcal | ${c.protein}g Proteína | ${c.carbs}g Carbos | ${c.fat}g Grasa | ${c.fiber}g Fibra. Nutrientes clave: ${JSON.stringify(c.nutrients)}`;
      }).join('\n');
  }

  return `Eres NutriLens AI, el analizador nutricional y bioquímico más estricto, determinista y exacto del mundo.
Te basas rigurosamente en las tablas oficiales de composición de alimentos (USDA FoodData Central, BEDCA española, FNDDS y tablas nutricionales de etiquetado oficial).${canonContext}

REGLAS FUNDAMENTALES DE EXACTITUD Y VERACIDAD NUTRICIONAL:
1. DESGLOSE INTEGRAL DE LÍPIDOS Y TODOS LOS NUTRIENTES (PROHIBIDO IGNORAR O DEJAR EN CERO SI EL ALIMENTO LOS CONTIENE):
   - Grasas y Colesterol:
     * saturated_fat_g: Grasas saturadas.
     * monounsaturated_fat_g: Grasas monoinsaturadas (aceite de oliva, aguacate, frutos secos, huevo).
     * polyunsaturated_fat_g: Grasas poliinsaturadas.
     * trans_fat_g: Grasas trans (0g en alimentos no procesados).
     * omega3_g: Ácidos grasos Omega 3 en gramos (huevo: ~0.15g, salmón 100g: ~2.2g, chía/nueces, cápsulas).
     * cholesterol_mg: Colesterol dietético en mg (1 huevo: ~186mg, 100g pollo: ~85mg).
     * choline_mg: Colina en mg (1 huevo: ~147mg, carnes, lácteos).
     * sugar_g: Azúcares simples en gramos.
   - Minerales: iron_mg, magnesium_mg, potassium_mg, calcium_mg, zinc_mg, sodium_mg, phosphorus_mg, selenium_mcg.
   - Vitaminas: vitamin_c_mg, vitamin_d_iu, vitamin_a_mcg, vitamin_b12_mcg, vitamin_b6_mg, folate_mcg, vitamin_e_mg, vitamin_k_mcg.

2. TABLA CANÓNICA BASE DE PRODUCTOS HABITUALES:
   * Pan Bimbo Cero Cero Multigrano (2 rebanadas / 60g): 140 kcal | 7g Proteína | 23g Carbos | 1.5g Grasa (0.2g Sat, 0.4g Mono, 0.7g Poli) | 3.5g Fibra | 180mg Sodio.
   * Huevo entero fresco (2 piezas / ~100g): 144 kcal | 12.6g Proteína | 0.8g Carbos | 9.6g Grasa (3.1g Sat, 3.8g Mono, 1.4g Poli, 0.3g Omega3) | 372mg Colesterol | 294mg Colina | 82 UI Vit D | 1.8mg Hierro | 140mg Sodio.
   * Clara de huevo pasteurizada (50g / ~1.5 claras): 26 kcal | 5.5g Proteína | 0.4g Carbos | 0.1g Grasa | 0mg Colesterol | 83mg Sodio.
   * Jamón de pavo pechuga (2 rebanadas / 40g): 42 kcal | 7g Proteína | 1g Carbos | 1g Grasa (0.3g Sat) | 25mg Colesterol | 380mg Sodio.
   * Queso Panela bajo en grasa (1 rebanada / 30g): 51 kcal | 5.4g Proteína | 1.2g Carbos | 2.7g Grasa (1.6g Sat) | 15mg Colesterol | 165mg Calcio | 150mg Sodio.
   * Leche Alpura Proteína / Pro (1 vaso / 240ml): 110 kcal | 12g Proteína | 8.6g Carbos | 1.8g Grasa (1.1g Sat) | 8mg Colesterol | 360mg Calcio | 120 UI Vit D | 380mg Potasio | 120mg Sodio.
   * Café negro sin azúcar (1 taza / 240ml): 2 kcal | 0.3g Proteína | 0g Carbos | 0g Grasa | 116mg Potasio.
   * Aceite vegetal de cocina (1 cdta / 5g): 44 kcal | 0g Proteína | 0g Carbos | 5g Grasa (0.7g Sat, 1.4g Mono, 2.7g Poli).
   * Pechuga de pollo cocida (100g): 165 kcal | 31g Proteína | 0g Carbos | 3.6g Grasa (1.0g Sat, 1.2g Mono, 0.8g Poli) | 85mg Colesterol | 85mg Colina | 334mg Potasio.
   * Arroz blanco cocido (100g): 130 kcal | 2.7g Proteína | 28.2g Carbos | 0.3g Grasa | 0.8g Fibra.
   * Aguacate Hass (100g): 160 kcal | 2g Proteína | 8.5g Carbos | 14.7g Grasa (2.1g Sat, 9.8g Mono, 1.8g Poli, 0.1g Omega3) | 6.7g Fibra | 485mg Potasio.
   * Powerade / Bebida deportiva (1000ml): 240 kcal | 0g Proteína | 60g Carbos | 0g Grasa | 500mg Sodio | 125mg Potasio.
   * Creatina Monohidratada (5g): 0 kcal (o 20 kcal amino), 0g grasa, 0g carbos.

3. MATEMÁTICA Y BALANCE DETERMINISTA:
   - totalCalories = (totalProtein * 4) + (totalCarbs * 4) + (totalFat * 9).
   - totalNutrients es la suma de los nutrientes de cada ítem en foods.

ESTRUCTURA DE RESPUESTA JSON ESTRICTA:
{
  "meal": {
    "name": "Nombre descriptivo del plato o suplemento",
    "emoji": "Emoji representativo del plato (ej: 🥪 para sándwich, 🍳 para huevos, 🥤 para bebida, 🥗 para ensalada, 🥩 para carne)",
    "mealType": "breakfast" | "lunch" | "dinner" | "snack" | "other",
    "date": "YYYY-MM-DD",
    "time": "HH:MM",
    "totalCalories": número,
    "totalProtein": número,
    "totalCarbs": número,
    "totalFat": número,
    "totalFiber": número,
    "foods": [
      {
        "name": "Nombre del alimento o suplemento",
        "emoji": "Emoji del ingrediente (ej: 🍞, 🥚, 🦃, 🧀, 🥛, ☕, 🫒)",
        "amount": "Cantidad (ej: 2 piezas (~100g), 200ml)",
        "calories": número,
        "protein": número,
        "carbs": número,
        "fat": número,
        "fiber": número,
        "nutrients": {
          "saturated_fat_g": número,
          "monounsaturated_fat_g": número,
          "polyunsaturated_fat_g": número,
          "trans_fat_g": número,
          "omega3_g": número,
          "cholesterol_mg": número,
          "sugar_g": número,
          "choline_mg": número,
          "iron_mg": número,
          "magnesium_mg": número,
          "potassium_mg": número,
          "calcium_mg": número,
          "zinc_mg": número,
          "sodium_mg": número,
          "vitamin_c_mg": número,
          "vitamin_d_iu": número,
          "vitamin_a_mcg": número,
          "vitamin_b12_mcg": número,
          "vitamin_b6_mg": número,
          "folate_mcg": número,
          "vitamin_e_mg": número,
          "vitamin_k_mcg": número,
          "selenium_mcg": número,
          "phosphorus_mg": número
        }
      }
    ],
    "totalNutrients": {
      "saturated_fat_g": número,
      "monounsaturated_fat_g": número,
      "polyunsaturated_fat_g": número,
      "trans_fat_g": número,
      "omega3_g": número,
      "cholesterol_mg": número,
      "sugar_g": número,
      "choline_mg": número,
      "iron_mg": número,
      "magnesium_mg": número,
      "potassium_mg": número,
      "calcium_mg": número,
      "zinc_mg": número,
      "sodium_mg": número,
      "vitamin_c_mg": número,
      "vitamin_d_iu": número,
      "vitamin_a_mcg": número,
      "vitamin_b12_mcg": número,
      "vitamin_b6_mg": número,
      "folate_mcg": número,
      "vitamin_e_mg": número,
      "vitamin_k_mcg": número,
      "selenium_mcg": número,
      "phosphorus_mg": número
    }
  },
  "clarificationQuestions": [],
  "quickSuggestions": [],
  "nutritionalFeedback": "Breve explicación científica sobre el balance de macronutrientes, perfil de grasas (omega 3 / saturadas) y biodisponibilidad."
}`;
};

// Llamada a la API de DeepSeek V4 / V3
async function callDeepSeekApi(
  promptText: string,
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<{ text?: string; error?: string }> {
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: promptText }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.0
      }),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    return { text };
  } catch (e: any) {
    return { error: e.message || 'Error de red con DeepSeek' };
  }
}

// Llamada a la API de Gemini (Google AI Studio)
async function callGeminiApi(
  payload: any,
  model: string,
  apiKey: string
): Promise<{ text?: string; error?: string }> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return { error: errData.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return { text };
  } catch (e: any) {
    return { error: e.message || 'Error de red con Gemini' };
  }
}

export async function analyzeFoodWithAI(
  promptText: string,
  imageSrc?: string | null,
  conversationHistory: ConversationTurn[] = [],
  modelOverride?: string,
  targetDate?: string,
  targetTime?: string
): Promise<AiAnalysisResult> {
  const deepSeekKey = getStoredDeepSeekApiKey();
  const geminiKey = getStoredGeminiApiKey();
  const providerPref = getStoredAiProvider();

  // Obtener la tabla canónica del usuario desde la base de datos local
  let canonicalFoods: CanonicalFood[] = [];
  try {
    canonicalFoods = await db.canonicalFoods.toArray();
  } catch (e) {}

  const systemInstruction = buildSystemInstruction(canonicalFoods);
  const todayStr = targetDate || new Date().toISOString().split('T')[0];
  const nowTime = targetTime || new Date().toTimeString().slice(0, 5);
  const promptWithContext = `Fecha de consumo: ${todayStr}, Hora: ${nowTime}.\n${promptText || 'Analiza los alimentos o suplementos presentes, calculando porciones y desglosando todos los lípidos, vitaminas y minerales.'}`;

  // 1. MODO TEXTO CON DEEPSEEK (Si no hay imagen y DeepSeek está habilitado)
  const isImagePresent = !!imageSrc;
  const shouldUseDeepSeek = !isImagePresent && (providerPref === 'deepseek' || providerPref === 'hybrid') && !!deepSeekKey;

  if (shouldUseDeepSeek) {
    const dsModels = modelOverride && modelOverride.startsWith('deepseek') 
      ? [modelOverride, ...DEEPSEEK_FALLBACK_CHAIN.filter(m => m !== modelOverride)]
      : DEEPSEEK_FALLBACK_CHAIN;

    for (const dsModel of dsModels) {
      const res = await callDeepSeekApi(promptWithContext, systemInstruction, dsModel, deepSeekKey);
      if (res.text) {
        try {
          const parsed = JSON.parse(res.text);
          const rawMeal = parsed.meal || parsed;
          if (targetDate) rawMeal.date = targetDate;
          if (targetTime) rawMeal.time = targetTime;

          const parsedResult = parseMealJson(JSON.stringify(rawMeal));
          if (parsedResult.success && parsedResult.meal) {
            parsedResult.meal.originalPrompt = promptText;
            parsedResult.meal.aiModelUsed = dsModel;
            parsedResult.meal.aiFeedback = parsed.nutritionalFeedback || '';

            return {
              success: true,
              meal: parsedResult.meal,
              rawJson: JSON.stringify(parsedResult.meal, null, 2),
              clarificationQuestions: parsed.clarificationQuestions || [],
              quickSuggestions: parsed.quickSuggestions || [],
              nutritionalFeedback: parsed.nutritionalFeedback || '',
              modelUsed: dsModel
            };
          }
        } catch (e) {}
      }
    }
  }

  // 2. MODO GEMINI (Para fotos o como fallback de alta resiliencia)
  if (!geminiKey) {
    return {
      success: false,
      error: 'No se encontró API Key configurada. Por favor configura tu clave de DeepSeek o Gemini en Ajustes.'
    };
  }

  const geminiModels = modelOverride && modelOverride.startsWith('gemini')
    ? [modelOverride, ...GEMINI_FALLBACK_CHAIN.filter(m => m !== modelOverride)]
    : GEMINI_FALLBACK_CHAIN;

  const contents: any[] = [];
  for (const turn of conversationHistory) {
    const parts: any[] = [];
    if (turn.image) {
      const mimeMatch = turn.image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (mimeMatch) {
        parts.push({
          inlineData: { mimeType: mimeMatch[1], data: mimeMatch[2] }
        });
      }
    }
    if (turn.text) parts.push({ text: turn.text });
    if (parts.length > 0) contents.push({ role: turn.role, parts });
  }

  const currentParts: any[] = [];
  if (imageSrc) {
    const mimeMatch = imageSrc.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (mimeMatch) {
      currentParts.push({
        inlineData: { mimeType: mimeMatch[1], data: mimeMatch[2] }
      });
    }
  }
  currentParts.push({ text: promptWithContext });
  contents.push({ role: 'user', parts: currentParts });

  const payload = {
    contents,
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.0, responseMimeType: 'application/json' }
  };

  for (const gModel of geminiModels) {
    const res = await callGeminiApi(payload, gModel, geminiKey);
    if (res.text) {
      try {
        let clean = res.text.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

        const parsed = JSON.parse(clean);
        const rawMeal = parsed.meal || parsed;
        if (targetDate) rawMeal.date = targetDate;
        if (targetTime) rawMeal.time = targetTime;

        const parsedResult = parseMealJson(JSON.stringify(rawMeal));
        if (parsedResult.success && parsedResult.meal) {
          parsedResult.meal.originalPrompt = promptText;
          parsedResult.meal.aiModelUsed = gModel;
          parsedResult.meal.aiFeedback = parsed.nutritionalFeedback || '';

          return {
            success: true,
            meal: parsedResult.meal,
            rawJson: JSON.stringify(parsedResult.meal, null, 2),
            clarificationQuestions: parsed.clarificationQuestions || [],
            quickSuggestions: parsed.quickSuggestions || [],
            nutritionalFeedback: parsed.nutritionalFeedback || '',
            modelUsed: gModel
          };
        }
      } catch (e) {}
    }
  }

  return {
    success: false,
    error: 'No se pudo procesar la solicitud con ninguno de los motores IA disponibles.'
  };
}

// Escáner de Tablas Nutricionales y Etiquetas de Productos usando Visión IA
export async function scanNutritionLabelWithAI(imageSrc: string): Promise<{ success: boolean; food?: CanonicalFood; error?: string }> {
  const geminiKey = getStoredGeminiApiKey();
  if (!geminiKey) {
    return { success: false, error: 'Se requiere la API Key de Gemini para escanear fotos de etiquetas.' };
  }

  const mimeMatch = imageSrc.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!mimeMatch) {
    return { success: false, error: 'Formato de imagen no válido.' };
  }

  const prompt = `Analiza la tabla nutrimental / etiqueta de este producto.
Extrae con máxima fidelidad la información por porción sugerida o por 100g.
Responde estrictamente con este formato JSON:
{
  "name": "Nombre completo del producto",
  "brand": "Marca comercial",
  "servingSize": "Tamaño de la porción (ej: 2 rebanadas (60g), 1 vaso (240ml), 30g)",
  "servingGrams": número en gramos (ej: 60),
  "calories": número de kcal,
  "protein": número en gramos,
  "carbs": número en gramos,
  "fat": número en gramos,
  "fiber": número en gramos,
  "category": "protein" | "dairy" | "grains" | "fats" | "fruits_veggies" | "supplements" | "beverages" | "other",
  "notes": "Detalles relevantes de la etiqueta (ej: 0% azúcares añadidos, sin sellos)",
  "nutrients": {
    "saturated_fat_g": número,
    "monounsaturated_fat_g": número,
    "polyunsaturated_fat_g": número,
    "trans_fat_g": número,
    "omega3_g": número,
    "cholesterol_mg": número,
    "sugar_g": número,
    "sodium_mg": número,
    "calcium_mg": número,
    "iron_mg": número,
    "potassium_mg": número,
    "magnesium_mg": número,
    "zinc_mg": número,
    "vitamin_c_mg": número,
    "vitamin_d_iu": número,
    "vitamin_a_mcg": número,
    "vitamin_b12_mcg": número
  }
}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: mimeMatch[1], data: mimeMatch[2] } },
          { text: prompt }
        ]
      }
    ],
    generationConfig: { temperature: 0.0, responseMimeType: 'application/json' }
  };

  for (const model of GEMINI_FALLBACK_CHAIN) {
    const res = await callGeminiApi(payload, model, geminiKey);
    if (res.text) {
      try {
        let clean = res.text.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

        const data = JSON.parse(clean);
        const canon: CanonicalFood = {
          id: `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: data.name || 'Producto Escaneado',
          brand: data.brand || 'Marca',
          servingSize: data.servingSize || '1 porción',
          servingGrams: Number(data.servingGrams) || 100,
          calories: Number(data.calories) || 0,
          protein: Number(data.protein) || 0,
          carbs: Number(data.carbs) || 0,
          fat: Number(data.fat) || 0,
          fiber: Number(data.fiber) || 0,
          category: data.category || 'other',
          notes: data.notes || 'Escaneado automáticamente desde etiqueta',
          sourceType: 'label_scan',
          nutrients: data.nutrients || {},
          createdAt: Date.now(),
          updatedAt: Date.now()
        };

        return { success: true, food: canon };
      } catch (e) {}
    }
  }

  return { success: false, error: 'No se pudo extraer la tabla nutricional de la imagen.' };
}

// Reconocimiento de Voz Web Speech API
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
};

export const createSpeechRecognizer = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void,
  onEnd: () => void
) => {
  if (!isSpeechRecognitionSupported()) return null;
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'es-ES';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    const text = event.results[0][0].transcript;
    onResult(text);
  };

  recognition.onerror = (event: any) => {
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
};
