import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlusCircle, BookmarkCheck, Sparkles, Code2, Save, FileCode, BookOpen, Bot } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TabGroup } from '../common/TabGroup';
import { JsonEditor } from './JsonEditor';
import { FormatTemplates } from './FormatTemplates';
import { PreviewMealCard } from './PreviewMealCard';
import { AiFoodInput } from './AiFoodInput';
import { parseMealJson } from '../../services/jsonParser';
import { Meal } from '../../types/nutrition.types';
import { dbService } from '../../db/dbService';
import { SAMPLE_JSON_TEMPLATES } from '../../db/seedData';

import { awardXp, checkAndUpdateStreak, unlockAchievement } from '../../services/gamificationService';

interface JsonInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMealAdded?: (meal: Meal) => void;
  onOpenSchemaGuide?: () => void;
  onOpenSettings?: () => void;
  initialJson?: string;
}

export const JsonInputModal: React.FC<JsonInputModalProps> = ({
  isOpen,
  onClose,
  onMealAdded,
  onOpenSchemaGuide,
  onOpenSettings,
  initialJson
}) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'editor' | 'templates'>('ai');
  const [jsonText, setJsonText] = useState(initialJson || '');
  const [parsedMeal, setParsedMeal] = useState<Meal | null>(null);
  const [parseError, setParseError] = useState<string | undefined>(undefined);
  const [autoAddRecipe, setAutoAddRecipe] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialJson !== undefined && initialJson.trim()) {
      setJsonText(initialJson);
      setActiveTab('editor');
    } else if (isOpen && !jsonText) {
      setActiveTab('ai');
    }
  }, [initialJson, isOpen]);

  // Parsear en vivo cada vez que cambia el texto del editor
  useEffect(() => {
    if (!jsonText.trim()) {
      if (activeTab === 'editor') {
        setParsedMeal(null);
        setParseError(undefined);
      }
      return;
    }

    const result = parseMealJson(jsonText);
    if (result.success && result.meal) {
      setParsedMeal(result.meal);
      setParseError(undefined);
    } else {
      if (activeTab === 'editor') {
        setParsedMeal(null);
        setParseError(result.error);
      }
    }
  }, [jsonText, activeTab]);

  const handleAiFoodAnalyzed = (meal: Meal, rawJson: string) => {
    setParsedMeal(meal);
    setJsonText(rawJson);
    setParseError(undefined);
  };

  const handleSelectTemplate = (templateJson: string) => {
    setJsonText(templateJson);
    setActiveTab('editor');
  };

  const handleUpdateMealMeta = (updates: Partial<Meal>) => {
    if (parsedMeal) {
      setParsedMeal({ ...parsedMeal, ...updates });
    }
  };

  const handleSave = async () => {
    if (!parsedMeal) return;

    setIsSaving(true);
    try {
      await dbService.addMeal(parsedMeal, autoAddRecipe);

      // Recompensas de Gamificación
      awardXp(25, 'Comida Registrada');
      unlockAchievement('first_meal');
      checkAndUpdateStreak(parsedMeal.date);

      if (activeTab === 'ai') {
        unlockAchievement('ai_vision');
      }

      if (parsedMeal.biofeedback && (parsedMeal.biofeedback.satiety || parsedMeal.biofeedback.digestion)) {
        awardXp(15, 'Biofeedback Registrado');
        unlockAchievement('biofeedback_master');
      }

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#059669', '#0284C7', '#D97706']
      });

      if (onMealAdded) {
        onMealAdded(parsedMeal);
      }

      onClose();
    } catch (err) {
      console.error('Error guardando comida:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center justify-between w-full pr-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
              <PlusCircle size={18} />
            </div>
            <span className="truncate text-xs sm:text-sm font-bold">
              <span className="sm:hidden">Ingerir Comida</span>
              <span className="hidden sm:inline">Ingerir Comida con IA o JSON</span>
            </span>
          </div>

          {onOpenSchemaGuide && (
            <button
              onClick={onOpenSchemaGuide}
              className="text-[11px] sm:text-xs text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 transition-colors shrink-0 ml-2"
            >
              <FileCode size={12} /> <span className="hidden xs:inline sm:inline">Ver</span> Plantilla
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-5">
        {/* Pestañas de entrada */}
        <TabGroup
          tabs={[
            { id: 'ai', label: 'Asistente IA', icon: <Bot size={15} /> },
            { id: 'editor', label: 'Editor JSON', icon: <Code2 size={15} /> },
            { id: 'templates', label: 'Plantillas', icon: <Sparkles size={15} /> }
          ]}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as any)}
        />

        {activeTab === 'ai' && (
          <div className="space-y-4">
            <AiFoodInput
              onFoodAnalyzed={handleAiFoodAnalyzed}
              onOpenSettings={onOpenSettings}
            />

            {/* Vista Previa generada por IA */}
            {parsedMeal && (
              <div className="pt-2 border-t border-slate-200 animate-fadeIn">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Resultado Generado por la IA:</span>
                  <button
                    onClick={() => setActiveTab('editor')}
                    className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                  >
                    <Code2 size={12} /> Ver / Modificar JSON
                  </button>
                </div>
                <PreviewMealCard
                  meal={parsedMeal}
                  onUpdateMealMeta={handleUpdateMealMeta}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <FormatTemplates onSelectTemplate={handleSelectTemplate} />
        )}

        {activeTab === 'editor' && (
          <div className="space-y-4">
            <JsonEditor
              value={jsonText}
              onChange={setJsonText}
              error={parseError}
              isValid={!!parsedMeal}
            />

            {/* Vista Previa en tiempo real */}
            {parsedMeal && (
              <PreviewMealCard
                meal={parsedMeal}
                onUpdateMealMeta={handleUpdateMealMeta}
              />
            )}
          </div>
        )}

        {/* Opciones adicionales: Auto-extracción al banco de recetario */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer self-start sm:self-auto select-none">
            <input
              type="checkbox"
              checked={autoAddRecipe}
              onChange={(e) => setAutoAddRecipe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500 rounded-md"
            />
            <BookOpen size={16} className="text-emerald-700" />
            <span>Auto-guardar y enriquecer en el <strong>Banco de Recetario</strong></span>
          </label>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="ghost" onClick={onClose} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!parsedMeal || isSaving}
              icon={<Save size={16} />}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? 'Guardando...' : 'Registrar Comida'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
