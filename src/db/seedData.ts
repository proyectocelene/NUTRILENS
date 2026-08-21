import { NutritionGoals } from '../types/nutrition.types';

export const DEFAULT_NUTRITION_GOALS: NutritionGoals = {
  id: 'user_default_goals',
  calories: 2200,
  protein: 175,
  carbs: 245,
  fat: 58,
  fiber: 35,
  waterLiters: 3.5,
  profile: {
    age: 26,
    heightCm: 174,
    currentWeightKg: 78.35,
    targetWeightKg: 71.0,
    bmrKcal: 1702,
    bodyFatPct: 24.4,
    visceralFatLevel: 11.5,
    currentWaistInches: 38.5,
    targetWaistInches: 32.0,
    targetWaterLiters: 3.5,
    creatineDailyGrams: 5
  },
  microGoals: {
    vitamin_a_mcg: 900,
    vitamin_c_mg: 300,
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
  weightKg: 78.35,
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
3. Responde ÚNICA Y EXCLUSIVAMENTE con este bloque JSON válido (sin texto extra):

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
    title: '🍳 Comida 1: Desayuno Post-Entreno (55g P | 80g C | 18g F)',
    description: '4 huevos enteros + 4 claras + 80g avena + 1 plátano + aceite spray.',
    json: JSON.stringify({
      name: "Comida 1: Desayuno Post-Entrenamiento Inmediato",
      mealType: "breakfast",
      date: new Date().toISOString().split('T')[0],
      time: "08:30",
      notes: "Tomar junto a 5g de Creatina Monohidratada y 500ml de agua",
      foods: [
        {
          name: "Huevos enteros grandes (4 piezas)",
          amount: "200g (4 piezas)",
          calories: 288,
          protein: 24.8,
          carbs: 1.6,
          fat: 20.0,
          fiber: 0,
          nutrients: {
            vitamin_d_iu: 164,
            vitamin_b12_mcg: 1.8,
            vitamin_a_mcg: 320,
            iron_mg: 3.5,
            zinc_mg: 2.2,
            sodium_mg: 280,
            potassium_mg: 270
          }
        },
        {
          name: "Claras de huevo líquidas pasteurizadas",
          amount: "135ml (4 claras)",
          calories: 70,
          protein: 15.0,
          carbs: 1.0,
          fat: 0.2,
          fiber: 0,
          nutrients: {
            potassium_mg: 220,
            sodium_mg: 230,
            magnesium_mg: 15
          }
        },
        {
          name: "Copos de Avena Integral en hojuelas",
          amount: "80g",
          calories: 304,
          protein: 10.8,
          carbs: 53.0,
          fat: 5.6,
          fiber: 8.5,
          nutrients: {
            magnesium_mg: 110,
            iron_mg: 3.8,
            zinc_mg: 3.2,
            potassium_mg: 290,
            vitamin_b6_mg: 0.3
          }
        },
        {
          name: "Plátano maduro",
          amount: "100g (1 pieza)",
          calories: 89,
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
        },
        {
          name: "Aceite de oliva / spray de cocción",
          amount: "3g (1 cdta)",
          calories: 27,
          protein: 0,
          carbs: 0,
          fat: 3.0,
          nutrients: {
            vitamin_e_mg: 0.5
          }
        }
      ]
    }, null, 2)
  },
  {
    id: 'sample_meal2_lunch',
    title: '🥗 Comida 2: Almuerzo Principal (60g P | 100g C | 20g F)',
    description: '240g pechuga pollo/lomo + 350g arroz + ensalada verde + 70g aguacate + AOVE.',
    json: JSON.stringify({
      name: "Comida 2: Almuerzo Principal de Recomposición",
      mealType: "lunch",
      date: new Date().toISOString().split('T')[0],
      time: "14:00",
      notes: "Carga sostenida de energía y micronutrientes",
      foods: [
        {
          name: "Pechuga de Pollo o Lomo Magro (en crudo)",
          amount: "240g",
          calories: 396,
          protein: 74.0,
          carbs: 0,
          fat: 8.6,
          fiber: 0,
          nutrients: {
            iron_mg: 2.5,
            zinc_mg: 2.4,
            potassium_mg: 615,
            vitamin_b6_mg: 1.4,
            vitamin_b12_mcg: 0.8,
            sodium_mg: 170
          }
        },
        {
          name: "Arroz blanco o jazmín cocido",
          amount: "350g (cocido)",
          calories: 455,
          protein: 9.5,
          carbs: 98.0,
          fat: 1.2,
          fiber: 1.8,
          nutrients: {
            iron_mg: 1.5,
            magnesium_mg: 42,
            potassium_mg: 120,
            zinc_mg: 1.8
          }
        },
        {
          name: "Ensalada verde mixta (espinacas, pepino, tomate)",
          amount: "200g (1 plato hondo)",
          calories: 42,
          protein: 3.2,
          carbs: 6.8,
          fat: 0.5,
          fiber: 3.6,
          nutrients: {
            vitamin_a_mcg: 650,
            vitamin_c_mg: 45,
            vitamin_k_mcg: 320,
            folate_mcg: 140,
            potassium_mg: 480,
            magnesium_mg: 55,
            calcium_mg: 75
          }
        },
        {
          name: "Aguacate Hass (1/3 pieza)",
          amount: "70g",
          calories: 112,
          protein: 1.4,
          carbs: 6.0,
          fat: 10.5,
          fiber: 4.8,
          nutrients: {
            potassium_mg: 340,
            vitamin_e_mg: 1.4,
            folate_mcg: 56,
            magnesium_mg: 20
          }
        },
        {
          name: "Aceite de Oliva Virgen Extra",
          amount: "5ml (1 cdta)",
          calories: 44,
          protein: 0,
          carbs: 0,
          fat: 5.0,
          nutrients: {
            vitamin_e_mg: 0.8
          }
        }
      ]
    }, null, 2)
  },
  {
    id: 'sample_meal3_dinner',
    title: '🥩 Comida 3: Cena Regenerativa (60g P | 65g C | 20g F)',
    description: '250g bistec res magro/atún + 4 tortillas maíz + brócoli + 70g aguacate.',
    json: JSON.stringify({
      name: "Comida 3: Cena Regenerativa",
      mealType: "dinner",
      date: new Date().toISOString().split('T')[0],
      time: "20:30",
      notes: "Síntesis tisular durante el sueño",
      foods: [
        {
          name: "Bistec Magro de Res / Atún / Pavo",
          amount: "250g",
          calories: 360,
          protein: 65.0,
          carbs: 0,
          fat: 9.0,
          fiber: 0,
          nutrients: {
            iron_mg: 6.2,
            zinc_mg: 11.5,
            vitamin_b12_mcg: 5.5,
            potassium_mg: 780,
            selenium_mcg: 65,
            sodium_mg: 160
          }
        },
        {
          name: "Tortillas de maíz estándar",
          amount: "4 piezas (120g)",
          calories: 260,
          protein: 6.0,
          carbs: 52.0,
          fat: 3.2,
          fiber: 6.0,
          nutrients: {
            calcium_mg: 180,
            magnesium_mg: 70,
            potassium_mg: 240,
            iron_mg: 1.8
          }
        },
        {
          name: "Brócoli o Espárragos al vapor",
          amount: "180g",
          calories: 62,
          protein: 5.0,
          carbs: 12.0,
          fat: 0.7,
          fiber: 5.2,
          nutrients: {
            vitamin_c_mg: 160,
            vitamin_k_mcg: 180,
            calcium_mg: 85,
            folate_mcg: 115,
            potassium_mg: 540
          }
        },
        {
          name: "Aguacate Hass o 15g Almendras",
          amount: "70g",
          calories: 112,
          protein: 1.4,
          carbs: 6.0,
          fat: 10.5,
          fiber: 4.8,
          nutrients: {
            potassium_mg: 340,
            magnesium_mg: 20,
            vitamin_e_mg: 1.4
          }
        }
      ]
    }, null, 2)
  }
];

export const DEFAULT_CANONICAL_FOODS: any[] = [
  {
    id: 'canon_pan_bimbo_00',
    name: 'Pan Bimbo Cero Cero Multigrano',
    brand: 'Bimbo',
    servingSize: '2 rebanadas (~60g)',
    servingGrams: 60,
    calories: 140,
    protein: 7.0,
    carbs: 23.0,
    fat: 1.5,
    fiber: 3.5,
    category: 'grains',
    sourceType: 'manual',
    notes: '0% azúcares añadidos, 0% grasas añadidas',
    nutrients: {
      sodium_mg: 180,
      iron_mg: 1.2,
      magnesium_mg: 25,
      potassium_mg: 110,
      calcium_mg: 60,
      zinc_mg: 0.8,
      saturated_fat_g: 0.2,
      monounsaturated_fat_g: 0.4,
      polyunsaturated_fat_g: 0.7,
      sugar_g: 1.2
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_huevo_entero',
    name: 'Huevo entero fresco grande',
    brand: 'San Juan / Bachoco',
    servingSize: '2 piezas (~100g)',
    servingGrams: 100,
    calories: 144,
    protein: 12.6,
    carbs: 0.8,
    fat: 9.6,
    fiber: 0,
    category: 'protein',
    sourceType: 'manual',
    notes: 'Excelente biodisponibilidad y colina',
    nutrients: {
      cholesterol_mg: 372,
      choline_mg: 294,
      saturated_fat_g: 3.1,
      monounsaturated_fat_g: 3.8,
      polyunsaturated_fat_g: 1.4,
      omega3_g: 0.15,
      vitamin_d_iu: 82,
      vitamin_b12_mcg: 0.9,
      iron_mg: 1.8,
      sodium_mg: 140
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
    notes: '70% más proteína que leche regular',
    nutrients: {
      calcium_mg: 360,
      potassium_mg: 380,
      sodium_mg: 120,
      vitamin_d_iu: 120,
      vitamin_a_mcg: 180,
      vitamin_b12_mcg: 1.2,
      saturated_fat_g: 1.1,
      cholesterol_mg: 8
    },
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'canon_pechuga_pollo_cocida',
    name: 'Pechuga de pollo a la plancha/cocida',
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
    notes: 'Proteína magra estándar de recomposición',
    nutrients: {
      potassium_mg: 334,
      sodium_mg: 74,
      iron_mg: 1.0,
      magnesium_mg: 29,
      zinc_mg: 1.0,
      saturated_fat_g: 1.0,
      monounsaturated_fat_g: 1.2,
      polyunsaturated_fat_g: 0.8,
      cholesterol_mg: 85,
      choline_mg: 85
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
    nutrients: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
];

