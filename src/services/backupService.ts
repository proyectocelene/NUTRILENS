import { db } from '../db';
import { ExportDataPayload } from '../types/db.types';
import { Meal, NutritionGoals } from '../types/nutrition.types';
import { DEFAULT_NUTRITION_GOALS } from '../db/seedData';

// Exportar toda la base de datos a un objeto JSON descargable
export async function exportDatabaseToJson(): Promise<void> {
  try {
    const meals = await db.meals.toArray();
    const recipes = await db.recipes.toArray();
    const goalsList = await db.goals.toArray();
    const logs = await db.dailyLogs.toArray();
    const canonicalFoods = await db.canonicalFoods.toArray();

    const goals = goalsList[0] || DEFAULT_NUTRITION_GOALS;

    const payload: ExportDataPayload = {
      version: 1,
      exportDate: new Date().toISOString(),
      meals,
      recipes,
      goals,
      logs,
      canonicalFoods
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const fileName = `NutriLens_Backup_${new Date().toISOString().split('T')[0]}.json`;
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  } catch (error) {
    console.error('Error exportando base de datos:', error);
    throw new Error('No se pudo exportar la base de datos.');
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

    return {
      success: true,
      message: `¡Restauración exitosa! Se importaron ${data.meals.length} comidas y ${data.canonicalFoods?.length || 0} alimentos canónicos.`
    };
  } catch (error: any) {
    return { success: false, message: `Error importando respaldo: ${error.message}` };
  }
}
