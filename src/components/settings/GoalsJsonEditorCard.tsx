import React, { useState } from 'react';
import { FileCode, Copy, Check, Sparkles, AlertCircle, Save, Bot, RefreshCw } from 'lucide-react';
import { NutritionGoals } from '../../types/nutrition.types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface GoalsJsonEditorCardProps {
  goals: NutritionGoals;
  onSaveGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
}

export const GoalsJsonEditorCard: React.FC<GoalsJsonEditorCardProps> = ({ goals, onSaveGoals }) => {
  const [jsonText, setJsonText] = useState<string>(() => JSON.stringify(goals, null, 2));
  const [copiedCurrent, setCopiedCurrent] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(JSON.stringify(goals, null, 2));
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  const handleCopyPrompt = () => {
    const prompt = `Actúa como mi nutricionista deportivo y diseñador de planes de recomposición corporal.
Calcula mis metas calóricas, de macronutrientes, hidratación y micronutrientes basadas en mis datos actuales y devuélveme ÚNICAMENTE un bloque JSON válido con este formato exacto:

{
  "calories": 2200,
  "protein": 175,
  "carbs": 245,
  "fat": 58,
  "fiber": 35,
  "waterLiters": 3.5,
  "weightKg": 78.35,
  "activityLevel": "active",
  "dietaryGoal": "recomposition",
  "profile": {
    "age": 26,
    "heightCm": 174,
    "currentWeightKg": 78.35,
    "targetWeightKg": 71.0,
    "bmrKcal": 1702,
    "bodyFatPct": 24.4,
    "visceralFatLevel": 11.5,
    "currentWaistInches": 38.5,
    "targetWaistInches": 32.0,
    "targetWaterLiters": 3.5,
    "creatineDailyGrams": 5
  },
  "microGoals": {
    "vitamin_a_mcg": 900,
    "vitamin_c_mg": 300,
    "vitamin_d_iu": 3000,
    "vitamin_e_mg": 15,
    "vitamin_b6_mg": 2.5,
    "vitamin_b12_mcg": 6.0,
    "folate_mcg": 400,
    "calcium_mg": 1100,
    "iron_mg": 15,
    "magnesium_mg": 450,
    "potassium_mg": 4000,
    "sodium_mg": 3500,
    "zinc_mg": 20
  }
}`;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage(`Error de sintaxis JSON: ${e.message}`);
    }
  };

  const handleApplyJson = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsApplying(true);

    try {
      let clean = jsonText.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

      const parsed = JSON.parse(clean);

      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('El JSON debe ser un objeto con campos de metas.');
      }

      // Validar y construir el objeto de metas
      const updated: Partial<NutritionGoals> = {
        calories: typeof parsed.calories === 'number' ? parsed.calories : goals.calories,
        protein: typeof parsed.protein === 'number' ? parsed.protein : goals.protein,
        carbs: typeof parsed.carbs === 'number' ? parsed.carbs : goals.carbs,
        fat: typeof parsed.fat === 'number' ? parsed.fat : goals.fat,
        fiber: typeof parsed.fiber === 'number' ? parsed.fiber : goals.fiber,
        waterLiters: typeof parsed.waterLiters === 'number' ? parsed.waterLiters : goals.waterLiters,
        weightKg: typeof parsed.weightKg === 'number' ? parsed.weightKg : goals.weightKg,
        activityLevel: parsed.activityLevel || goals.activityLevel,
        dietaryGoal: parsed.dietaryGoal || goals.dietaryGoal,
        profile: {
          ...goals.profile,
          ...(parsed.profile || {})
        },
        microGoals: {
          ...goals.microGoals,
          ...(parsed.microGoals || {})
        }
      };

      await onSaveGoals(updated);
      setSuccessMessage('¡Metas y objetivos actualizados exitosamente desde el JSON!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error analizando o aplicando el JSON de metas.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
            <FileCode size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Editor & Importador JSON de Metas</h3>
              <Badge variant="purple" size="sm">Copia / Pega JSON</Badge>
            </div>
            <p className="text-xs text-slate-500">Copia tus metas actuales o pega un JSON personalizado para actualizar todo en 1 clic</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleCopyCurrent}
            icon={copiedCurrent ? <Check size={13} /> : <Copy size={13} />}
          >
            {copiedCurrent ? '¡Copiado!' : 'Copiar Mis Metas Actuales'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleCopyPrompt}
            icon={copiedPrompt ? <Check size={13} /> : <Bot size={13} />}
          >
            {copiedPrompt ? '¡Prompt Copiado!' : 'Copiar Prompt para IA'}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar leading-relaxed"
            placeholder="Pega aquí el JSON con tus metas calóricas, macros y micronutrientes..."
          />
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-bold">
            <Check size={15} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={handleFormat}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <RefreshCw size={13} /> Formatear / Embellecer JSON
          </button>

          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleApplyJson}
            disabled={isApplying}
            icon={<Save size={14} />}
            className="shadow-sm"
          >
            {isApplying ? 'Aplicando...' : 'Aplicar Metas desde este JSON'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
