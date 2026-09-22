import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Zap, Moon, AlertTriangle, ShieldCheck, Plus, Check, Coffee, Droplets, Info, Minus, Sparkles, RotateCcw } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Meal, Micronutrients, NutritionGoals } from '../../types/nutrition.types';
import { dbService } from '../../db/dbService';
import { DbDailyLog } from '../../types/db.types';
import { awardXp, unlockAchievement } from '../../services/gamificationService';

interface SupplementTrackerCardProps {
  date: string;
  meals: Meal[];
  dailyNutrients: Micronutrients;
  goals: NutritionGoals;
}

export const SupplementTrackerCard: React.FC<SupplementTrackerCardProps> = ({
  date,
  meals,
  dailyNutrients,
  goals
}) => {
  const dailyLog = useLiveQuery(async () => {
    return await dbService.getDailyLog(date);
  }, [date]);

  const [isSaving, setIsSaving] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Configuración de límites y horarios
  const maxCaffeine = goals.profile?.caffeineDailyMaxMg || 400; // FDA recomendación 400mg
  const cutoffHour = goals.profile?.caffeineCutoffHour || 15; // 15:00 hrs (3 PM)
  const targetCreatine = 5; // 5g saturación diaria
  const targetSodium = goals.microGoals?.sodium_mg || 3500; // 3,500 mg meta deportiva

  // Cafeína acumulada en comidas del día
  const mealsCaffeine = Math.round(dailyNutrients.caffeine_mg || 0);
  const manualCaffeine = dailyLog?.caffeineMg || 0;
  const totalCaffeine = mealsCaffeine + manualCaffeine;

  // Creatina acumulada en comidas del día
  const mealsCreatine = Math.round((dailyNutrients.creatine_g || 0) * 10) / 10;
  const manualCreatine = dailyLog?.creatineG !== undefined
    ? dailyLog.creatineG
    : (dailyLog?.creatineTaken ? 5 : 0);
  const totalCreatine = Math.round((mealsCreatine + manualCreatine) * 10) / 10;

  // Sodio acumulado en comidas vs adicionado a bebidas/shakers
  const mealsSodium = Math.round(dailyNutrients.sodium_mg || 0);
  const manualSodium = dailyLog?.sodiumMg || 0;
  const totalSodium = mealsSodium + manualSodium;
  const sodiumPercent = Math.min(100, Math.round((totalSodium / targetSodium) * 100));

  // Chequeo de cronobiología de cafeína (después de cutoffHour)
  const lateCaffeineMeals: { name: string; time: string; caffeine: number }[] = [];

  for (const meal of meals) {
    const mealCaffeine = meal.totalNutrients?.caffeine_mg || 0;
    if (mealCaffeine > 0 && meal.time) {
      // Parsear hora HH:mm
      const parts = meal.time.split(':');
      if (parts.length >= 1) {
        const hour = parseInt(parts[0], 10);
        if (!isNaN(hour) && hour >= cutoffHour) {
          lateCaffeineMeals.push({
            name: meal.name,
            time: meal.time,
            caffeine: Math.round(mealCaffeine)
          });
        }
      }
    }
  }

  // Estado del semáforo de cafeína
  const isCaffeineOverLimit = totalCaffeine >= maxCaffeine;
  const isCaffeineNearLimit = totalCaffeine >= maxCaffeine * 0.75 && !isCaffeineOverLimit;
  const caffeinePercent = Math.min(100, Math.round((totalCaffeine / maxCaffeine) * 100));

  // Manejo de actualización de creatina manual
  const handleToggleCreatine = async () => {
    setIsSaving(true);
    const newCreatineTaken = !manualCreatine || manualCreatine === 0;
    const newCreatineG = newCreatineTaken ? targetCreatine : 0;

    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      waterMl: dailyLog?.waterMl,
      completedGoals: dailyLog?.completedGoals,
      caffeineMg: dailyLog?.caffeineMg,
      sodiumMg: dailyLog?.sodiumMg,
      creatineTaken: newCreatineTaken,
      creatineG: newCreatineG
    };

    await dbService.updateDailyLog(updatedLog);

    if (newCreatineTaken) {
      awardXp(50, 'Dosis Diaria de Creatina 5g');
      unlockAchievement('creatine_habit');
    }

    setIsSaving(false);
  };

  // Manejo de añadir cafeína rápida
  const handleAddCaffeine = async (mg: number) => {
    setIsSaving(true);
    const newCaffeine = Math.max(0, (dailyLog?.caffeineMg || 0) + mg);

    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      waterMl: dailyLog?.waterMl,
      completedGoals: dailyLog?.completedGoals,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      sodiumMg: dailyLog?.sodiumMg,
      caffeineMg: newCaffeine
    };

    await dbService.updateDailyLog(updatedLog);
    setIsSaving(false);
  };

  const handleResetCaffeineManual = async () => {
    setIsSaving(true);
    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      waterMl: dailyLog?.waterMl,
      completedGoals: dailyLog?.completedGoals,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      sodiumMg: dailyLog?.sodiumMg,
      caffeineMg: 0
    };

    await dbService.updateDailyLog(updatedLog);
    setIsSaving(false);
  };

  // Manejo de añadir sodio manual (a shaker, botellas o electrolitos)
  const handleAddSodium = async (mg: number) => {
    setIsSaving(true);
    const newSodium = Math.max(0, (dailyLog?.sodiumMg || 0) + mg);

    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      waterMl: dailyLog?.waterMl,
      completedGoals: dailyLog?.completedGoals,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      caffeineMg: dailyLog?.caffeineMg,
      sodiumMg: newSodium
    };

    await dbService.updateDailyLog(updatedLog);

    if (newSodium >= 500 && (dailyLog?.sodiumMg || 0) < 500) {
      awardXp(30, 'Electrólitos & Sodio Deportivo');
    }

    setIsSaving(false);
  };

  const handleResetSodiumManual = async () => {
    setIsSaving(true);
    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      waterMl: dailyLog?.waterMl,
      completedGoals: dailyLog?.completedGoals,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      caffeineMg: dailyLog?.caffeineMg,
      sodiumMg: 0
    };

    await dbService.updateDailyLog(updatedLog);
    setIsSaving(false);
  };

  return (
    <Card className="border border-slate-200 shadow-xs bg-white space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
            <Zap size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Suplementación & Seguridad</h3>
              <Badge variant="purple" size="sm">Metas Diarias & Cronobiología</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Control del Trío de Rendimiento: Cafeína, Creatina (5g) y Sodio/Electrólitos ({targetSodium}mg).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowInfoModal(!showInfoModal)}
          className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 transition-colors"
        >
          <Info size={13} />
          <span>Bases Científicas</span>
        </button>
      </div>

      {/* Info científica colapsable */}
      {showInfoModal && (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 animate-fadeIn">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Pautas Clínicas de Suplementación & Rendimiento:</span>
          </div>
          <p className="leading-relaxed">
            • <strong>Creatina Monohidrato (5g/día):</strong> Aumenta los depósitos intramusculares de fosfocreatina (ATP-PCr). Su absorción requiere un gradiente de sodio activo (transportador CreaT-1).
          </p>
          <p className="leading-relaxed">
            • <strong>Sodio & Balance Hídrico (Meta deportiva: 3,500mg/día):</strong> Al entrenar 3 horas (2h pesas + 1h cardio en Rosarito) y beber ~5L de agua purificada, el sodio previene la hiponatremia dilucional, mantiene el bombeo muscular y retiene el agua dentro del músculo.
          </p>
          <p className="leading-relaxed">
            • <strong>Cafeína (Límite seguro ≤ 400mg/día - FDA):</strong> Consumir antes de las 15:00 hrs para evitar el bloqueo nocturno de receptores de adenosina y proteger el sueño profundo N3.
          </p>
        </div>
      )}

      {/* Grid de 3 Columnas: Cafeína, Creatina y Sodio */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* TARJETA CAFEÍNA */}
        <div className={`p-4 rounded-2xl border transition-all ${
          isCaffeineOverLimit
            ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/10'
            : isCaffeineNearLimit
            ? 'bg-amber-50/40 border-amber-300'
            : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                isCaffeineOverLimit ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
              }`}>
                <Coffee size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Cafeína</span>
                <span className="text-[10px] text-slate-500">Límite FDA: 400 mg/día</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-black font-mono ${
                isCaffeineOverLimit ? 'text-rose-700' : isCaffeineNearLimit ? 'text-amber-800' : 'text-slate-900'
              }`}>
                {totalCaffeine}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / {maxCaffeine} mg</span>
            </div>
          </div>

          {/* Barra de Progreso de Cafeína */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCaffeineOverLimit
                  ? 'bg-rose-600'
                  : isCaffeineNearLimit
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 to-amber-400'
              }`}
              style={{ width: `${caffeinePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className={`font-semibold ${
              isCaffeineOverLimit
                ? 'text-rose-700 font-bold'
                : isCaffeineNearLimit
                ? 'text-amber-800 font-bold'
                : 'text-emerald-700'
            }`}>
              {isCaffeineOverLimit
                ? '🚨 Límite de seguridad alcanzado o superado'
                : isCaffeineNearLimit
                ? '⚠️ Cerca del umbral diario máximo'
                : `Quedan ${Math.max(0, maxCaffeine - totalCaffeine)} mg dentro de margen seguro`}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {caffeinePercent}%
            </span>
          </div>

          {/* Botones de Registro Rápido de Cafeína */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Registro Rápido de Ingesta:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddCaffeine(80)}
                className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Café espresso tradicional o americano (~80mg)"
              >
                <Plus size={11} className="text-amber-700" />
                <span>80mg Café</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddCaffeine(40)}
                className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Té verde o matcha (~40mg)"
              >
                <Plus size={11} className="text-emerald-700" />
                <span>40mg Té</span>
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddCaffeine(150)}
                className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                title="Scoop de pre-entreno o bebida energética (~150mg)"
              >
                <Plus size={11} className="text-purple-700" />
                <span>150mg Pre</span>
              </button>
            </div>
            {manualCaffeine > 0 && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500">
                  +{manualCaffeine} mg añadidos manualmente
                </span>
                <button
                  type="button"
                  onClick={handleResetCaffeineManual}
                  className="text-[10px] text-rose-600 hover:underline font-medium"
                >
                  Restablecer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* TARJETA CREATINA */}
        <div className={`p-4 rounded-2xl border transition-all ${
          totalCreatine >= targetCreatine
            ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/10'
            : 'bg-purple-50/40 border-purple-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${
                totalCreatine >= targetCreatine ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-700'
              }`}>
                <Zap size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Creatina Monohidrato</span>
                <span className="text-[10px] text-slate-500">Meta saturación: 5 g/día</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-black font-mono ${
                totalCreatine >= targetCreatine ? 'text-emerald-700' : 'text-purple-900'
              }`}>
                {totalCreatine}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / {targetCreatine} g</span>
            </div>
          </div>

          {/* Barra de Progreso de Creatina */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalCreatine >= targetCreatine
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-600'
              }`}
              style={{ width: `${Math.min(100, Math.round((totalCreatine / targetCreatine) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className={`font-semibold ${
              totalCreatine >= targetCreatine ? 'text-emerald-700 font-bold' : 'text-purple-800'
            }`}>
              {totalCreatine >= targetCreatine
                ? '✨ ¡Meta de saturación cubierta hoy!'
                : `Faltan ${(targetCreatine - totalCreatine).toFixed(1)} g para saturación`}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {Math.min(100, Math.round((totalCreatine / targetCreatine) * 100))}%
            </span>
          </div>

          {/* Botón de 1 Clic para Tomar Dosis Diaria */}
          <div className="pt-1 border-t border-purple-200/60 space-y-2">
            <button
              type="button"
              disabled={isSaving}
              onClick={handleToggleCreatine}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                totalCreatine >= targetCreatine
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white shadow-xs shadow-purple-600/20 active:scale-98'
              }`}
            >
              {totalCreatine >= targetCreatine ? (
                <>
                  <Check size={15} className="text-emerald-700" />
                  <span>Dosis Tomada (5g) ✓</span>
                </>
              ) : (
                <>
                  <Zap size={14} className="text-amber-300" />
                  <span>Tomar Dosis Diaria (5g Monohidrato)</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <Droplets size={12} className="text-sky-500 shrink-0" />
              <span>Acompaña la creatina con +500ml de agua para hidratación celular.</span>
            </div>
          </div>
        </div>

        {/* TARJETA SODIO & ELECTRÓLITOS */}
        <div className={`p-4 rounded-2xl border transition-all md:col-span-2 xl:col-span-1 ${
          totalSodium >= targetSodium
            ? 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-500/10'
            : 'bg-slate-50/70 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-100 text-sky-800">
                <Sparkles size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Sodio & Electrólitos</span>
                <span className="text-[10px] text-slate-500">Meta deportiva: {targetSodium} mg</span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-base font-black font-mono ${
                totalSodium >= targetSodium ? 'text-sky-700' : 'text-slate-900'
              }`}>
                {totalSodium}
              </span>
              <span className="text-xs text-slate-500 font-medium"> / {targetSodium} mg</span>
            </div>
          </div>

          {/* Barra de Progreso de Sodio */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalSodium >= targetSodium
                  ? 'bg-emerald-500'
                  : 'bg-gradient-to-r from-sky-400 to-blue-600'
              }`}
              style={{ width: `${sodiumPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] mb-3">
            <span className={`font-semibold ${
              totalSodium >= targetSodium ? 'text-emerald-700 font-bold' : 'text-sky-800'
            }`}>
              {totalSodium >= targetSodium
                ? '🌊 Balance electrolítico e hídrico cubierto'
                : `Faltan ${Math.max(0, targetSodium - totalSodium)} mg para proteger tus 4.8L`}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {sodiumPercent}%
            </span>
          </div>

          {/* Desglose de origen */}
          <div className="p-2 rounded-xl bg-white/80 border border-slate-200/70 text-[10px] text-slate-600 mb-2.5 space-y-0.5 font-medium">
            <div className="flex justify-between">
              <span>🍽️ De comidas sólidas:</span>
              <span className="font-mono font-bold text-slate-900">{mealsSodium} mg</span>
            </div>
            <div className="flex justify-between">
              <span>🧂 Añadido en shakers / agua:</span>
              <span className="font-mono font-bold text-sky-700">+{manualSodium} mg</span>
            </div>
          </div>

          {/* Botones de Ingesta Rápida de Sodio */}
          <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Añadir a Agua / Shaker:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddSodium(500)}
                className="py-1 px-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[11px] font-bold text-slate-800 transition-all text-center shadow-2xs"
                title="Pizca de sal de mar en 1L de agua"
              >
                +500 mg
                <span className="block text-[9px] text-slate-400 font-normal">Pizca Sal</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddSodium(1000)}
                className="py-1 px-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[11px] font-bold text-slate-800 transition-all text-center shadow-2xs"
                title="1/2 cdta sal en Shaker 1.5L entreno"
              >
                +1,000 mg
                <span className="block text-[9px] text-slate-400 font-normal">½ cdta Sal</span>
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={() => handleAddSodium(1500)}
                className="py-1 px-1.5 rounded-lg bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-[11px] font-bold text-slate-800 transition-all text-center shadow-2xs"
                title="Sobre de electrolitos / Suero oral"
              >
                +1,500 mg
                <span className="block text-[9px] text-slate-400 font-normal">Electrolitos</span>
              </button>
            </div>

            {manualSodium > 0 && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleAddSodium(-500)}
                  className="text-[10px] text-slate-500 hover:text-rose-600 font-medium flex items-center gap-0.5"
                >
                  <Minus size={11} /> -500 mg
                </button>
                <button
                  type="button"
                  onClick={handleResetSodiumManual}
                  className="text-[10px] text-rose-600 hover:underline font-medium"
                >
                  Restablecer manual
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ALERTA DE CRONOBIOLOGÍA DEL SUEÑO (Si hubo cafeína después de las 15:00) */}
      {lateCaffeineMeals.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-2xs">
          <div className="p-1.5 rounded-xl bg-amber-200/70 text-amber-900 shrink-0 mt-0.5">
            <Moon size={16} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black">
                ⚠️ Alerta de Cronobiología: Ingesta Tardía de Cafeína
              </span>
              <Badge variant="amber" size="sm">Corte recomendado: {cutoffHour}:00 hrs</Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Registraste cafeína pasadas las {cutoffHour}:00 hrs en:
              {lateCaffeineMeals.map((m, idx) => (
                <span key={idx} className="font-bold"> "{m.name}" ({m.time} - {m.caffeine}mg){idx < lateCaffeineMeals.length - 1 ? ', ' : '.'} </span>
              ))}
              La cafeína tiene una vida media de 5 a 7 horas; su presencia en sangre durante la noche fragmenta la arquitectura del sueño profundo (fase N3 de ondas lentas) y disminuye la producción de hormona de crecimiento.
            </p>
          </div>
        </div>
      )}

      {/* ALERTA DE SEGURIDAD FDA (Si excede 400 mg) */}
      {isCaffeineOverLimit && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3 shadow-2xs">
          <div className="p-1.5 rounded-xl bg-rose-200/80 text-rose-900 shrink-0 mt-0.5">
            <AlertTriangle size={16} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black">
                🚨 Advertencia de Seguridad: Límite Seguro FDA Excedido
              </span>
              <Badge variant="rose" size="sm">{totalCaffeine} mg / {maxCaffeine} mg</Badge>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-900/90">
              Has superado los 400 mg recomendados como límite seguro diario. El exceso agudo de cafeína puede provocar taquicardia, vasoconstricción, aumento de la presión arterial, temblores e hiperreactividad del sistema nervioso simpático. Evita cualquier bebida energética, café adicional o pre-entreno hoy.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
