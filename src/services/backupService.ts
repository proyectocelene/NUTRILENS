import { db } from '../db';
import { dbService } from '../db/dbService';
import { ExportDataPayload, DatabaseAuditDiagnostic } from '../types/db.types';
import { DEFAULT_NUTRITION_GOALS } from '../db/seedData';
import { getGamificationState, saveGamificationState } from './gamificationService';

// Genera la auditoría bioquímica, matemática y estadística de toda la base de datos
export async function generateFullDatabasePayload(): Promise<{ payload: ExportDataPayload; diagnostic: DatabaseAuditDiagnostic }> {
  const meals = await db.meals.toArray();
  const recipes = await db.recipes.toArray();
  const goalsList = await db.goals.toArray();
  const logs = await db.dailyLogs.toArray();
  const canonicalFoods = await db.canonicalFoods.toArray();
  const learnedFoods = await dbService.getLearnedFoods();
  const gamification = getGamificationState();

  const goals = goalsList[0] || DEFAULT_NUTRITION_GOALS;

  // Auditoría y Diagnóstico de Integridad
  let atwaterDiscrepancies = 0;
  let lipidDiscrepancies = 0;
  const issuesList: DatabaseAuditDiagnostic['issuesList'] = [];
  let individualFoodsCount = 0;

  // 1. Auditar Alimentos Canónicos
  for (const food of canonicalFoods) {
    const p = Number(food.protein) || 0;
    const c = Number(food.carbs) || 0;
    const f = Number(food.fat) || 0;
    const fiber = Number(food.fiber) || 0;
    const declaredCal = Number(food.calories) || 0;

    // Fórmula Atwater modificada: 4P + 4C + 9F
    const atwaterCal = Math.round((p * 4) + (c * 4) + (f * 9));
    const diff = Math.abs(atwaterCal - declaredCal);

    if (declaredCal > 20 && diff > Math.max(15, declaredCal * 0.20)) {
      atwaterDiscrepancies++;
      issuesList.push({
        type: 'warning',
        entityType: 'canonical',
        id: food.id,
        title: `Discrepancia Calórica (Atwater): ${food.name}`,
        description: `Las calorías declaradas (${declaredCal} kcal) difieren del cálculo bioquímico estándar 4P+4C+9G (${atwaterCal} kcal).`,
        expected: `~${atwaterCal} kcal`,
        actual: `${declaredCal} kcal`
      });
    }

    // Perfil Lipídico en alimentos con grasa
    if (f >= 2.0) {
      const sat = food.nutrients?.saturated_fat_g || 0;
      const mono = food.nutrients?.monounsaturated_fat_g || 0;
      const poly = food.nutrients?.polyunsaturated_fat_g || 0;
      const sumLipids = sat + mono + poly;

      if (sumLipids === 0) {
        lipidDiscrepancies++;
        issuesList.push({
          type: 'warning',
          entityType: 'canonical',
          id: food.id,
          title: `Perfil Lipídico en Ceros: ${food.name}`,
          description: `Tiene ${f}g de grasa total, pero no tiene desglosados ácidos grasos saturados, monoinsaturados o poliinsaturados.`,
          expected: `Desglose de ${f}g grasa`,
          actual: `0g desglosados`
        });
      } else if (sumLipids > f * 1.25) {
        lipidDiscrepancies++;
        issuesList.push({
          type: 'error',
          entityType: 'canonical',
          id: food.id,
          title: `Suma de Ácidos Grasos Excede Grasa Total: ${food.name}`,
          description: `La suma de saturados (${sat}g) + mono (${mono}g) + poli (${poly}g) = ${sumLipids.toFixed(1)}g excede la grasa total (${f}g).`,
          expected: `≤ ${f}g`,
          actual: `${sumLipids.toFixed(1)}g`
        });
      }
    }
  }

  // 2. Auditar Comidas Registradas
  for (const meal of meals) {
    if (meal.foods) {
      individualFoodsCount += meal.foods.length;
    }
    const p = Number(meal.totalProtein) || 0;
    const c = Number(meal.totalCarbs) || 0;
    const f = Number(meal.totalFat) || 0;
    const declaredCal = Number(meal.totalCalories) || 0;

    const atwaterCal = Math.round((p * 4) + (c * 4) + (f * 9));
    const diff = Math.abs(atwaterCal - declaredCal);

    if (declaredCal > 40 && diff > Math.max(30, declaredCal * 0.25)) {
      atwaterDiscrepancies++;
      issuesList.push({
        type: 'info',
        entityType: 'meal',
        id: meal.id || `meal_${meal.date}`,
        title: `Calorías de comida vs Macros: ${meal.name} (${meal.date})`,
        description: `Declarado: ${declaredCal} kcal vs Atwater (4P+4C+9G): ${atwaterCal} kcal.`,
        expected: `~${atwaterCal} kcal`,
        actual: `${declaredCal} kcal`
      });
    }
  }

  const totalEntities = meals.length + individualFoodsCount + recipes.length + canonicalFoods.length + logs.length;
  const penalty = Math.min(60, (atwaterDiscrepancies * 3) + (lipidDiscrepancies * 4));
  const integrityScorePct = Math.max(40, 100 - penalty);

  const diagnostic: DatabaseAuditDiagnostic = {
    totalEntitiesCount: totalEntities,
    mealsCount: meals.length,
    individualFoodsCount,
    recipesCount: recipes.length,
    canonicalFoodsCount: canonicalFoods.length,
    learnedFoodsCount: learnedFoods.length,
    dailyLogsCount: logs.length,
    integrityScorePct,
    atwaterDiscrepanciesCount: atwaterDiscrepancies,
    lipidDiscrepanciesCount: lipidDiscrepancies,
    issuesList
  };

  const payload: ExportDataPayload = {
    version: 2,
    app: 'NutriLens PWA Biohacking & Nutrition OS',
    exportDate: new Date().toISOString(),
    auditSummary: diagnostic,
    meals,
    recipes,
    goals,
    logs,
    canonicalFoods,
    learnedFoods,
    gamification,
    localSettings: {
      aiProvider: localStorage.getItem('nutrilens_ai_provider') || 'gemini',
      aiModel: localStorage.getItem('nutrilens_ai_model') || 'gemini-2.0-flash',
      hasFirebaseSync: !!localStorage.getItem('nutrilens_firebase_config')
    }
  };

  return { payload, diagnostic };
}

// Exportar toda la base de datos a un archivo JSON descargable
export async function exportDatabaseToJson(): Promise<{ payload: ExportDataPayload; diagnostic: DatabaseAuditDiagnostic }> {
  try {
    const { payload, diagnostic } = await generateFullDatabasePayload();
    const jsonString = JSON.stringify(payload, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `NutriLens_Full_Database_Audit_${timestamp}.json`;

    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    return { payload, diagnostic };
  } catch (error) {
    console.error('Error exportando base de datos:', error);
    throw new Error('No se pudo exportar la base de datos completa.');
  }
}

// Importar archivo de backup JSON y restaurar en IndexedDB
export async function importDatabaseFromJson(jsonContent: string): Promise<{ success: boolean; message: string }> {
  try {
    const data: ExportDataPayload = JSON.parse(jsonContent);

    if (!data.meals || !Array.isArray(data.meals)) {
      return { success: false, message: 'El archivo no tiene el formato válido de respaldo NutriLens.' };
    }

    await db.transaction('rw', [db.meals, db.recipes, db.goals, db.dailyLogs, db.canonicalFoods], async () => {
      // Limpiar y restaurar
      await db.meals.clear();
      await db.recipes.clear();
      await db.goals.clear();
      await db.dailyLogs.clear();
      await db.canonicalFoods.clear();

      if (data.meals.length > 0) {
        await db.meals.bulkPut(data.meals);
      }
      if (data.recipes && data.recipes.length > 0) {
        await db.recipes.bulkPut(data.recipes);
      }
      if (data.goals) {
        await db.goals.put(data.goals);
      }
      if (data.logs && data.logs.length > 0) {
        await db.dailyLogs.bulkPut(data.logs);
      }
      if (data.canonicalFoods && data.canonicalFoods.length > 0) {
        await db.canonicalFoods.bulkPut(data.canonicalFoods);
      }
    });

    if (data.gamification) {
      saveGamificationState(data.gamification);
    }

    return {
      success: true,
      message: `¡Restauración exitosa! Se importaron ${data.meals.length} comidas, ${data.canonicalFoods?.length || 0} alimentos canónicos y ${data.recipes?.length || 0} recetas.`
    };
  } catch (error: any) {
    return { success: false, message: `Error importando respaldo: ${error.message}` };
  }
}
