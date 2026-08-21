import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Sliders, 
  Save, 
  Copy, 
  Check, 
  Bot, 
  AlertCircle, 
  Wand2 
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CanonicalFood } from '../../types/nutrition.types';
import { MASTER_CANONICAL_FOODS_AI_PROMPT } from '../../db/seedData';
import { dbService } from '../../db/dbService';
import { awardXp } from '../../services/gamificationService';

interface CanonicalFoodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: CanonicalFood | null;
  onSaved?: () => void;
}

export const CanonicalFoodEditModal: React.FC<CanonicalFoodEditModalProps> = ({
  isOpen,
  onClose,
  food,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'json'>('visual');

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingSize, setServingSize] = useState('100g');
  const [servingGrams, setServingGrams] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [category, setCategory] = useState<any>('other');
  const [notes, setNotes] = useState('');

  const [nutrients, setNutrients] = useState<Record<string, string>>({});

  const [jsonText, setJsonText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (food) {
      setName(food.name || '');
      setBrand(food.brand || '');
      setServingSize(food.servingSize || '100g');
      setServingGrams(String(food.servingGrams || 100));
      setCalories(String(food.calories || 0));
      setProtein(String(food.protein || 0));
      setCarbs(String(food.carbs || 0));
      setFat(String(food.fat || 0));
      setFiber(String(food.fiber || 0));
      setCategory(food.category || 'other');
      setNotes(food.notes || '');

      const nMap: Record<string, string> = {};
      if (food.nutrients) {
        for (const [k, v] of Object.entries(food.nutrients)) {
          if (v !== undefined && v !== null) nMap[k] = String(v);
        }
      }
      setNutrients(nMap);
      setJsonText(JSON.stringify(food, null, 2));
    } else {
      setName('');
      setBrand('');
      setServingSize('100g');
      setServingGrams('100');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setFiber('');
      setCategory('other');
      setNotes('');
      setNutrients({});

      const defaultNewObj = {
        name: '',
        brand: '',
        servingSize: '100g',
        servingGrams: 100,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        category: 'other',
        notes: '',
        nutrients: {
          saturated_fat_g: 0,
          monounsaturated_fat_g: 0,
          polyunsaturated_fat_g: 0,
          trans_fat_g: 0,
          omega3_g: 0,
          cholesterol_mg: 0,
          choline_mg: 0,
          sugar_g: 0,
          sodium_mg: 0,
          potassium_mg: 0,
          calcium_mg: 0,
          magnesium_mg: 0,
          iron_mg: 0,
          zinc_mg: 0,
          phosphorus_mg: 0,
          selenium_mcg: 0,
          vitamin_c_mg: 0,
          vitamin_d_iu: 0,
          vitamin_a_mcg: 0,
          vitamin_b12_mcg: 0,
          vitamin_b6_mg: 0,
          folate_mcg: 0,
          vitamin_e_mg: 0,
          vitamin_k_mcg: 0
        }
      };
      setJsonText(JSON.stringify(defaultNewObj, null, 2));
    }
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [food, isOpen]);

  const handleSwitchTab = (tab: 'visual' | 'json') => {
    if (tab === 'json') {
      const currentObject = buildFoodObject();
      setJsonText(JSON.stringify(currentObject, null, 2));
    } else {
      try {
        let clean = jsonText.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(clean);
        setName(parsed.name || '');
        setBrand(parsed.brand || '');
        setServingSize(parsed.servingSize || '100g');
        setServingGrams(String(parsed.servingGrams || 100));
        setCalories(String(parsed.calories || 0));
        setProtein(String(parsed.protein || 0));
        setCarbs(String(parsed.carbs || 0));
        setFat(String(parsed.fat || 0));
        setFiber(String(parsed.fiber || 0));
        setCategory(parsed.category || 'other');
        setNotes(parsed.notes || '');

        const nMap: Record<string, string> = {};
        if (parsed.nutrients) {
          for (const [k, v] of Object.entries(parsed.nutrients)) {
            if (v !== undefined && v !== null) nMap[k] = String(v);
          }
        }
        setNutrients(nMap);
        setErrorMessage(null);
      } catch (e: any) {
        setErrorMessage(`JSON inválido: ${e.message}`);
      }
    }
    setActiveTab(tab);
  };

  const handleNutrientChange = (key: string, val: string) => {
    setNutrients(prev => ({ ...prev, [key]: val }));
  };

  const buildFoodObject = (): CanonicalFood => {
    const parsedNutrients: Record<string, number> = {};
    for (const [k, v] of Object.entries(nutrients)) {
      const num = parseFloat(v);
      if (!isNaN(num)) {
        parsedNutrients[k] = num;
      }
    }

    return {
      id: food ? food.id : `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim() || 'Alimento sin nombre',
      brand: brand.trim() || 'Genérico',
      servingSize: servingSize.trim() || '100g',
      servingGrams: parseFloat(servingGrams) || 100,
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      category: category,
      notes: notes.trim() || undefined,
      sourceType: food ? food.sourceType : 'manual',
      nutrients: parsedNutrients,
      createdAt: food ? food.createdAt : Date.now(),
      updatedAt: Date.now()
    };
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_CANONICAL_FOODS_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyCurrentJson = () => {
    const obj = buildFoodObject();
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage(`Error de sintaxis: ${e.message}`);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      let finalFood: CanonicalFood;

      if (activeTab === 'json') {
        let clean = jsonText.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(clean);

        if (!parsed.name || !parsed.name.trim()) {
          throw new Error('El campo "name" es obligatorio.');
        }

        finalFood = {
          id: food ? food.id : (parsed.id || `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`),
          name: String(parsed.name).trim(),
          brand: parsed.brand ? String(parsed.brand).trim() : 'Genérico',
          servingSize: parsed.servingSize ? String(parsed.servingSize).trim() : '100g',
          servingGrams: Number(parsed.servingGrams) || 100,
          calories: Number(parsed.calories) || 0,
          protein: Number(parsed.protein) || 0,
          carbs: Number(parsed.carbs) || 0,
          fat: Number(parsed.fat) || 0,
          fiber: Number(parsed.fiber) || 0,
          category: parsed.category || 'other',
          notes: parsed.notes || undefined,
          sourceType: food ? food.sourceType : 'json',
          nutrients: parsed.nutrients || {},
          createdAt: food ? food.createdAt : Date.now(),
          updatedAt: Date.now()
        };
      } else {
        if (!name.trim()) {
          throw new Error('El nombre del alimento es obligatorio.');
        }
        finalFood = buildFoodObject();
      }

      await dbService.saveCanonicalFood(finalFood);
      if (!food) awardXp(25, 'Alimento Canónico Creado');

      setSuccessMessage('¡Alimento canónico guardado con éxito!');
      if (onSaved) onSaved();

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar el alimento canónico.');
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
        <div className="flex items-center justify-between w-full pr-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
              {activeTab === 'visual' ? <Sliders size={18} /> : <FileCode size={18} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {food ? `✏️ Modificar: ${food.name}` : '➕ Agregar Alimento Canónico'}
              </h3>
              <p className="text-xs text-slate-500">Matriz estricta de 24 micronutrientes y perfil lipídico</p>
            </div>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Selector de Modo: Visual vs JSON */}
        <div className="flex items-center justify-between bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSwitchTab('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'visual'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sliders size={14} /> Modo Visual (24 Nutrientes)
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'json'
                  ? 'bg-white text-indigo-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode size={14} /> Modo Editor JSON
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyPrompt}
              icon={copiedPrompt ? <Check size={13} className="text-indigo-600" /> : <Bot size={13} className="text-indigo-700" />}
              className="text-xs py-1 px-2"
              title="Copiar prompt para IA con los 24 nutrientes"
            >
              {copiedPrompt ? '¡Prompt Copiado!' : 'Prompt IA'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopyCurrentJson}
              icon={copiedJson ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              className="text-xs py-1 px-2"
              title="Copiar JSON de este alimento"
            >
              {copiedJson ? '¡Copiado!' : 'Copiar JSON'}
            </Button>
          </div>
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

        {activeTab === 'json' ? (
          /* MODO EDITOR JSON */
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={16}
                placeholder="Pega o edita aquí el JSON del alimento..."
                className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleFormatJson}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
              >
                <Wand2 size={13} /> Formatear / Embellecer JSON
              </button>
            </div>
          </div>
        ) : (
          /* MODO VISUAL COMPLETO CON LOS 24 NUTRIENTES */
          <form onSubmit={handleSave} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
            {/* Información Base */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">📦 Datos Comerciales</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Alimento *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Pan Cero Cero Multigrano"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca Comercial</label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Ej: Bimbo"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Porción Descriptiva</label>
                  <input
                    type="text"
                    value={servingSize}
                    onChange={(e) => setServingSize(e.target.value)}
                    placeholder="Ej: 2 rebanadas (60g)"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso en Gramos (g)</label>
                  <input
                    type="number"
                    value={servingGrams}
                    onChange={(e) => setServingGrams(e.target.value)}
                    placeholder="60"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-emerald-500"
                  >
                    <option value="protein">Proteínas</option>
                    <option value="dairy">Lácteos</option>
                    <option value="grains">Granos / Pan</option>
                    <option value="fats">Grasas / Aceites</option>
                    <option value="fruits">Frutas / Verduras</option>
                    <option value="supplements">Suplementos</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Macros Principales */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">🔥 Macronutrientes Principales</h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Calorías (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-sky-800 block mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-sky-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Grasa Total (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-amber-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-purple-800 block mb-1">Fibra (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-purple-700"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: PERFIL LIPÍDICO & GRASAS (8 Nutrientes) */}
            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/70 space-y-2.5">
              <div className="flex items-center gap-1.5 text-amber-900">
                <span className="text-sm">🫒</span>
                <h4 className="text-xs font-bold uppercase tracking-wider">Perfil Lipídico, Grasas & Colina (8 Nutrientes)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Grasas Saturadas (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.saturated_fat_g || ''}
                    onChange={(e) => handleNutrientChange('saturated_fat_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Monoinsaturadas (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.monounsaturated_fat_g || ''}
                    onChange={(e) => handleNutrientChange('monounsaturated_fat_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Poliinsaturadas (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.polyunsaturated_fat_g || ''}
                    onChange={(e) => handleNutrientChange('polyunsaturated_fat_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Grasas Trans (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.trans_fat_g || ''}
                    onChange={(e) => handleNutrientChange('trans_fat_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-emerald-800 block mb-0.5">Omega 3 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.omega3_g || ''}
                    onChange={(e) => handleNutrientChange('omega3_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-emerald-300 bg-white font-mono font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Colesterol (mg)</label>
                  <input
                    type="number"
                    value={nutrients.cholesterol_mg || ''}
                    onChange={(e) => handleNutrientChange('cholesterol_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Colina (mg)</label>
                  <input
                    type="number"
                    value={nutrients.choline_mg || ''}
                    onChange={(e) => handleNutrientChange('choline_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Azúcares (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.sugar_g || ''}
                    onChange={(e) => handleNutrientChange('sugar_g', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: MINERALES & ELECTROLITOS (8 Nutrientes) */}
            <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-200/70 space-y-2.5">
              <div className="flex items-center gap-1.5 text-sky-900">
                <span className="text-sm">⚡</span>
                <h4 className="text-xs font-bold uppercase tracking-wider">Minerales & Electrolitos (8 Nutrientes)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Sodio (mg)</label>
                  <input
                    type="number"
                    value={nutrients.sodium_mg || ''}
                    onChange={(e) => handleNutrientChange('sodium_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Potasio (mg)</label>
                  <input
                    type="number"
                    value={nutrients.potassium_mg || ''}
                    onChange={(e) => handleNutrientChange('potassium_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Calcio (mg)</label>
                  <input
                    type="number"
                    value={nutrients.calcium_mg || ''}
                    onChange={(e) => handleNutrientChange('calcium_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Magnesio (mg)</label>
                  <input
                    type="number"
                    value={nutrients.magnesium_mg || ''}
                    onChange={(e) => handleNutrientChange('magnesium_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Hierro (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.iron_mg || ''}
                    onChange={(e) => handleNutrientChange('iron_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Zinc (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.zinc_mg || ''}
                    onChange={(e) => handleNutrientChange('zinc_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Fósforo (mg)</label>
                  <input
                    type="number"
                    value={nutrients.phosphorus_mg || ''}
                    onChange={(e) => handleNutrientChange('phosphorus_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Selenio (mcg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.selenium_mcg || ''}
                    onChange={(e) => handleNutrientChange('selenium_mcg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: VITAMINAS ESENCIALES (8 Nutrientes) */}
            <div className="p-3.5 bg-orange-50/50 rounded-2xl border border-orange-200/70 space-y-2.5">
              <div className="flex items-center gap-1.5 text-orange-900">
                <span className="text-sm">🍊</span>
                <h4 className="text-xs font-bold uppercase tracking-wider">Vitaminas Esenciales (8 Nutrientes)</h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina C (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.vitamin_c_mg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_c_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina D (IU)</label>
                  <input
                    type="number"
                    value={nutrients.vitamin_d_iu || ''}
                    onChange={(e) => handleNutrientChange('vitamin_d_iu', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina A (mcg)</label>
                  <input
                    type="number"
                    value={nutrients.vitamin_a_mcg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_a_mcg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina B12 (mcg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.vitamin_b12_mcg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_b12_mcg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina B6 (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.vitamin_b6_mg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_b6_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Folato B9 (mcg)</label>
                  <input
                    type="number"
                    value={nutrients.folate_mcg || ''}
                    onChange={(e) => handleNutrientChange('folate_mcg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina E (mg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.vitamin_e_mg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_e_mg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-0.5">Vitamina K (mcg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nutrients.vitamin_k_mcg || ''}
                    onChange={(e) => handleNutrientChange('vitamin_k_mcg', e.target.value)}
                    placeholder="0"
                    className="w-full p-1.5 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <Button variant="secondary" size="sm" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            icon={<Save size={14} />}
            className="shadow-sm font-bold"
          >
            {isSaving ? 'Guardando...' : food ? 'Guardar Cambios' : 'Registrar Alimento'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
