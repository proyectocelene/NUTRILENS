import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Navigation, NavView } from './components/layout/Navigation';
import { PwaInstallPrompt } from './components/layout/PwaInstallPrompt';
import { DayView } from './components/history/DayView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { RecipeBook } from './components/history/RecipeBook';
import { SettingsView } from './components/settings/SettingsView';
import { RecompositionProgressView } from './components/recomposition/RecompositionProgressView';
import { WeeklyFoodPlannerView } from './components/groceries/WeeklyFoodPlannerView';
import { CanonicalFoodsView } from './components/canonical/CanonicalFoodsView';
import { JsonInputModal } from './components/input/JsonInputModal';
import { SchemaGuideModal } from './components/input/SchemaGuideModal';
import { useAllMeals } from './hooks/useMeals';
import { useNutritionGoals } from './hooks/useNutritionGoals';
import { initializeDatabase } from './db';
import { dbService } from './db/dbService';
import { startRealtimeFirestoreSync, stopRealtimeFirestoreSync, isFirebaseConfigured } from './services/firebaseService';
import { DbRecipe } from './types/db.types';
import { Meal } from './types/nutrition.types';

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isSchemaGuideOpen, setIsSchemaGuideOpen] = useState(false);
  const [initialModalJson, setInitialModalJson] = useState<string | undefined>(undefined);

  const { meals: allMeals } = useAllMeals();
  const { goals, updateGoals } = useNutritionGoals();

  useEffect(() => {
    initializeDatabase().catch(console.error);

    if (isFirebaseConfigured()) {
      startRealtimeFirestoreSync().catch(console.error);
    }

    return () => {
      stopRealtimeFirestoreSync();
    };
  }, []);

  const handleOpenJsonModalWithText = (initialText?: string) => {
    setInitialModalJson(initialText);
    setIsJsonModalOpen(true);
  };

  const handleFastPaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        handleOpenJsonModalWithText(text);
      } else {
        handleOpenJsonModalWithText();
      }
    } catch (err) {
      handleOpenJsonModalWithText();
    }
  };

  const handleLogRecipeAsMeal = async (recipe: DbRecipe) => {
    const today = selectedDate;
    const nowTime = new Date().toTimeString().slice(0, 5);

    const newMeal: Meal = {
      name: recipe.name,
      mealType: (recipe.category as any) || 'lunch',
      date: today,
      time: nowTime,
      foods: recipe.foods,
      totalCalories: recipe.totalCalories,
      totalProtein: recipe.totalProtein,
      totalCarbs: recipe.totalCarbs,
      totalFat: recipe.totalFat,
      totalFiber: recipe.totalFiber,
      totalNutrients: recipe.totalNutrients,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await dbService.addMeal(newMeal, false);
    setCurrentView('day');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Header Superior con tema claro y acciones rápidas */}
      <Header
        onOpenJsonModal={() => handleOpenJsonModalWithText()}
        onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
        onFastPaste={handleFastPaste}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Contenedor Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-8 py-4 sm:py-6 pb-24 md:pb-12 min-w-0">
        {/* Banner de Instalación PWA */}
        <PwaInstallPrompt />

        {/* Barra de Navegación de Vistas */}
        <Navigation
          currentView={currentView}
          onViewChange={setCurrentView}
        />

        {/* Vista Activa */}
        {currentView === 'day' && (
          <DayView
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            allMeals={allMeals}
            goals={goals}
            onOpenJsonModal={() => handleOpenJsonModalWithText()}
            onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
            onFastPaste={handleFastPaste}
          />
        )}

        {currentView === 'recomposition' && (
          <RecompositionProgressView
            goals={goals}
            onSaveGoals={updateGoals}
          />
        )}

        {currentView === 'canonical' && (
          <CanonicalFoodsView />
        )}

        {currentView === 'groceries' && (
          <WeeklyFoodPlannerView
            allMeals={allMeals}
            goals={goals}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            allMeals={allMeals}
            goals={goals}
          />
        )}

        {currentView === 'recipes' && (
          <RecipeBook
            onLogRecipeAsMeal={handleLogRecipeAsMeal}
            onOpenJsonModal={() => handleOpenJsonModalWithText()}
            onOpenSchemaGuide={() => setIsSchemaGuideOpen(true)}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            goals={goals}
            onSaveGoals={updateGoals}
          />
        )}
      </main>

      {/* Modal Ingesta JSON / IA Global */}
      <JsonInputModal
        isOpen={isJsonModalOpen}
        onClose={() => {
          setIsJsonModalOpen(false);
          setInitialModalJson(undefined);
        }}
        onOpenSchemaGuide={() => {
          setIsJsonModalOpen(false);
          setIsSchemaGuideOpen(true);
        }}
        onOpenSettings={() => {
          setIsJsonModalOpen(false);
          setCurrentView('settings');
        }}
        initialJson={initialModalJson}
      />

      {/* Modal de Guía y Copia de Formato JSON */}
      <SchemaGuideModal
        isOpen={isSchemaGuideOpen}
        onClose={() => setIsSchemaGuideOpen(false)}
        onSelectJsonToEdit={(jsonStr) => handleOpenJsonModalWithText(jsonStr)}
      />
    </div>
  );
}

export default App;
