import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Droplets, Plus, Minus, RotateCcw, Award, Sparkles, Dumbbell, BedDouble, Info, Check, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { dbService } from '../../db/dbService';
import { DbDailyLog } from '../../types/db.types';
import { NutritionGoals } from '../../types/nutrition.types';
import { awardXp, unlockAchievement } from '../../services/gamificationService';

interface WaterTrackerCardProps {
  date: string;
  goals: NutritionGoals;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({ date, goals }) => {
  const dailyLog = useLiveQuery(async () => {
    return await dbService.getDailyLog(date);
  }, [date]);

  // Determinar si por defecto es día de entrenamiento (Lunes a Sábado = 1 a 6 en getDay(), Domingo = 0)
  // Parsear fecha YYYY-MM-DD sin desajuste de zona horaria
  const [year, month, day] = date.split('-').map(Number);
  const dayOfWeek = new Date(year, month - 1, day).getDay(); // 0 = Domingo
  const isDefaultTrainingDay = dayOfWeek !== 0;

  const [isTrainingDay, setIsTrainingDay] = useState(isDefaultTrainingDay);
  const [customTargetMl, setCustomTargetMl] = useState<number | null>(null);
  const [manualMlInput, setManualMlInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showElectrolyteTip, setShowElectrolyteTip] = useState(false);
  const [justCelebrated, setJustCelebrated] = useState(false);

  // Sincronizar estado inicial al cambiar de fecha
  useEffect(() => {
    const isWorkoutDay = dayOfWeek !== 0;
    setIsTrainingDay(isWorkoutDay);
    setCustomTargetMl(null);
    setJustCelebrated(false);
  }, [date, dayOfWeek]);

  // Metas personalizadas para Donat (78kg, 1.74m, Rosarito, 3h gym+cardio, 5g creatina)
  // Lun-Sáb (3h entreno + clima costero): 4,800 ml
  // Dom (descanso + creatina): 3,500 ml
  const targetMl = customTargetMl !== null
    ? customTargetMl
    : isTrainingDay
    ? 4800
    : 3500;

  const currentWaterMl = dailyLog?.waterMl || 0;
  const progressPct = Math.min(100, Math.round((currentWaterMl / targetMl) * 100));
  const remainingMl = Math.max(0, targetMl - currentWaterMl);

  // Función para guardar agua en IndexedDB
  const handleUpdateWater = async (newAmount: number) => {
    const safeAmount = Math.max(0, Math.min(10000, Math.round(newAmount)));
    setIsSaving(true);

    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      caffeineMg: dailyLog?.caffeineMg,
      sodiumMg: dailyLog?.sodiumMg,
      completedGoals: dailyLog?.completedGoals,
      waterMl: safeAmount
    };

    await dbService.updateDailyLog(updatedLog);

    // Si alcanza la meta por primera vez hoy, premiar con XP y desbloqueo
    if (safeAmount >= targetMl && currentWaterMl < targetMl && !justCelebrated) {
      awardXp(40, 'Meta de Hidratación Deportiva Cumplida');
      unlockAchievement('creatine_habit');
      setJustCelebrated(true);
    }

    setIsSaving(false);
  };

  const handleAddAmount = (amountToAdd: number) => {
    handleUpdateWater(currentWaterMl + amountToAdd);
  };

  // Añadir agua y sodio simultáneamente al shaker de entrenamiento
  const handleAddWaterWithSodium = async (waterAdd: number, sodiumAdd: number) => {
    const safeWater = Math.max(0, Math.min(10000, Math.round(currentWaterMl + waterAdd)));
    const safeSodium = Math.max(0, Math.round((dailyLog?.sodiumMg || 0) + sodiumAdd));
    setIsSaving(true);

    const updatedLog: DbDailyLog = {
      id: dailyLog?.id || `log_${date}`,
      date,
      reasonTag: dailyLog?.reasonTag,
      reflectionNotes: dailyLog?.reflectionNotes,
      creatineTaken: dailyLog?.creatineTaken,
      creatineG: dailyLog?.creatineG,
      caffeineMg: dailyLog?.caffeineMg,
      completedGoals: dailyLog?.completedGoals,
      waterMl: safeWater,
      sodiumMg: safeSodium
    };

    await dbService.updateDailyLog(updatedLog);
    awardXp(30, 'Shaker de Hidratación & Electrólitos');
    setIsSaving(false);
  };

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(manualMlInput, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      handleUpdateWater(parsed);
      setManualMlInput('');
    }
  };

  // Estado del semáforo de hidratación
  const getHydrationStatus = () => {
    if (progressPct >= 100) {
      return {
        label: '🏆 Hidratación Óptima Alcanzada',
        desc: 'Tus células musculares y depósitos de creatina están 100% saturados.',
        textColor: 'text-emerald-700',
        badgeVariant: 'emerald' as const
      };
    }
    if (progressPct >= 70) {
      return {
        label: '🌊 Nivel Alto de Hidratación',
        desc: `Casi en la meta. Faltan ${remainingMl} ml para cubrir tu reposición de sudor.`,
        textColor: 'text-sky-700',
        badgeVariant: 'blue' as const
      };
    }
    if (progressPct >= 35) {
      return {
        label: '💧 En Progreso Deportivo',
        desc: 'Mantén sorbos constantes intra-entreno con pizca de sodio.',
        textColor: 'text-blue-700',
        badgeVariant: 'blue' as const
      };
    }
    return {
      label: '⚠️ Hidratación Inicial / Baja',
      desc: 'Inicia tu hidratación pre-entreno para optimizar el bombeo muscular.',
      textColor: 'text-amber-800',
      badgeVariant: 'amber' as const
    };
  };

  const status = getHydrationStatus();

  return (
    <Card className="border border-sky-200/90 shadow-sm bg-gradient-to-br from-sky-50/40 via-white to-blue-50/20 space-y-4">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/20 shrink-0">
            <Droplets size={22} className="animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-black text-slate-900">Registro de Hidratación & Agua</h3>
              <Badge variant={status.badgeVariant} size="sm">
                {status.label}
              </Badge>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Ajustado a: 78 kg • 1.74 m • Rosarito B.C. • 3h Gym+Cardio • Creatina 5g
            </p>
          </div>
        </div>

        {/* Alternador de Modo: Día de Entreno vs Descanso */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setIsTrainingDay(true);
              setCustomTargetMl(null);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              isTrainingDay && customTargetMl === null
                ? 'bg-white text-sky-950 shadow-xs border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Dumbbell size={13} className={isTrainingDay ? 'text-sky-600' : 'text-slate-400'} />
            <span>Entreno (4.8L)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsTrainingDay(false);
              setCustomTargetMl(null);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              !isTrainingDay && customTargetMl === null
                ? 'bg-white text-sky-950 shadow-xs border border-sky-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble size={13} className={!isTrainingDay ? 'text-sky-600' : 'text-slate-400'} />
            <span>Descanso (3.5L)</span>
          </button>
        </div>
      </div>

      {/* Indicador Central de Volumen y Barra de Nivel de Agua */}
      <div className="p-4 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-3">
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
              Ingesta Acumulada
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-slate-900">
                {(currentWaterMl / 1000).toFixed(2)}
              </span>
              <span className="text-sm font-bold text-slate-500">
                / {(targetMl / 1000).toFixed(1)} L ({currentWaterMl} ml)
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black font-mono text-sky-600">
              {progressPct}%
            </span>
            <span className="text-[11px] text-slate-500 block font-medium">
              {remainingMl > 0 ? `Faltan ${remainingMl} ml` : '¡Meta completada!'}
            </span>
          </div>
        </div>

        {/* Barra de progreso de agua */}
        <div className="w-full bg-sky-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-sky-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 transition-all duration-500 shadow-inner"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className={`text-xs font-semibold ${status.textColor}`}>
          {status.desc}
        </p>
      </div>

      {/* Botones de Registro Rápido 1-Tap */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
          Añadir Ingesta Rápida:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleAddAmount(250)}
            className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-800 text-center transition-all shadow-2xs group active:scale-95"
          >
            <span className="text-base block group-hover:scale-110 transition-transform">🥛</span>
            <span className="text-xs font-bold text-slate-900 block">+250 ml</span>
            <span className="text-[10px] text-slate-500">1 Vaso</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleAddAmount(500)}
            className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-800 text-center transition-all shadow-2xs group active:scale-95"
          >
            <span className="text-base block group-hover:scale-110 transition-transform">🍶</span>
            <span className="text-xs font-bold text-slate-900 block">+500 ml</span>
            <span className="text-[10px] text-slate-500">Shaker / Botella</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleAddAmount(750)}
            className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-800 text-center transition-all shadow-2xs group active:scale-95"
          >
            <span className="text-base block group-hover:scale-110 transition-transform">🚴</span>
            <span className="text-xs font-bold text-slate-900 block">+750 ml</span>
            <span className="text-[10px] text-slate-500">Botella Gym</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleAddAmount(1000)}
            className="p-2.5 rounded-xl bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-800 text-center transition-all shadow-2xs group active:scale-95"
          >
            <span className="text-base block group-hover:scale-110 transition-transform">🧊</span>
            <span className="text-xs font-bold text-slate-900 block">+1,000 ml</span>
            <span className="text-[10px] text-slate-500">Termo 1L</span>
          </button>

          <button
            type="button"
            disabled={isSaving || currentWaterMl <= 0}
            onClick={() => handleAddAmount(-250)}
            className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 text-center transition-all shadow-2xs group active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Minus size={16} className="mx-auto text-rose-600 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-rose-700 block mt-0.5">-250 ml</span>
            <span className="text-[10px] text-slate-400">Corregir</span>
          </button>
        </div>

        {/* Shakers con Sodio para Entrenamiento y Rosarito */}
        <div className="p-2.5 rounded-xl bg-sky-100/60 border border-sky-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🧂</span>
            <div>
              <span className="font-bold text-sky-950 block text-[11px]">Shaker Pre/Intra-Entreno (Agua + Sodio):</span>
              <span className="text-[10px] text-sky-800">
                Sodio añadido a bebidas hoy: <strong className="font-mono">+{dailyLog?.sodiumMg || 0} mg</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleAddWaterWithSodium(500, 500)}
              className="py-1 px-2.5 rounded-lg bg-white hover:bg-sky-50 border border-sky-300 text-[11px] font-bold text-sky-900 shadow-2xs active:scale-95 transition-all"
              title="Añade 500ml de agua y 500mg de sodio (pizca de sal)"
            >
              +500ml + 500mg Na
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleAddWaterWithSodium(1500, 1000)}
              className="py-1 px-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
              title="Añade 1.5L de agua Ciel y 1000mg de sodio (1/2 cdta sal para tus 3h de entreno)"
            >
              +1.5L + 1,000mg Na (Gym 3h)
            </button>
          </div>
        </div>
      </div>

      {/* Entrada Manual de ml exactos y Reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-sky-100">
        <form onSubmit={handleDirectSubmit} className="flex items-center gap-1.5 flex-1 max-w-sm">
          <input
            type="number"
            min="0"
            max="10000"
            step="50"
            value={manualMlInput}
            onChange={(e) => setManualMlInput(e.target.value)}
            placeholder="Fijar ml exactos (ej: 3200)..."
            className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-sky-500 font-mono font-medium"
          />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!manualMlInput}
            className="text-xs shrink-0"
          >
            Fijar
          </Button>
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowElectrolyteTip(!showElectrolyteTip)}
            className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 transition-colors"
          >
            <Info size={13} />
            <span>¿Agua Ciel y Sodio?</span>
          </button>

          {currentWaterMl > 0 && (
            <button
              type="button"
              onClick={() => handleUpdateWater(0)}
              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
              title="Reiniciar agua del día a 0"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Consejo Bioquímico Desplegable: Agua de Garrafón (Ciel) y Adición de Sodio */}
      {showElectrolyteTip && (
        <div className="p-3.5 rounded-2xl bg-sky-50/90 border border-sky-200 text-xs text-slate-800 space-y-2 animate-fadeIn">
          <div className="font-bold text-sky-950 flex items-center gap-1.5">
            <Sparkles size={15} className="text-sky-600" />
            <span>Guía de Electrólitos para Agua Purificada (Garrafón Ciel / Bonafont):</span>
          </div>
          <p className="leading-relaxed">
            • <strong>El agua de garrafón (Ciel, Epura, etc.) es desmineralizada:</strong> Pasa por ósmosis inversa y tiene casi 0 mg de sodio y potasio. Al beber <strong>4.8 a 5.0 Litros</strong> diarios mientras entrenas 3 horas en Rosarito, el agua pura sin solutos lava tus electrolitos y produce <em>hiponatremia dilucional</em> (orinar cada 20 minutos, fatiga celular y pérdida del bombeo muscular).
          </p>
          <p className="leading-relaxed">
            • <strong>¿Ocupas adicionar sodio? SÍ, en tu shaker de entreno:</strong> Agrega entre <strong>1/4 y 1/2 cucharadita de sal de mar o grano</strong> (500 a 1,000 mg de sodio) con un chorrito de limón a tu termo de 1.5L que tomas durante el gym y cardio.
          </p>
          <p className="leading-relaxed">
            • <strong>Sinergia con Creatina y Comidas:</strong> El resto de tu meta (~2,500 a 3,000 mg de sodio) lo cubres sazonando bien tus comidas sólidas. La sal transporta el agua y la creatina hacia el <strong>interior del citoplasma muscular</strong>, evitando la deshidratación extracelular.
          </p>
        </div>
      )}
    </Card>
  );
};
