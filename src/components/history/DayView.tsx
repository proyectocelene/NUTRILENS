import React, { useState } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  Utensils, 
  CalendarDays, 
  Clipboard, 
  FileCode, 
  ChefHat, 
  Eye,
  BarChart2,
  Heart,
  Flame,
  Zap,
  Coffee
} from 'lucide-react';
import { Meal, NutritionGoals } from '../../types/nutrition.types';
import { DateNavigator } from './DateNavigator';
import { CalorieMeter } from '../nutrition/CalorieMeter';
import { MacroDonutChart } from '../nutrition/MacroDonutChart';
import { NutrientScoreBadge } from '../nutrition/NutrientScoreBadge';
import { NutrientGapAlert } from '../nutrition/NutrientGapAlert';
import { MicronutrientGrid } from '../nutrition/MicronutrientGrid';
import { SupplementTrackerCard } from '../nutrition/SupplementTrackerCard';
import { MealCard } from './MealCard';
import { DailyReflectionCard } from './DailyReflectionCard';
import { GamificationBar } from '../gamification/GamificationBar';
import { AiMealSuggesterModal } from '../nutrition/AiMealSuggesterModal';
import { VisualPortionGuideModal } from '../nutrition/VisualPortionGuideModal';
import { ChefPromptModal } from '../nutrition/ChefPromptModal';
import { Button } from '../common/Button';
import { useDailyStats } from '../../hooks/useDailyStats';
import { dbService } from '../../db/dbService';

interface DayViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  allMeals: Meal[];
  goals: NutritionGoals;
  onOpenJsonModal: () => void;
  onOpenSchemaGuide: () => void;
  onFastPaste: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  selectedDate,
  onDateChange,
  allMeals,
  goals,
  onOpenJsonModal,
  onOpenSchemaGuide,
  onFastPaste
}) => {
  const { dailySummary, nutrientGaps } = useDailyStats(selectedDate, allMeals, goals);
  const [activeDaySection, setActiveDaySection] = useState<'meals' | 'supplements' | 'nutrition' | 'reflection'>('meals');
  const [isSuggesterOpen, setIsSuggesterOpen] = useState(false);
  const [isChefPromptOpen, setIsChefPromptOpen] = useState(false);
  const [isPortionGuideOpen, setIsPortionGuideOpen] = useState(false);

  const maxCaffeine = goals.profile?.caffeineDailyMaxMg || 400;
  const cutoffHour = goals.profile?.caffeineCutoffHour || 15;
  const mealsCaffeine = Math.round(dailySummary.totalNutrients.caffeine_mg || 0);
  const mealsCreatine = Math.round((dailySummary.totalNutrients.creatine_g || 0) * 10) / 10;

  const hasLateCaffeine = dailySummary.meals.some(meal => {
    const c = meal.totalNutrients?.caffeine_mg || 0;
    if (c <= 0 || !meal.time) return false;
    const hour = parseInt(meal.time.split(':')[0], 10);
    return !isNaN(hour) && hour >= cutoffHour;
  });

  const handleSeedDemo = async () => {
    await dbService.seedDemoMeals();
  };

  const isGoalsMet = dailySummary.totalProtein >= goals.protein && Math.abs(dailySummary.totalCalories - goals.calories) <= 200;

  return (
    <div className="space-y-6">
      {/* Barra de Nivel, XP, Rachas y Logros */}
      <GamificationBar />

      {/* Navegador de Fecha */}
      <DateNavigator
        selectedDate={selectedDate}
        onDateChange={onDateChange}
      />

      {/* Selector de Pestañas del Día: Comidas vs Suplementos vs Nutrición vs Hábitos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveDaySection('meals')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeDaySection === 'meals'
              ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80 ring-2 ring-emerald-500/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils size={15} className={activeDaySection === 'meals' ? 'text-emerald-700' : 'text-slate-400'} />
          <span>Comidas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-mono font-black">
            {dailySummary.mealsCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDaySection('supplements')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeDaySection === 'supplements'
              ? 'bg-white text-purple-950 shadow-xs border border-purple-200/80 ring-2 ring-purple-500/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Zap size={15} className={activeDaySection === 'supplements' ? 'text-purple-700' : 'text-slate-400'} />
          <span>Suplementos</span>
          {mealsCaffeine > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-mono font-bold">
              {mealsCaffeine}mg
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveDaySection('nutrition')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeDaySection === 'nutrition'
              ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80 ring-2 ring-emerald-500/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BarChart2 size={15} className={activeDaySection === 'nutrition' ? 'text-emerald-700' : 'text-slate-400'} />
          <span>Nutrición</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDaySection('reflection')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeDaySection === 'reflection'
              ? 'bg-white text-emerald-950 shadow-xs border border-slate-200/80 ring-2 ring-emerald-500/10'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Heart size={15} className={activeDaySection === 'reflection' ? 'text-emerald-700' : 'text-slate-400'} />
          <span>Hábitos</span>
        </button>
      </div>

      {/* SECCIÓN 1: COMIDAS DEL DÍA (VISTA ÁGIL Y SIN SCROLL INFINITO) */}
      {activeDaySection === 'meals' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Resumen Compacto Superior de Calorías y Macros */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-amber-50 text-amber-800 border border-amber-200">
                  <Flame size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-slate-900 font-mono">
                      {dailySummary.totalCalories}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">/ {goals.calories} kcal</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 block">
                    {goals.calories - dailySummary.totalCalories > 0
                      ? `Faltan ~${goals.calories - dailySummary.totalCalories} kcal para tu meta`
                      : `¡Meta calórica del día cubierta!`}
                  </span>
                </div>
              </div>

              {/* Píldoras de Macros P/C/G */}
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold flex-wrap">
                <div className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="text-[10px] text-emerald-600 block font-sans">Proteína</span>
                  <span>{dailySummary.totalProtein}/{goals.protein}g</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-800 border border-sky-200">
                  <span className="text-[10px] text-sky-600 block font-sans">Carbos</span>
                  <span>{dailySummary.totalCarbs}/{goals.carbs}g</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="text-[10px] text-amber-600 block font-sans">Grasa</span>
                  <span>{dailySummary.totalFat}/{goals.fat}g</span>
                </div>
                <div className="px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
                  <span className="text-[10px] text-teal-600 block font-sans">Fibra</span>
                  <span>{dailySummary.totalFiber}/{goals.fiber || 35}g</span>
                </div>
              </div>
            </div>

            {/* Barra de Progreso Calórico */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  dailySummary.totalCalories > goals.calories + 200
                    ? 'bg-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                }`}
                style={{
                  width: `${Math.min(100, Math.round((dailySummary.totalCalories / (goals.calories || 2000)) * 100))}%`
                }}
              />
            </div>

            {/* Tira Rápida de Suplementación: Cafeína y Creatina */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveDaySection('supplements')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                    mealsCaffeine >= maxCaffeine
                      ? 'bg-rose-50 text-rose-800 border-rose-300'
                      : mealsCaffeine >= maxCaffeine * 0.75
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Ver desglose de cafeína y límites de seguridad"
                >
                  <Coffee size={13} className={mealsCaffeine >= maxCaffeine ? 'text-rose-600' : 'text-amber-700'} />
                  <span>Cafeína: {mealsCaffeine} / {maxCaffeine} mg</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDaySection('supplements')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                    mealsCreatine >= 5
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200'
                  }`}
                  title="Ver meta de creatina (5g/día)"
                >
                  <Zap size={13} className={mealsCreatine >= 5 ? 'text-emerald-600' : 'text-purple-600'} />
                  <span>Creatina: {mealsCreatine} / 5g {mealsCreatine >= 5 ? '✓' : ''}</span>
                </button>

                {hasLateCaffeine && (
                  <button
                    type="button"
                    onClick={() => setActiveDaySection('supplements')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold animate-pulse"
                    title="Ingesta de cafeína registrada después de las 15:00 hrs"
                  >
                    <span>⚠️ Alerta Sueño (&gt;{cutoffHour}h)</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveDaySection('supplements')}
                className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Gestionar Dosis →</span>
              </button>
            </div>
          </div>

          {/* Botones de Acción Rápida Inteligente */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* 1. Generador de Prompt de Chef (con Bitácora Actual) */}
            <button
              type="button"
              onClick={() => setIsChefPromptOpen(true)}
              className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white text-left shadow-md shadow-amber-700/10 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 shrink-0">
                  <ChefHat size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black block truncate">¿Qué comer ahora?</span>
                  <span className="text-[10px] text-amber-100 block truncate">Copiar Prompt IA con mi bitácora</span>
                </div>
              </div>
              <Sparkles size={16} className="text-amber-200 animate-pulse shrink-0 ml-1" />
            </button>

            {/* 2. Sugerencia IA Integrada */}
            <button
              type="button"
              onClick={() => setIsSuggesterOpen(true)}
              className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white text-left shadow-md shadow-purple-700/10 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/20 shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black block truncate">Sugerencia IA Directa</span>
                  <span className="text-[10px] text-purple-100 block truncate">Diseñar e ingerir receta</span>
                </div>
              </div>
            </button>

            {/* 3. Guía Visual de Raciones */}
            <button
              type="button"
              onClick={() => setIsPortionGuideOpen(true)}
              className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-left shadow-xs transition-all flex items-center justify-between text-slate-800"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <Eye size={18} />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold block truncate">Guía de Raciones</span>
                  <span className="text-[10px] text-slate-500 block truncate">Distribución visual de platos</span>
                </div>
              </div>
              <Utensils size={15} className="text-slate-400 shrink-0 ml-1" />
            </button>
          </div>

          {/* Cabecera y Lista de Comidas Registradas */}
          <div className="space-y-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Utensils size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Comidas Registradas</h3>
                  <p className="text-xs text-slate-500">
                    {dailySummary.mealsCount} comida{dailySummary.mealsCount !== 1 ? 's' : ''} en esta fecha
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenSchemaGuide}
                  icon={<FileCode size={14} className="text-emerald-700" />}
                  className="text-xs"
                >
                  <span className="hidden sm:inline">Copiar</span> Formato JSON
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onFastPaste}
                  icon={<Clipboard size={14} />}
                  className="text-xs"
                >
                  Pegar JSON
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onOpenJsonModal}
                  icon={<Sparkles size={15} />}
                  className="col-span-2 sm:col-span-1 text-xs"
                >
                  + Ingerir con IA
                </Button>
              </div>
            </div>

            {dailySummary.meals.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-dashed border-slate-300 text-center space-y-3 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">No hay comidas registradas para este día</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Pega tu formato JSON o usa el asistente IA para registrar tus comidas con un solo clic.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={onOpenSchemaGuide} icon={<FileCode size={14} />}>
                    Ver Estructura JSON
                  </Button>
                  <Button variant="secondary" size="sm" onClick={onFastPaste} icon={<Clipboard size={14} />}>
                    Pegar desde Portapapeles
                  </Button>
                  <Button variant="emerald" size="sm" onClick={onOpenJsonModal} icon={<PlusCircle size={14} />}>
                    Ingerir Comida
                  </Button>
                  {allMeals.length === 0 && (
                    <Button variant="ghost" size="sm" onClick={handleSeedDemo} icon={<Sparkles size={14} />}>
                      Cargar Demo
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {dailySummary.meals.map((meal) => (
                  <MealCard key={meal.id} meal={meal} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECCIÓN 2: SUPLEMENTACIÓN & CRONOBIOLOGÍA */}
      {activeDaySection === 'supplements' && (
        <div className="space-y-4 animate-fadeIn">
          <SupplementTrackerCard
            date={selectedDate}
            meals={dailySummary.meals}
            dailyNutrients={dailySummary.totalNutrients}
            goals={goals}
          />
        </div>
      )}

      {/* SECCIÓN 3: DESGLOSE NUTRICIONAL & MICRONUTRIENTES */}
      {activeDaySection === 'nutrition' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Grid: CalorieMeter & Puntuación & Macros */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            <div className="md:col-span-6 flex flex-col gap-5">
              <CalorieMeter
                current={dailySummary.totalCalories}
                target={goals.calories}
                proteinG={dailySummary.totalProtein}
                carbsG={dailySummary.totalCarbs}
                fatG={dailySummary.totalFat}
              />
              <NutrientScoreBadge score={dailySummary.healthScore} />
            </div>

            <div className="md:col-span-6">
              <MacroDonutChart
                protein={dailySummary.totalProtein}
                carbs={dailySummary.totalCarbs}
                fat={dailySummary.totalFat}
                proteinGoal={goals.protein}
                carbsGoal={goals.carbs}
                fatGoal={goals.fat}
                title="Distribución del Día"
              />
            </div>
          </div>

          {/* Diagnóstico "Qué me falta hoy" */}
          <NutrientGapAlert gaps={nutrientGaps} />

          {/* Desglose Completo de Micronutrientes (25 tarjetas organizadas) */}
          <MicronutrientGrid
            nutrients={dailySummary.totalNutrients}
            goals={goals}
          />
        </div>
      )}

      {/* SECCIÓN 4: HÁBITOS, BIOFEEDBACK Y NOTAS */}
      {activeDaySection === 'reflection' && (
        <div className="space-y-4 animate-fadeIn">
          <SupplementTrackerCard
            date={selectedDate}
            meals={dailySummary.meals}
            dailyNutrients={dailySummary.totalNutrients}
            goals={goals}
          />
          <DailyReflectionCard
            date={selectedDate}
            isGoalsMet={isGoalsMet}
          />
        </div>
      )}

      {/* Modal Generador del Prompt de Chef con Bitácora de Hoy */}
      <ChefPromptModal
        isOpen={isChefPromptOpen}
        onClose={() => setIsChefPromptOpen(false)}
        dailySummary={dailySummary}
        goals={goals}
      />

      {/* Modal Sugeridor IA con lo que falta en el día */}
      <AiMealSuggesterModal
        isOpen={isSuggesterOpen}
        onClose={() => setIsSuggesterOpen(false)}
        dailySummary={dailySummary}
        goals={goals}
      />

      {/* Modal Guía Visual de Raciones */}
      <VisualPortionGuideModal
        isOpen={isPortionGuideOpen}
        onClose={() => setIsPortionGuideOpen(false)}
      />
    </div>
  );
};
