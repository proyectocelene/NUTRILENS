import React, { useState, useEffect } from 'react';
import { Target, Save, Check, RefreshCw, FileCode, Sliders } from 'lucide-react';
import { NutritionGoals } from '../../types/nutrition.types';
import { DEFAULT_NUTRITION_GOALS } from '../../db/seedData';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { GoalsJsonEditorCard } from './GoalsJsonEditorCard';

interface GoalsConfigProps {
  goals: NutritionGoals;
  onSaveGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
}

export const GoalsConfig: React.FC<GoalsConfigProps> = ({ goals, onSaveGoals }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');
  const [formData, setFormData] = useState<NutritionGoals>(goals);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(goals);
  }, [goals]);

  const handleChangeMacro = (field: keyof NutritionGoals, val: string) => {
    const num = parseFloat(val) || 0;
    setFormData(prev => ({ ...prev, [field]: num }));
  };

  const handleChangeMicro = (field: keyof NutritionGoals['microGoals'], val: string) => {
    const num = parseFloat(val) || 0;
    setFormData(prev => ({
      ...prev,
      microGoals: {
        ...prev.microGoals,
        [field]: num
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveGoals(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setFormData(DEFAULT_NUTRITION_GOALS);
  };

  return (
    <div className="space-y-4">
      {/* Selector de Modo: Visual vs JSON / IA */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'visual'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sliders size={14} /> Modo Visual (Campos)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'json'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCode size={14} /> Modo JSON / IA (Copiar / Pegar)
          </button>
        </div>
      </div>

      {activeTab === 'json' ? (
        <GoalsJsonEditorCard goals={goals} onSaveGoals={onSaveGoals} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border-slate-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Target size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Metas Diarias Principales</h3>
                  <p className="text-xs text-slate-500">Personaliza tus requerimientos de energía y macronutrientes</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors font-medium"
              >
                <RefreshCw size={13} /> Restaurar valores base
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Calorías (kcal)</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleChangeMacro('calories', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Proteína (g)</label>
                <input
                  type="number"
                  value={formData.protein}
                  onChange={(e) => handleChangeMacro('protein', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-emerald-700 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Carbos (g)</label>
                <input
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => handleChangeMacro('carbs', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-sky-700 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Grasas (g)</label>
                <input
                  type="number"
                  value={formData.fat}
                  onChange={(e) => handleChangeMacro('fat', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-amber-700 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Fibra (g)</label>
                <input
                  type="number"
                  value={formData.fiber}
                  onChange={(e) => handleChangeMacro('fiber', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-purple-700 font-mono font-bold focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </Card>

          {/* Metas de Micronutrientes */}
          <Card className="border-slate-200 bg-white">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900">Objetivos de Micronutrientes (RDA / Atletas)</h3>
              <p className="text-xs text-slate-500">Valores diarios de referencia para el detector de carencias</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Hierro (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.iron_mg}
                  onChange={(e) => handleChangeMicro('iron_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Magnesio (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.magnesium_mg}
                  onChange={(e) => handleChangeMicro('magnesium_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Potasio (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.potassium_mg}
                  onChange={(e) => handleChangeMicro('potassium_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Calcio (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.calcium_mg}
                  onChange={(e) => handleChangeMicro('calcium_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Vitamina C (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.vitamin_c_mg}
                  onChange={(e) => handleChangeMicro('vitamin_c_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Vitamina D (IU)</label>
                <input
                  type="number"
                  value={formData.microGoals.vitamin_d_iu}
                  onChange={(e) => handleChangeMicro('vitamin_d_iu', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Vitamina B12 (mcg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.microGoals.vitamin_b12_mcg}
                  onChange={(e) => handleChangeMicro('vitamin_b12_mcg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Zinc (mg)</label>
                <input
                  type="number"
                  value={formData.microGoals.zinc_mg}
                  onChange={(e) => handleChangeMicro('zinc_mg', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </Card>

          <div className="flex items-center justify-end gap-3">
            {savedSuccess && (
              <span className="text-xs text-emerald-800 font-bold flex items-center gap-1">
                <Check size={16} /> ¡Metas actualizadas en tu dispositivo!
              </span>
            )}
            <Button variant="primary" type="submit" disabled={isSaving} icon={<Save size={15} />}>
              {isSaving ? 'Guardando...' : 'Guardar Metas'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
