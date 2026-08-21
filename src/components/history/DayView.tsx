import React, { useState } from 'react';
import { PlusCircle, Sparkles, Utensils, CalendarDays, Clipboard, FileCode, ChefHat, Eye } from 'lucide-react';
import { Meal, NutritionGoals } from '../../types/nutrition.types';
import { DateNavigator } from './DateNavigator';
import { CalorieMeter } from '../nutrition/CalorieMeter';
import { MacroDonutChart } from '../nutrition/MacroDonutChart';
import { NutrientScoreBadge } from '../nutrition/NutrientScoreBadge';
import { NutrientGapAlert } from '../nutrition/NutrientGapAlert';
import { MicronutrientGrid } from '../nutrition/MicronutrientGrid';
import { MealCard } from './MealCard';
import { DailyReflectionCard } from './DailyReflectionCard';
import { GamificationBar } from '../gamification/GamificationBar';
import { AiMealSuggesterModal } from '../nutrition/AiMealSuggesterModal';
import { VisualPortionGuideModal } from '../nutrition/VisualPortionGuideModal';
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
  const [isSuggesterOpen, setIsSuggesterOpen] = useState(false);
  const [isPortionGuideOpen, setIsPortionGuideOpen] = useState(false);

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

      {/* Botones de Acción Rápida Inteligente: Sugerir con IA & Guía de Raciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => setIsSuggesterOpen(true)}
          className="p-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white text-left shadow-md shadow-purple-700/10 hover:brightness-105 active:scale-98 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <ChefHat size={18} />
            </div>
            <div>
              <span className="text-xs font-black block">¿Qué debería comer ahora?</span>
              <span className="text-[10px] text-purple-100 block">IA calcula lo que te falta en el día y sugiere una comida</span>
            </div>
          </div>
          <Sparkles size={16} className="text-amber-300 animate-pulse shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => setIsPortionGuideOpen(true)}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-left shadow-xs transition-all flex items-center justify-between text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Eye size={18} />
            </div>
            <div>
              <span className="text-xs font-bold block">Guía Visual de Raciones</span>
              <span className="text-[10px] text-slate-500 block">Distribución de platos para Desayuno, Comida y Cena</span>
            </div>
          </div>
          <Utensils size={15} className="text-slate-400 shrink-0" />
        </button>
      </div>

      {/* Grid Superior: CalorieMeter & Puntuación & Macros */}
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

      {/* Sección Clave: Diagnóstico "Qué me falta hoy" */}
      <NutrientGapAlert gaps={nutrientGaps} />

      {/* Lista de Comidas del Día */}
      <div className="space-y-3">
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
              + Ingerir con IA / JSON
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
                Pega tu formato JSON o usa el asistente IA para analizar tus comidas y ganar puntos de experiencia.
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

      {/* Diario de Hábitos, Motivos & Biofeedback del Día */}
      <DailyReflectionCard
        date={selectedDate}
        isGoalsMet={isGoalsMet}
      />

      {/* Desglose Completo de Micronutrientes */}
      <MicronutrientGrid
        nutrients={dailySummary.totalNutrients}
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
