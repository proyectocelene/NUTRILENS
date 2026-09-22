import { NutritionGoals } from '../types/nutrition.types';

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  id: 'user_default_goals',
  calories: 1950,
  protein: 170,
  carbs: 205,
  fat: 52,
  fiber: 35,
  waterLiters: 3.5,
  profile: {
    age: 26,
    heightCm: 174,
    currentWeightKg: 78.05,
    targetWeightKg: 67.0,
    bmrKcal: 1698,
    bodyFatPct: 24.3,
    visceralFatLevel: 11.0,
    currentWaistInches: 38.5,
    targetWaistInches: 31.5,
    targetWaterLiters: 3.5,
    creatineDailyGrams: 5,
    caffeineDailyMaxMg: 400,
    caffeineCutoffHour: 15
  },
  microGoals: {
    vitamin_a_mcg: 900,
    vitamin_c_mg: 400,
    vitamin_d_iu: 3000,
    vitamin_e_mg: 15,
    vitamin_b6_mg: 2.5,
    vitamin_b12_mcg: 6.0,
    folate_mcg: 400,
    calcium_mg: 1100,
    iron_mg: 15,
    magnesium_mg: 450,
    potassium_mg: 4000,
    sodium_mg: 3500,
    zinc_mg: 20
  },
  weightKg: 78.05,
  activityLevel: 'active',
  dietaryGoal: 'recomposition'
};

// Prompt maestro para pedirle análisis a cualquier IA externa (ChatGPT, Claude, DeepSeek, etc.)
export const MASTER_AI_NUTRITION_PROMPT = `Actúa como un analizador bioquímico y nutricional estricto de máxima exactitud.
Por favor, analiza la siguiente descripción de mi comida:
"[ESCRIBE AQUÍ TU COMIDA, EJEMPLO: 2 huevos revueltos con jamón de pavo, 2 rebanadas pan bimbo 0/0 y café con leche]"

REGLAS ESTRICTAS:
1. Calcula calorías exactas ((P*4)+(C*4)+(F*9)), macronutrientes (proteína, carbohidratos, grasa, fibra) e incluye el emoji representativo del plato y de cada ingrediente.
2. ES OBLIGATORIO calcular y devolver los 24 nutrientes y lípidos tanto en cada ingrediente como en "totalNutrients" sin omitir ninguno:
   - Lípidos: saturated_fat_g, monounsaturated_fat_g, polyunsaturated_fat_g, trans_fat_g, omega3_g, cholesterol_mg, choline_mg
   - Vitaminas: vitamin_c_mg, vitamin_d_iu, vitamin_a_mcg, vitamin_b12_mcg, vitamin_b6_mg, folate_mcg, vitamin_e_mg, vitamin_k_mcg
    - Minerales y otros: iron_mg, magnesium_mg, potassium_mg, calcium_mg, zinc_mg, sodium_mg, phosphorus_mg, selenium_mcg, sugar_g
3. PORCIONES Y GRAMAJE INTELIGENTE:
   - Especifica SIEMPRE el campo numérico "grams" en cada alimento con los gramos/ml consumidos (ej: "grams": 70, o "grams": 100).
   - En "amount" describe la porción natural con los gramos especificados (ej: "2 rebanadas (60g)", "70g", "1 taza (240ml)").
   - Todos los macros y 24 micronutrientes deben corresponder con exactitud matemática a esa cantidad específica en gramos consumida.
4. Responde ÚNICA Y EXCLUSIVAMENTE con este bloque JSON válido (sin texto extra):

{
  "name": "Nombre descriptivo del plato",
  "emoji": "🥪",
  "mealType": "lunch",
  "date": "YYYY-MM-DD",
  "time": "14:00",
  "totalCalories": 0,
  "totalProtein": 0,
  "totalCarbs": 0,
  "totalFat": 0,
  "totalFiber": 0,
  "foods": [
    {
      "name": "Nombre del alimento 1",
      "emoji": "🍞",
      "amount": "2 rebanadas (60g)",
      "grams": 60,
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
        "choline_mg": 0,
        "sugar_g": 0,
        "caffeine_mg": 0,
        "creatine_g": 0,
        "iron_mg": 0,
        "magnesium_mg": 0,
        "potassium_mg": 0,
        "calcium_mg": 0,
        "zinc_mg": 0,
        "sodium_mg": 0,
        "vitamin_c_mg": 0,
        "vitamin_d_iu": 0,
        "vitamin_a_mcg": 0,
        "vitamin_b12_mcg": 0,
        "vitamin_b6_mg": 0,
        "folate_mcg": 0,
        "vitamin_e_mg": 0,
        "vitamin_k_mcg": 0,
        "selenium_mcg": 0,
        "phosphorus_mg": 0
      }
    }
  ],
  "totalNutrients": {
    "saturated_fat_g": 0,
    "monounsaturated_fat_g": 0,
    "polyunsaturated_fat_g": 0,
    "trans_fat_g": 0,
    "omega3_g": 0,
    "cholesterol_mg": 0,
    "choline_mg": 0,
    "sugar_g": 0,
    "caffeine_mg": 0,
    "creatine_g": 0,
    "iron_mg": 0,
    "magnesium_mg": 0,
    "potassium_mg": 0,
    "calcium_mg": 0,
    "zinc_mg": 0,
    "sodium_mg": 0,
    "vitamin_c_mg": 0,
    "vitamin_d_iu": 0,
    "vitamin_a_mcg": 0,
    "vitamin_b12_mcg": 0,
    "vitamin_b6_mg": 0,
    "folate_mcg": 0,
    "vitamin_e_mg": 0,
    "vitamin_k_mcg": 0,
    "selenium_mcg": 0,
    "phosphorus_mg": 0
  },
  "healthAnalysis": {
    "score": 85,
    "diagnosis": "Diagnóstico nutricional breve de la comida...",
    "pros": ["Puntos fuertes nutricionales (ej: alta proteína, omega-3)"],
    "cons": ["Aspectos a moderar (ej: sodio, baja fibra)"],
    "tips": ["Consejos del chef para mejorar sabor o absorción"],
    "healthierAlternatives": "Alternativas gastronómicas para hacerlo aún más saludable"
  }
}`;

// Prompt maestro para generar alimentos canónicos individuales o en lote con IA externa
export const MASTER_CANONICAL_FOODS_AI_PROMPT = `Actúa como un experto en tablas de composición nutricional oficial de alimentos y etiquetado (USDA / LATAM).
Por favor, analiza y genera las fichas canónicas estandarizadas para el/los siguientes productos:
"[ESCRIBE AQUÍ TUS PRODUCTOS O MARCAS, EJEMPLO: Pan Bimbo Cero Cero, Leche Alpura Pro, Jamón Pechuga de Pavo San Rafael, Atún Dolores en Agua, Aguacate Hass]"

REGLAS ESTRICTAS:
1. Extrae o calcula el tamaño de porción real por unidad comercial o por 100g.
2. ES OBLIGATORIO calcular y devolver los 24 nutrientes y lípidos exactos por porción sin omitir ninguno:
   - Lípidos: saturated_fat_g, monounsaturated_fat_g, polyunsaturated_fat_g, trans_fat_g, omega3_g, cholesterol_mg, choline_mg
   - Vitaminas: vitamin_c_mg, vitamin_d_iu, vitamin_a_mcg, vitamin_b12_mcg, vitamin_b6_mg, folate_mcg, vitamin_e_mg, vitamin_k_mcg
   - Minerales y otros: iron_mg, magnesium_mg, potassium_mg, calcium_mg, zinc_mg, sodium_mg, phosphorus_mg, selenium_mcg, sugar_g
3. Responde ÚNICA Y EXCLUSIVAMENTE con un arreglo JSON [ ... ] válido (sin texto extra):

[
  {
    "name": "Nombre completo del producto",
    "brand": "Marca comercial",
    "servingSize": "2 rebanadas (60g)",
    "servingGrams": 60,
    "calories": 140,
    "protein": 7.0,
    "carbs": 23.0,
    "fat": 1.5,
    "fiber": 3.5,
    "category": "grains",
    "notes": "Sin sellos, 0% azúcares añadidos",
    "nutrients": {
      "saturated_fat_g": 0.2,
      "monounsaturated_fat_g": 0.4,
      "polyunsaturated_fat_g": 0.7,
      "trans_fat_g": 0.0,
      "omega3_g": 0.0,
      "cholesterol_mg": 0,
      "choline_mg": 14,
      "sugar_g": 1.5,
      "iron_mg": 1.5,
      "magnesium_mg": 32,
      "potassium_mg": 95,
      "calcium_mg": 80,
      "zinc_mg": 0.9,
      "sodium_mg": 180,
      "vitamin_c_mg": 0,
      "vitamin_d_iu": 0,
      "vitamin_a_mcg": 0,
      "vitamin_b12_mcg": 0,
      "vitamin_b6_mg": 0.2,
      "folate_mcg": 65,
      "vitamin_e_mg": 0.3,
      "vitamin_k_mcg": 1.5,
      "selenium_mcg": 18.2,
      "phosphorus_mg": 90
    }
  }
]`;

// Plantilla estructurada completa con guía de los 24 nutrientes
export const JSON_BLANK_SCHEMA_TEMPLATE = JSON.stringify({
  "name": "Nombre del Plato o Comida (ej: Sándwich de Pavo y Huevo con Café)",
  "emoji": "🥪",
  "mealType": "lunch", // "breakfast" | "lunch" | "dinner" | "snack" | "other"
  "date": new Date().toISOString().split('T')[0],
  "time": "14:00",
  "notes": "Notas opcionales (ej: post-entreno, 5g creatina)",
  "totalCalories": 485,
  "totalProtein": 38.5,
  "totalCarbs": 42.0,
  "totalFat": 18.2,
  "totalFiber": 6.5,
  "foods": [
    {
      "name": "Pan Bimbo Cero Cero",
      "emoji": "🍞",
      "amount": "2 rebanadas (60g)",
      "calories": 140,
      "protein": 7.0,
      "carbs": 23.0,
      "fat": 1.5,
      "fiber": 3.5,
      "nutrients": {
        "saturated_fat_g": 0.2,
        "monounsaturated_fat_g": 0.4,
        "polyunsaturated_fat_g": 0.7,
        "trans_fat_g": 0.0,
        "omega3_g": 0.0,
        "cholesterol_mg": 0,
        "choline_mg": 14,
        "sugar_g": 1.5,
        "sodium_mg": 180,
        "iron_mg": 1.5,
        "calcium_mg": 80,
        "magnesium_mg": 32,
        "potassium_mg": 95,
        "zinc_mg": 0.9,
        "vitamin_b6_mg": 0.2,
        "folate_mcg": 65,
        "vitamin_e_mg": 0.3,
        "vitamin_c_mg": 0,
        "vitamin_d_iu": 0,
        "vitamin_a_mcg": 0,
        "vitamin_b12_mcg": 0,
        "vitamin_k_mcg": 1.5,
        "selenium_mcg": 18.2,
        "phosphorus_mg": 90
      }
    },
    {
      "name": "Huevo entero revuelto",
      "emoji": "🥚",
      "amount": "2 piezas (~100g)",
      "calories": 144,
      "protein": 12.6,
      "carbs": 0.8,
      "fat": 9.6,
      "fiber": 0,
      "nutrients": {
        "saturated_fat_g": 3.1,
        "monounsaturated_fat_g": 3.8,
        "polyunsaturated_fat_g": 1.4,
        "trans_fat_g": 0.0,
        "omega3_g": 0.25,
        "cholesterol_mg": 372,
        "choline_mg": 294,
        "sugar_g": 0.4,
        "sodium_mg": 140,
        "potassium_mg": 138,
        "calcium_mg": 56,
        "iron_mg": 1.8,
        "zinc_mg": 1.3,
        "magnesium_mg": 12,
        "vitamin_a_mcg": 160,
        "vitamin_d_iu": 82,
        "vitamin_b12_mcg": 0.9,
        "vitamin_b6_mg": 0.17,
        "folate_mcg": 47,
        "vitamin_e_mg": 1.05,
        "vitamin_c_mg": 0,
        "vitamin_k_mcg": 0.3,
        "selenium_mcg": 30.8,
        "phosphorus_mg": 198
      }
    }
  ],
  "totalNutrients": {
    "saturated_fat_g": 3.3,
    "monounsaturated_fat_g": 4.2,
    "polyunsaturated_fat_g": 2.1,
    "trans_fat_g": 0.0,
    "omega3_g": 0.25,
    "cholesterol_mg": 372,
    "choline_mg": 308,
    "sugar_g": 1.9,
    "sodium_mg": 320,
    "iron_mg": 3.3,
    "calcium_mg": 136,
    "magnesium_mg": 44,
    "potassium_mg": 233,
    "zinc_mg": 2.2,
    "vitamin_c_mg": 0,
    "vitamin_d_iu": 82,
    "vitamin_a_mcg": 160,
    "vitamin_b12_mcg": 0.9,
    "vitamin_b6_mg": 0.37,
    "folate_mcg": 112,
    "vitamin_e_mg": 1.35,
    "vitamin_k_mcg": 1.8,
    "selenium_mcg": 49.0,
    "phosphorus_mg": 288
  }
}, null, 2);

export const SAMPLE_JSON_TEMPLATES = [
  {
    id: 'sample_meal1_breakfast',
    title: '🥤 Comida 1: Desayuno Anabólico Optimizado (48g P | 36g C | 5g F)',
    description: '1 scoop Bulk Power Whey + 350ml Leche Alpura Pro + 1 plátano mediano (~385 kcal).',
    json: JSON.stringify({
      name: "Comida 1: Desayuno Anabólico Optimizado",
      emoji: "🥤",
      mealType: "breakfast",
      date: new Date().toISOString().split('T')[0],
      time: "07:45",
      notes: "Pico de Leucina (>3.2g) y activación mTORC1 sin pesadez digestiva para iniciar consulta médica.",
      totalCalories: 385,
      totalProtein: 47.6,
      totalCarbs: 36.2,
      totalFat: 5.3,
      totalFiber: 2.6,
      foods: [
        {
          name: "Proteína Whey Bulk Power (Vanilla S'mores)",
          emoji: "🥛",
          amount: "1 scoop (30g)",
          calories: 120,
          protein: 22.0,
          carbs: 2.0,
          fat: 1.5,
          fiber: 0,
          nutrients: {
            calcium_mg: 130,
            potassium_mg: 150,
            sodium_mg: 120,
            iron_mg: 0.5
          }
        },
        {
          name: "Leche Alpura Pro / Alta Proteína Deslactosada",
          emoji: "🥛",
          amount: "350ml",
          calories: 175,
          protein: 24.5,
          carbs: 11.2,
          fat: 3.5,
          fiber: 0,
          nutrients: {
            calcium_mg: 520,
            potassium_mg: 550,
            sodium_mg: 175,
            vitamin_d_iu: 175,
            vitamin_a_mcg: 260,
            vitamin_b12_mcg: 1.8
          }
        },
        {
          name: "Plátano maduro",
          emoji: "🍌",
          amount: "1 pieza mediana (100g pulpa)",
          calories: 90,
          protein: 1.1,
          carbs: 23.0,
          fat: 0.3,
          fiber: 2.6,
          nutrients: {
            potassium_mg: 360,
            vitamin_c_mg: 8.7,
            vitamin_b6_mg: 0.4,
            magnesium_mg: 27
          }
        }
      ],
      totalNutrients: {
        calcium_mg: 650,
        potassium_mg: 1060,
        sodium_mg: 295,
        magnesium_mg: 45,
        vitamin_c_mg: 8.7,
        vitamin_d_iu: 175,
        vitamin_a_mcg: 260,
        vitamin_b12_mcg: 1.8,
        vitamin_b6_mg: 0.5,
        iron_mg: 0.8
      }
    }, null, 2)
  },
  {
    id: 'sample_meal2_lunch',
    title: '🥗 Comida 2: Almuerzo Post-Gym Máxima Densidad (71g P | 89g C | 13g F)',
    description: '120g pechuga pollo air fryer + 1 lata atún dolores + 160g arroz jazmín + 2 pan bimbo 0/0 + aguacate + ensalada.',
    json: JSON.stringify({
      name: "Comida 2: Almuerzo Post-Gym (Máxima Saciedad & Recarga)",
      emoji: "🥗",
      mealType: "lunch",
      date: new Date().toISOString().split('T')[0],
      time: "15:30",
      notes: "Sensibilidad insulínica post-pesas y recarga de glucógeno para estudio ENARM. Densidad y saciedad máxima.",
      totalCalories: 744,
      totalProtein: 70.8,
      totalCarbs: 89.2,
      totalFat: 12.8,
      totalFiber: 14.7,
      foods: [
        {
          name: "Pechuga de Pollo asada en Air Fryer",
          emoji: "🍗",
          amount: "120g (peso cocido)",
          calories: 198,
          protein: 37.2,
          carbs: 0,
          fat: 4.2,
          fiber: 0,
          nutrients: {
            potassium_mg: 400,
            sodium_mg: 90,
            iron_mg: 1.2,
            magnesium_mg: 35,
            zinc_mg: 1.2,
            vitamin_b6_mg: 0.7,
            vitamin_b12_mcg: 0.4
          }
        },
        {
          name: "Atún Dolores en Agua drenado",
          emoji: "🐟",
          amount: "1 lata (100g drenado)",
          calories: 96,
          protein: 22.0,
          carbs: 0,
          fat: 0.8,
          fiber: 0,
          nutrients: {
            sodium_mg: 260,
            potassium_mg: 250,
            selenium_mcg: 65,
            vitamin_b12_mcg: 2.5,
            iron_mg: 1.3
          }
        },
        {
          name: "Arroz blanco o jazmín cocido",
          emoji: "🍚",
          amount: "160g cocido (~1 taza)",
          calories: 208,
          protein: 4.0,
          carbs: 45.0,
          fat: 0.4,
          fiber: 0.8,
          nutrients: {
            iron_mg: 1.2,
            magnesium_mg: 20,
            zinc_mg: 0.8,
            potassium_mg: 55
          }
        },
        {
          name: "Pan Bimbo Cero Cero Multigrano",
          emoji: "🍞",
          amount: "2 rebanadas (60g)",
          calories: 112,
          protein: 6.8,
          carbs: 21.0,
          fat: 1.4,
          fiber: 7.0,
          nutrients: {
            sodium_mg: 180,
            iron_mg: 1.5,
            magnesium_mg: 30,
            potassium_mg: 95
          }
        },
        {
          name: "Aguacate Hass",
          emoji: "🥑",
          amount: "35g (1/4 pieza)",
          calories: 65,
          protein: 0.8,
          carbs: 3.2,
          fat: 6.0,
          fiber: 2.4,
          nutrients: {
            potassium_mg: 170,
            vitamin_e_mg: 0.7,
            folate_mcg: 28,
            magnesium_mg: 10
          }
        },
        {
          name: "Ensalada verde mixta con limón y sal",
          emoji: "🥗",
          amount: "200g (pepino, tomate bola, espinacas)",
          calories: 65,
          protein: 3.0,
          carbs: 9.0,
          fat: 0.5,
          fiber: 4.5,
          nutrients: {
            vitamin_a_mcg: 600,
            vitamin_c_mg: 40,
            vitamin_k_mcg: 280,
            folate_mcg: 110,
            potassium_mg: 450,
            sodium_mg: 250
          }
        }
      ],
      totalNutrients: {
        potassium_mg: 1415,
        sodium_mg: 870,
        iron_mg: 5.2,
        magnesium_mg: 110,
        zinc_mg: 3.2,
        vitamin_a_mcg: 600,
        vitamin_c_mg: 40,
        vitamin_k_mcg: 280,
        folate_mcg: 138,
        vitamin_b12_mcg: 2.9,
        vitamin_b6_mg: 1.2,
        selenium_mcg: 75
      }
    }, null, 2)
  },
  {
    id: 'sample_meal3_dinner',
    title: '🌙 Comida 3: Cena Reparadora SNC & Caseína Lenta (30g P | 42g C | 16g F)',
    description: '170g yogur griego Fage 0% + 30g avena + 15g crema maní + 10g almendras + 1 pan bimbo tostado.',
    json: JSON.stringify({
      name: "Comida 3: Cena Reparadora del SNC & Tejido Conectivo",
      emoji: "🥣",
      mealType: "dinner",
      date: new Date().toISOString().split('T')[0],
      time: "21:15",
      notes: "Caseína micelar de lenta liberación (6-7h), triptófano anti-antojos quetiapina. Acompañar con 5g creatina, 400mg citrato magnesio y 400mg vit C.",
      totalCalories: 426,
      totalProtein: 30.3,
      totalCarbs: 41.7,
      totalFat: 15.9,
      totalFiber: 9.1,
      foods: [
        {
          name: "Yogur Griego Fage 0% o Chobani Zero",
          emoji: "🥣",
          amount: "170g",
          calories: 100,
          protein: 17.0,
          carbs: 6.0,
          fat: 0,
          fiber: 0,
          nutrients: {
            calcium_mg: 190,
            potassium_mg: 240,
            sodium_mg: 65,
            vitamin_b12_mcg: 0.9
          }
        },
        {
          name: "Copos de Avena Integral en hojuelas",
          emoji: "🌾",
          amount: "30g",
          calories: 115,
          protein: 4.0,
          carbs: 20.0,
          fat: 2.0,
          fiber: 3.2,
          nutrients: {
            magnesium_mg: 42,
            zinc_mg: 1.2,
            iron_mg: 1.4,
            potassium_mg: 110
          }
        },
        {
          name: "Mantequilla de Maní pura",
          emoji: "🥜",
          amount: "15g (1 cda sopera rasa)",
          calories: 95,
          protein: 3.8,
          carbs: 3.2,
          fat: 8.0,
          fiber: 1.2,
          nutrients: {
            vitamin_e_mg: 1.3,
            magnesium_mg: 25,
            potassium_mg: 105
          }
        },
        {
          name: "Almendras picadas",
          emoji: "🌰",
          amount: "10g (8-10 piezas)",
          calories: 60,
          protein: 2.1,
          carbs: 2.0,
          fat: 5.2,
          fiber: 1.2,
          nutrients: {
            vitamin_e_mg: 2.6,
            magnesium_mg: 27,
            calcium_mg: 26,
            potassium_mg: 73
          }
        },
        {
          name: "Pan Bimbo Cero Cero tostado",
          emoji: "🍞",
          amount: "1 rebanada (30g)",
          calories: 56,
          protein: 3.4,
          carbs: 10.5,
          fat: 0.7,
          fiber: 3.5,
          nutrients: {
            sodium_mg: 90,
            iron_mg: 0.8,
            potassium_mg: 50
          }
        }
      ],
      totalNutrients: {
        calcium_mg: 230,
        potassium_mg: 578,
        magnesium_mg: 105,
        zinc_mg: 1.9,
        iron_mg: 2.3,
        vitamin_e_mg: 4.0,
        vitamin_b12_mcg: 0.9,
        sodium_mg: 165
      }
    }, null, 2)
  }
];

export const DEFAULT_CANONICAL_FOODS: any[] = [
  {
    id: 'canon_whey_bulk_power',
    name: "Proteína Whey Bulk Power (Vanilla S'mores)",
    brand: 'Bulk Power',
    servingSize: '1 scoop (30g)',
    servingGrams: 30,
    calories: 120,
    protein: 22.0,
    carbs: 2.0,
    fat: 1.5,
    fiber: 0,
    category: 'supplements',
    sourceType: 'manual',
    notes: 'Aislado y concentrado de suero, digestión óptima y leucina',
    nutrients: {
      calcium_mg: 130,
      potassium_mg: 150,
      sodium_mg: 120,
      iron_mg: 0.5,
      saturated_fat_g: 0.8,
      monounsaturated_fat_g: 0.4,
      polyunsaturated_fat_g: 0.2,
      trans_fat_g: 0,
      cholesterol_mg: 35
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_leche_alpura_pro',
    name: 'Leche Alpura Proteína / Pro Deslactosada',
    brand: 'Alpura',
    servingSize: '1 vaso (240ml)',
    servingGrams: 240,
    calories: 110,
    protein: 12.0,
    carbs: 8.6,
    fat: 1.8,
    fiber: 0,
    category: 'dairy',
    sourceType: 'manual',
    notes: '70% más proteína que leche regular, deslactosada',
    nutrients: {
      calcium_mg: 360,
      potassium_mg: 380,
      sodium_mg: 120,
      vitamin_d_iu: 120,
      vitamin_a_mcg: 180,
      vitamin_b12_mcg: 1.2,
      saturated_fat_g: 1.1,
      monounsaturated_fat_g: 0.5,
      polyunsaturated_fat_g: 0.1,
      trans_fat_g: 0,
      cholesterol_mg: 8
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_atun_dolores',
    name: 'Atún Dolores en Agua',
    brand: 'Dolores',
    servingSize: '1 lata (100g drenado)',
    servingGrams: 100,
    calories: 96,
    protein: 22.0,
    carbs: 0,
    fat: 0.8,
    fiber: 0,
    category: 'protein',
    sourceType: 'manual',
    notes: 'Proteína pura ultra magra, rico en selenio y B12',
    nutrients: {
      sodium_mg: 260,
      potassium_mg: 250,
      selenium_mcg: 65,
      vitamin_b12_mcg: 2.5,
      iron_mg: 1.3,
      saturated_fat_g: 0.2,
      monounsaturated_fat_g: 0.1,
      polyunsaturated_fat_g: 0.3,
      omega3_g: 0.25,
      cholesterol_mg: 30
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_pechuga_pollo_airfryer',
    name: 'Pechuga de pollo asada en Air Fryer',
    brand: 'Genérico',
    servingSize: '100g cocido',
    servingGrams: 100,
    calories: 165,
    protein: 31.0,
    carbs: 0,
    fat: 3.6,
    fiber: 0,
    category: 'protein',
    sourceType: 'manual',
    notes: 'Proteína magra estándar de recomposición Adonis',
    nutrients: {
      potassium_mg: 334,
      sodium_mg: 74,
      iron_mg: 1.0,
      magnesium_mg: 29,
      zinc_mg: 1.0,
      phosphorus_mg: 220,
      saturated_fat_g: 1.0,
      monounsaturated_fat_g: 1.2,
      polyunsaturated_fat_g: 0.8,
      trans_fat_g: 0,
      cholesterol_mg: 85,
      choline_mg: 85
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_pan_bimbo_00',
    name: 'Pan Bimbo Cero Cero Multigrano',
    brand: 'Bimbo',
    servingSize: '2 rebanadas (~60g)',
    servingGrams: 60,
    calories: 112,
    protein: 6.8,
    carbs: 21.0,
    fat: 1.4,
    fiber: 7.0,
    category: 'grains',
    sourceType: 'manual',
    notes: '0% azúcares añadidos, 0% grasas añadidas, 7g fibra',
    nutrients: {
      sodium_mg: 180,
      iron_mg: 1.5,
      magnesium_mg: 30,
      potassium_mg: 95,
      calcium_mg: 60,
      zinc_mg: 0.8,
      saturated_fat_g: 0.2,
      monounsaturated_fat_g: 0.4,
      polyunsaturated_fat_g: 0.7,
      trans_fat_g: 0,
      sugar_g: 1.2
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_yogur_fage_0',
    name: 'Yogur Griego Fage Total 0% / Chobani Zero',
    brand: 'Fage / Chobani',
    servingSize: '1 taza (170g)',
    servingGrams: 170,
    calories: 100,
    protein: 17.0,
    carbs: 6.0,
    fat: 0,
    fiber: 0,
    category: 'dairy',
    sourceType: 'manual',
    notes: 'Caseína micelar de lenta absorción para saciedad nocturna',
    nutrients: {
      calcium_mg: 190,
      potassium_mg: 240,
      sodium_mg: 65,
      vitamin_b12_mcg: 0.9,
      saturated_fat_g: 0,
      monounsaturated_fat_g: 0,
      polyunsaturated_fat_g: 0,
      trans_fat_g: 0,
      sugar_g: 5.0
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_mantequilla_mani',
    name: 'Mantequilla de Maní Natural (100% Cacahuate)',
    brand: 'Genérico / Kirkland',
    servingSize: '1 cda sopera rasa (15g)',
    servingGrams: 15,
    calories: 95,
    protein: 3.8,
    carbs: 3.2,
    fat: 8.0,
    fiber: 1.2,
    category: 'fats',
    sourceType: 'manual',
    notes: 'Grasas monoinsaturadas y triptófano nocturno',
    nutrients: {
      vitamin_e_mg: 1.3,
      magnesium_mg: 25,
      potassium_mg: 105,
      iron_mg: 0.3,
      zinc_mg: 0.4,
      saturated_fat_g: 1.5,
      monounsaturated_fat_g: 4.0,
      polyunsaturated_fat_g: 2.0,
      trans_fat_g: 0,
      sugar_g: 0.8
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_almendras',
    name: 'Almendras enteras naturales',
    brand: 'Genérico',
    servingSize: '10g (8-10 piezas)',
    servingGrams: 10,
    calories: 60,
    protein: 2.1,
    carbs: 2.0,
    fat: 5.2,
    fiber: 1.2,
    category: 'fats',
    sourceType: 'manual',
    notes: 'Ricas en vitamina E dérmica y magnesio',
    nutrients: {
      vitamin_e_mg: 2.6,
      magnesium_mg: 27,
      calcium_mg: 26,
      potassium_mg: 73,
      iron_mg: 0.4,
      zinc_mg: 0.3,
      phosphorus_mg: 48,
      saturated_fat_g: 0.4,
      monounsaturated_fat_g: 3.2,
      polyunsaturated_fat_g: 1.2,
      trans_fat_g: 0,
      sugar_g: 0.4
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_arroz_cocido',
    name: 'Arroz blanco o jazmín cocido',
    brand: 'Genérico',
    servingSize: '160g cocido (~1 taza)',
    servingGrams: 160,
    calories: 208,
    protein: 4.0,
    carbs: 45.0,
    fat: 0.4,
    fiber: 0.8,
    category: 'grains',
    sourceType: 'manual',
    notes: 'Carbohidrato de rápida recarga de glucógeno post-pesas',
    nutrients: {
      iron_mg: 1.2,
      magnesium_mg: 20,
      zinc_mg: 0.8,
      potassium_mg: 55,
      saturated_fat_g: 0.1,
      monounsaturated_fat_g: 0.1,
      polyunsaturated_fat_g: 0.1
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_aguacate_hass',
    name: 'Aguacate Hass fresco',
    brand: 'Genérico',
    servingSize: '35g (1/4 pieza)',
    servingGrams: 35,
    calories: 65,
    protein: 0.8,
    carbs: 3.2,
    fat: 6.0,
    fiber: 2.4,
    category: 'fats',
    sourceType: 'manual',
    notes: 'Ácido oleico, potasio y fibra soluble',
    nutrients: {
      potassium_mg: 170,
      vitamin_e_mg: 0.7,
      folate_mcg: 28,
      magnesium_mg: 10,
      saturated_fat_g: 0.8,
      monounsaturated_fat_g: 4.2,
      polyunsaturated_fat_g: 0.7,
      trans_fat_g: 0,
      omega3_g: 0.04
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_avena_integral',
    name: 'Copos de Avena Integral en hojuelas',
    brand: 'Quaker / Genérico',
    servingSize: '30g',
    servingGrams: 30,
    calories: 115,
    protein: 4.0,
    carbs: 20.0,
    fat: 2.0,
    fiber: 3.2,
    category: 'grains',
    sourceType: 'manual',
    notes: 'Beta-glucanos, magnesio y saciedad prolongada',
    nutrients: {
      magnesium_mg: 42,
      zinc_mg: 1.2,
      iron_mg: 1.4,
      potassium_mg: 110,
      saturated_fat_g: 0.4,
      monounsaturated_fat_g: 0.7,
      polyunsaturated_fat_g: 0.7
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_creatina_monohidrato',
    name: 'Creatina Monohidratada Creapure',
    brand: 'Birdman / Dymatize / Optimum',
    servingSize: '1 scoop (5g)',
    servingGrams: 5,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    category: 'supplements',
    sourceType: 'manual',
    notes: '5g diarios para saturación muscular e hidratación celular',
    nutrients: {
      creatine_g: 5.0
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_citrato_magnesio',
    name: 'Citrato de Magnesio (400mg elemental)',
    brand: 'Genérico',
    servingSize: '1 dosis nocturna',
    servingGrams: 2,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    category: 'supplements',
    sourceType: 'manual',
    notes: 'Relajación muscular, sueño profundo NREM 3/4 y anti-calambres',
    nutrients: {
      magnesium_mg: 400
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_vitamina_c',
    name: 'Vitamina C (Ácido Ascórbico 400-500mg)',
    brand: 'Genérico',
    servingSize: '1 dosis nocturna',
    servingGrams: 1,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    category: 'supplements',
    sourceType: 'manual',
    notes: 'Cofactor de hidroxilación de procolágeno anti-flacidez',
    nutrients: {
      vitamin_c_mg: 400
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

