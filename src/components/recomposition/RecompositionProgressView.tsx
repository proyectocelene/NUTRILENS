import React, { useState, useEffect } from 'react';
import { 
  Target, 
  TrendingDown, 
  Dumbbell, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Award, 
  Sparkles, 
  Save, 
  Check, 
  Flame, 
  Activity, 
  Scale, 
  Ruler, 
  Zap, 
  ChevronRight, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { NutritionGoals } from '../../types/nutrition.types';
import { dbService } from '../../db/dbService';
import { awardXp } from '../../services/gamificationService';

interface RecompositionProgressViewProps {
  goals: NutritionGoals;
  onSaveGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
}

export const RecompositionProgressView: React.FC<RecompositionProgressViewProps> = ({
  goals,
  onSaveGoals
}) => {
  const profile = goals.profile;
  const startWeight = 78.35;
  const targetWeight = profile?.targetWeightKg || 71.0;
  const currentWeight = profile?.currentWeightKg || 78.35;

  const startWaist = 38.5;
  const targetWaist = profile?.targetWaistInches || 32.0;
  const currentWaist = profile?.currentWaistInches || 38.5;

  // Cálculo de progreso porcentual
  const totalWeightToLose = Math.max(0.1, startWeight - targetWeight);
  const currentWeightLost = Math.max(0, startWeight - currentWeight);
  const weightProgressPct = Math.min(100, Math.max(0, Math.round((currentWeightLost / totalWeightToLose) * 100)));

  const totalWaistToLose = Math.max(0.1, startWaist - targetWaist);
  const currentWaistLost = Math.max(0, startWaist - currentWaist);
  const waistProgressPct = Math.min(100, Math.max(0, Math.round((currentWaistLost / totalWaistToLose) * 100)));

  // Determinación de la fase actual
  // Fase 1: 78.35kg -> 74.0kg y cintura > 35"
  // Fase 2: 74.0kg -> 71.0kg y cintura 35" -> 32"
  // Fase 3: <= 71.0kg y cintura <= 32"
  let currentPhase = 1;
  if (currentWeight <= 71.0 && currentWaist <= 32.0) {
    currentPhase = 3;
  } else if (currentWeight <= 74.0 && currentWaist <= 35.0) {
    currentPhase = 2;
  }

  // Formulario de actualización de medidas
  const [newWeight, setNewWeight] = useState(currentWeight.toString());
  const [newWaist, setNewWaist] = useState(currentWaist.toString());
  const [newBodyFat, setNewBodyFat] = useState((profile?.bodyFatPct || 24.4).toString());
  const [newVisceral, setNewVisceral] = useState((profile?.visceralFatLevel || 11.5).toString());
  const [isSaved, setIsSaved] = useState(false);
  const [isImportingMenu, setIsImportingMenu] = useState(false);
  const [menuLoaded, setMenuLoaded] = useState(false);

  useEffect(() => {
    setNewWeight(currentWeight.toString());
    setNewWaist(currentWaist.toString());
    setNewBodyFat((profile?.bodyFatPct || 24.4).toString());
    setNewVisceral((profile?.visceralFatLevel || 11.5).toString());
  }, [profile]);

  const handleSaveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile = {
      age: profile?.age || 26,
      heightCm: profile?.heightCm || 174,
      currentWeightKg: parseFloat(newWeight) || currentWeight,
      targetWeightKg: targetWeight,
      bmrKcal: profile?.bmrKcal || 1702,
      bodyFatPct: parseFloat(newBodyFat) || 24.4,
      visceralFatLevel: parseFloat(newVisceral) || 11.5,
      currentWaistInches: parseFloat(newWaist) || currentWaist,
      targetWaistInches: targetWaist,
      targetWaterLiters: goals.waterLiters || 3.5,
      creatineDailyGrams: 5
    };

    await onSaveGoals({ profile: updatedProfile });
    awardXp(40, 'Actualización de Medidas de Recomposición');

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLoadFullDayMenu = async () => {
    setIsImportingMenu(true);
    try {
      await dbService.seedDemoMeals();
      setMenuLoaded(true);
      setTimeout(() => setMenuLoaded(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsImportingMenu(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Target size={22} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                Plan de Recomposición Corporal & Fases
                <Badge variant={currentPhase === 1 ? 'emerald' : currentPhase === 2 ? 'purple' : 'amber'} size="sm">
                  Fase {currentPhase} Activa
                </Badge>
              </h2>
              <p className="text-xs text-slate-500">
                1.74m • 26 años • Déficit controlado de grasa con preservación/ganancia muscular
              </p>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleLoadFullDayMenu}
          disabled={isImportingMenu}
          icon={menuLoaded ? <Check size={15} /> : <Sparkles size={15} />}
          className="text-xs shadow-sm self-start sm:self-auto"
        >
          {menuLoaded ? '¡Menú 3 Comidas Cargado!' : 'Cargar Menú Fase 1 (2,200 kcal)'}
        </Button>
      </div>

      {/* Tarjetas de Progreso Global */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Progreso de Peso */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Scale size={18} className="text-emerald-700" />
              <span className="text-xs font-bold text-slate-800">Progreso de Peso Corporal</span>
            </div>
            <span className="text-xs font-black text-emerald-800 font-mono">{weightProgressPct}% Completado</span>
          </div>

          <div className="flex items-baseline justify-between text-slate-900 mb-2">
            <span className="text-2xl font-black font-mono">{currentWeight} <span className="text-xs font-normal text-slate-500">kg actual</span></span>
            <span className="text-xs font-bold text-emerald-700 font-mono">Meta: {targetWeight} kg</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mb-1.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, weightProgressPct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Inicio: {startWeight} kg</span>
            <span>Faltan: {Math.max(0, Math.round((currentWeight - targetWeight) * 10) / 10)} kg</span>
          </div>
        </Card>

        {/* Progreso de Cintura */}
        <Card className="border-sky-200 bg-gradient-to-br from-sky-50/70 via-white to-indigo-50/30 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-sky-700" />
              <span className="text-xs font-bold text-slate-800">Progreso de Cintura (Ombligo)</span>
            </div>
            <span className="text-xs font-black text-sky-800 font-mono">{waistProgressPct}% Completado</span>
          </div>

          <div className="flex items-baseline justify-between text-slate-900 mb-2">
            <span className="text-2xl font-black font-mono">{currentWaist}" <span className="text-xs font-normal text-slate-500">pulgadas</span></span>
            <span className="text-xs font-bold text-sky-700 font-mono">Meta: {targetWaist}" (~81 cm)</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden mb-1.5">
            <div 
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${Math.max(5, waistProgressPct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Inicio: {startWaist}" (~98 cm)</span>
            <span>Faltan: {Math.max(0, Math.round((currentWaist - targetWaist) * 10) / 10)}"</span>
          </div>
        </Card>
      </div>

      {/* Roadmap de las 3 Fases y Condiciones de Cambio */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Zap size={16} className="text-amber-600" />
          <span>Mapa de Ruta: ¿Cuándo y Cómo se Cambia de Fase?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* FASE 1 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentPhase === 1 
              ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20 shadow-xs' 
              : 'bg-white border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Fase 1: Salud & Base
              </span>
              <Badge variant={currentPhase === 1 ? 'emerald' : 'slate'} size="sm">
                {currentPhase === 1 ? 'En Curso' : 'Completada'}
              </Badge>
            </div>

            <p className="text-xs text-slate-700 font-medium mb-3">
              Déficit moderado de <strong>~500 kcal</strong> para crear adherencia y oxidar grasa visceral.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-2 font-mono">
              <div>🎯 <strong>2,200 kcal</strong> (175g P • 245g C • 58g F)</div>
              <div>📉 Rango: <strong>78.35kg → 74.0kg</strong></div>
              <div>📏 Cintura: <strong>38.5" → 35.0"</strong></div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-white border border-emerald-200 text-[11px] text-emerald-900 font-medium">
              <strong>Condición para Fase 2:</strong> Llegar a 74.0 kg y reducir cintura a 35.0" con alta energía.
            </div>
          </div>

          {/* FASE 2 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentPhase === 2 
              ? 'bg-purple-50/70 border-purple-300 ring-2 ring-purple-500/20 shadow-xs' 
              : 'bg-white border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-900">
                Fase 2: Definición & Hipertrofia
              </span>
              <Badge variant={currentPhase === 2 ? 'purple' : 'slate'} size="sm">
                {currentPhase === 2 ? 'En Curso' : currentPhase > 2 ? 'Completada' : 'Bloqueada'}
              </Badge>
            </div>

            <p className="text-xs text-slate-700 font-medium mb-3">
              Déficit más ajustado (<strong>~300 kcal</strong>) y aumento de proteína a <strong>185g</strong> para máxima rocosidad.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-2 font-mono">
              <div>🎯 <strong>2,050 kcal</strong> (185g P • 215g C • 50g F)</div>
              <div>📉 Rango: <strong>74.0kg → 71.0kg</strong></div>
              <div>📏 Cintura: <strong>35.0" → 32.0"</strong></div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-white border border-purple-200 text-[11px] text-purple-900 font-medium">
              <strong>Condición para Fase 3:</strong> Llegar a 71.0 kg, cintura 32" y grasa corporal &lt; 15%.
            </div>
          </div>

          {/* FASE 3 */}
          <div className={`p-4 rounded-2xl border transition-all ${
            currentPhase === 3 
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-500/20 shadow-xs' 
              : 'bg-white border-slate-200 opacity-80'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                Fase 3: Mantenimiento Magro
              </span>
              <Badge variant={currentPhase === 3 ? 'amber' : 'slate'} size="sm">
                {currentPhase === 3 ? 'En Curso' : 'Meta Final'}
              </Badge>
            </div>

            <p className="text-xs text-slate-700 font-medium mb-3">
              Calorías normocalóricas de mantenimiento para rendimiento atlético y salud metabólica óptima.
            </p>

            <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-2 font-mono">
              <div>🎯 <strong>2,450 kcal</strong> (170g P • 290g C • 65g F)</div>
              <div>📉 Peso Estable: <strong>71.0kg ± 1kg</strong></div>
              <div>📏 Cintura Estable: <strong>31.5" - 32.0"</strong></div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-white border border-amber-200 text-[11px] text-amber-900 font-medium">
              <strong>Estado:</strong> 10-12% grasa corporal, masa magra consolidada y plenitud muscular.
            </div>
          </div>
        </div>
      </div>

      {/* Formulario para Registrar Nuevas Medidas Semanales */}
      <Card className="border-slate-200 bg-white shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Scale size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Actualizar Medidas Antropométricas</h3>
            <p className="text-xs text-slate-500">Registra tu peso y cintura semanal para calcular automáticamente el avance hacia la siguiente fase</p>
          </div>
        </div>

        <form onSubmit={handleSaveMeasurements} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Peso Actual (kg)</label>
              <input
                type="number"
                step="0.05"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Cintura Ombligo (pulgadas)</label>
              <input
                type="number"
                step="0.1"
                value={newWaist}
                onChange={(e) => setNewWaist(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">% Grasa Corporal</label>
              <input
                type="number"
                step="0.1"
                value={newBodyFat}
                onChange={(e) => setNewBodyFat(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Nivel Grasa Visceral</label>
              <input
                type="number"
                step="0.5"
                value={newVisceral}
                onChange={(e) => setNewVisceral(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Ganas <strong>+40 XP</strong> al registrar tu control semanal
            </span>

            <div className="flex items-center gap-2">
              {isSaved && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <Check size={14} /> ¡Medidas Actualizadas!
                </span>
              )}
              <Button variant="primary" size="sm" type="submit" icon={<Save size={14} />}>
                Guardar Progreso
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};
