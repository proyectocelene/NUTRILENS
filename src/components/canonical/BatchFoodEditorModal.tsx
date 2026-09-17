import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Code, 
  Save, 
  Plus, 
  Trash2, 
  Wand2, 
  Download, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CanonicalFood } from '../../types/nutrition.types';
import { dbService } from '../../db/dbService';
import { MASTER_CANONICAL_FOODS_AI_PROMPT } from '../../db/seedData';
import { FOOD_EMOJI_PALETTE, getSmartFoodEmoji } from '../../utils/foodEmoji';
import { awardXp } from '../../services/gamificationService';

interface BatchFoodEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalFoods: CanonicalFood[];
  onSaved?: () => void;
}

interface EditableFoodRow {
  id: string;
  name: string;
  emoji: string;
  brand: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  category: string;
  saturated_fat_g: number;
  monounsaturated_fat_g: number;
  polyunsaturated_fat_g: number;
  sodium_mg: number;
  nutrients: Record<string, number>;
}

export const BatchFoodEditorModal: React.FC<BatchFoodEditorModalProps> = ({
  isOpen,
  onClose,
  canonicalFoods,
  onSaved
}) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'json'>('grid');
  const [rows, setRows] = useState<EditableFoodRow[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      const initialRows: EditableFoodRow[] = canonicalFoods.map(f => ({
        id: f.id,
        name: f.name || '',
        emoji: getSmartFoodEmoji(f.name),
        brand: f.brand || 'Genérico',
        servingSize: f.servingSize || '100g',
        calories: Number(f.calories) || 0,
        protein: Number(f.protein) || 0,
        carbs: Number(f.carbs) || 0,
        fat: Number(f.fat) || 0,
        fiber: Number(f.fiber) || 0,
        category: f.category || 'other',
        saturated_fat_g: f.nutrients?.saturated_fat_g || 0,
        monounsaturated_fat_g: f.nutrients?.monounsaturated_fat_g || 0,
        polyunsaturated_fat_g: f.nutrients?.polyunsaturated_fat_g || 0,
        sodium_mg: f.nutrients?.sodium_mg || 0,
        nutrients: (f.nutrients as Record<string, number>) || {}
      }));
      setRows(initialRows);
      setJsonText(JSON.stringify(canonicalFoods, null, 2));
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [canonicalFoods, isOpen]);

  if (!isOpen) return null;

  const handleRowChange = (index: number, field: keyof EditableFoodRow, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const handleAddRow = () => {
    const newRow: EditableFoodRow = {
      id: `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Nuevo Alimento',
      emoji: '🍽️',
      brand: 'Genérico',
      servingSize: '100g',
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 2,
      fiber: 2,
      category: 'other',
      saturated_fat_g: 0.5,
      monounsaturated_fat_g: 1.0,
      polyunsaturated_fat_g: 0.5,
      sodium_mg: 50,
      nutrients: {}
    };
    setRows([newRow, ...rows]);
  };

  const handleDeleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  // Función de auto-reparación y cálculo lipídico bioquímico
  const handleAutoRepairLipids = () => {
    let repairedCount = 0;
    const updated = rows.map(r => {
      const f = r.fat;
      if (f > 0 && r.saturated_fat_g === 0 && r.monounsaturated_fat_g === 0 && r.polyunsaturated_fat_g === 0) {
        repairedCount++;
        // Estimar proporciones biológicas típicas según categoría
        if (r.category === 'fats' || r.name.toLowerCase().includes('almendra') || r.name.toLowerCase().includes('nuez') || r.name.toLowerCase().includes('aguacate') || r.name.toLowerCase().includes('oliva')) {
          // Rico en monoinsaturados (oleico)
          return {
            ...r,
            monounsaturated_fat_g: Math.round(f * 0.65 * 10) / 10,
            polyunsaturated_fat_g: Math.round(f * 0.20 * 10) / 10,
            saturated_fat_g: Math.round(f * 0.15 * 10) / 10
          };
        } else if (r.category === 'dairy' || r.category === 'protein') {
          // Lácteos o carnes: saturados moderados
          return {
            ...r,
            saturated_fat_g: Math.round(f * 0.50 * 10) / 10,
            monounsaturated_fat_g: Math.round(f * 0.35 * 10) / 10,
            polyunsaturated_fat_g: Math.round(f * 0.15 * 10) / 10
          };
        } else {
          return {
            ...r,
            saturated_fat_g: Math.round(f * 0.30 * 10) / 10,
            monounsaturated_fat_g: Math.round(f * 0.40 * 10) / 10,
            polyunsaturated_fat_g: Math.round(f * 0.30 * 10) / 10
          };
        }
      }
      return r;
    });

    setRows(updated);
    setSuccessMessage(`¡Se auto-calcularon y repararon los perfiles lipídicos de ${repairedCount} alimentos!`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Guardar todo el lote a IndexedDB
  const handleSaveBatch = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      let foodsToSave: CanonicalFood[] = [];

      if (activeTab === 'grid') {
        foodsToSave = rows.map(r => ({
          id: r.id,
          name: r.name.trim(),
          brand: r.brand.trim() || 'Genérico',
          servingSize: r.servingSize.trim() || '100g',
          servingGrams: 100,
          calories: Number(r.calories) || 0,
          protein: Number(r.protein) || 0,
          carbs: Number(r.carbs) || 0,
          fat: Number(r.fat) || 0,
          fiber: Number(r.fiber) || 0,
          category: r.category as any,
          notes: 'Editado en lote',
          sourceType: 'manual',
          nutrients: {
            ...r.nutrients,
            saturated_fat_g: Number(r.saturated_fat_g) || 0,
            monounsaturated_fat_g: Number(r.monounsaturated_fat_g) || 0,
            polyunsaturated_fat_g: Number(r.polyunsaturated_fat_g) || 0,
            sodium_mg: Number(r.sodium_mg) || 0
          },
          createdAt: Date.now(),
          updatedAt: Date.now()
        }));
      } else {
        // Parsear desde JSON
        let clean = jsonText.trim();
        if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

        const parsed = JSON.parse(clean);
        const arrayItems = Array.isArray(parsed) ? parsed : parsed.canonicalFoods || parsed.foods || [parsed];

        foodsToSave = arrayItems.map((item: any) => ({
          id: item.id || `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: String(item.name || '').trim(),
          brand: item.brand ? String(item.brand).trim() : 'Genérico',
          servingSize: item.servingSize ? String(item.servingSize).trim() : '100g',
          servingGrams: Number(item.servingGrams) || 100,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          fiber: Number(item.fiber) || 0,
          category: item.category || 'other',
          notes: item.notes || 'Importado en lote JSON',
          sourceType: 'json',
          nutrients: item.nutrients || {},
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now()
        }));
      }

      if (foodsToSave.length === 0) {
        throw new Error('No hay alimentos válidos para guardar.');
      }

      for (const food of foodsToSave) {
        if (!food.name) continue;
        await dbService.saveCanonicalFood(food);
      }

      awardXp(foodsToSave.length * 20, `${foodsToSave.length} Alimentos Canónicos Guardados en Lote`);
      setSuccessMessage(`¡${foodsToSave.length} alimentos canónicos sincronizados y guardados exitosamente!`);
      if (onSaved) onSaved();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error guardando lote.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_CANONICAL_FOODS_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 text-white shadow-md shadow-indigo-500/20">
            <SlidersHorizontal size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base sm:text-lg">Editor de Lotes & Hoja de Cálculo Canónica</span>
              <Badge variant="purple" size="sm">{rows.length} Alimentos</Badge>
            </div>
            <span className="text-xs text-slate-500 font-normal">
              Edita, valida la fórmula Atwater y repara perfiles lipídicos de forma masiva.
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Barra Superior: Selector de Modo & Herramientas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('grid')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table size={14} className={activeTab === 'grid' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>Modo Tabla / Hoja</span>
            </button>

            <button
              type="button"
              onClick={() => {
                // Sincronizar jsonText con rows actuales
                const currentCanonical = rows.map(r => ({
                  id: r.id,
                  name: r.name,
                  brand: r.brand,
                  servingSize: r.servingSize,
                  calories: r.calories,
                  protein: r.protein,
                  carbs: r.carbs,
                  fat: r.fat,
                  fiber: r.fiber,
                  category: r.category,
                  nutrients: {
                    ...r.nutrients,
                    saturated_fat_g: r.saturated_fat_g,
                    monounsaturated_fat_g: r.monounsaturated_fat_g,
                    polyunsaturated_fat_g: r.polyunsaturated_fat_g,
                    sodium_mg: r.sodium_mg
                  }
                }));
                setJsonText(JSON.stringify(currentCanonical, null, 2));
                setActiveTab('json');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'json'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code size={14} className={activeTab === 'json' ? 'text-indigo-600' : 'text-slate-400'} />
              <span>Modo Editor JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeTab === 'grid' && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoRepairLipids}
                  icon={<Wand2 size={13} className="text-amber-600" />}
                  className="text-xs"
                >
                  Auto-Reparar Lípidos en Ceros
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddRow}
                  icon={<Plus size={13} />}
                  className="text-xs"
                >
                  + Añadir Fila
                </Button>
              </>
            )}

            {activeTab === 'json' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                icon={copiedPrompt ? <Check size={13} /> : <Bot size={13} />}
                className="text-xs"
              >
                {copiedPrompt ? '¡Prompt Copiado!' : 'Copiar Prompt para IA'}
              </Button>
            )}
          </div>
        </div>

        {/* MODO 1: HOJA DE CÁLCULO / TABLA */}
        {activeTab === 'grid' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="overflow-x-auto max-h-[380px] custom-scrollbar border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 w-12 text-center">Emoji</th>
                    <th className="p-2.5 min-w-[150px]">Alimento</th>
                    <th className="p-2.5 min-w-[100px]">Marca</th>
                    <th className="p-2.5 w-24">Porción</th>
                    <th className="p-2.5 w-20 text-center text-amber-900">Kcal</th>
                    <th className="p-2.5 w-16 text-center text-emerald-800">Prot (g)</th>
                    <th className="p-2.5 w-16 text-center text-sky-800">Carb (g)</th>
                    <th className="p-2.5 w-16 text-center text-amber-800">Grasa (g)</th>
                    <th className="p-2.5 w-16 text-center text-teal-800">Fib (g)</th>
                    <th className="p-2.5 w-16 text-center">Sat (g)</th>
                    <th className="p-2.5 w-16 text-center">Mono (g)</th>
                    <th className="p-2.5 w-16 text-center">Poli (g)</th>
                    <th className="p-2.5 w-20 text-center">Atwater</th>
                    <th className="p-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium">
                  {rows.map((row, idx) => {
                    const atwater = Math.round((row.protein * 4) + (row.carbs * 4) + (row.fat * 9));
                    const isBalanced = row.calories === 0 || Math.abs(atwater - row.calories) <= Math.max(10, row.calories * 0.15);

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-1.5 text-center">
                          <input
                            type="text"
                            value={row.emoji}
                            onChange={(e) => handleRowChange(idx, 'emoji', e.target.value)}
                            className="w-9 text-center text-base bg-slate-50 border border-slate-200 rounded-lg p-1"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                            className="w-full font-bold text-slate-900 bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-lg p-1.5"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.brand}
                            onChange={(e) => handleRowChange(idx, 'brand', e.target.value)}
                            className="w-full text-slate-600 bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-lg p-1.5"
                          />
                        </td>
                        <td className="p-1.5">
                          <input
                            type="text"
                            value={row.servingSize}
                            onChange={(e) => handleRowChange(idx, 'servingSize', e.target.value)}
                            className="w-full text-slate-600 bg-slate-50/50 focus:bg-white border border-transparent focus:border-indigo-400 rounded-lg p-1.5 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            value={row.calories}
                            onChange={(e) => handleRowChange(idx, 'calories', parseFloat(e.target.value) || 0)}
                            className="w-16 text-center font-black text-amber-900 bg-amber-50/50 border border-amber-200 rounded-lg p-1.5 font-mono"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.protein}
                            onChange={(e) => handleRowChange(idx, 'protein', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-emerald-950 bg-emerald-50/50 border border-emerald-200 rounded-lg p-1.5 font-mono"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.carbs}
                            onChange={(e) => handleRowChange(idx, 'carbs', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-sky-950 bg-sky-50/50 border border-sky-200 rounded-lg p-1.5 font-mono"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.fat}
                            onChange={(e) => handleRowChange(idx, 'fat', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-amber-950 bg-amber-50/50 border border-amber-200 rounded-lg p-1.5 font-mono"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.fiber}
                            onChange={(e) => handleRowChange(idx, 'fiber', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center font-bold text-teal-950 bg-teal-50/50 border border-teal-200 rounded-lg p-1.5 font-mono"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.saturated_fat_g}
                            onChange={(e) => handleRowChange(idx, 'saturated_fat_g', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.monounsaturated_fat_g}
                            onChange={(e) => handleRowChange(idx, 'monounsaturated_fat_g', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={row.polyunsaturated_fat_g}
                            onChange={(e) => handleRowChange(idx, 'polyunsaturated_fat_g', parseFloat(e.target.value) || 0)}
                            className="w-14 text-center text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-mono text-[11px]"
                          />
                        </td>
                        <td className="p-1.5 text-center">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                            isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`} title={`Atwater: ${atwater} kcal vs Declarado: ${row.calories} kcal`}>
                            {atwater}k
                          </span>
                        </td>
                        <td className="p-1.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Eliminar fila"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Consejo: Haz clic en cualquier celda para editar valores directamente.</span>
              <span className="font-mono">{rows.length} alimentos en tabla</span>
            </div>
          </div>
        )}

        {/* MODO 2: EDITOR JSON */}
        {activeTab === 'json' && (
          <div className="space-y-3 animate-fadeIn">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={14}
              placeholder={`[\n  {\n    "name": "Pan Bimbo Cero Cero",\n    "calories": 140,\n    "protein": 7,\n    "carbs": 23,\n    "fat": 1.5,\n    "fiber": 3.5\n  }\n]`}
              className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-indigo-500 custom-scrollbar leading-relaxed"
            />
          </div>
        )}

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

        {/* Pie de Acciones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Los cambios se guardan permanentemente en tu base de datos IndexedDB.
          </span>

          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleSaveBatch}
              disabled={isSaving}
              icon={<Save size={14} />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs"
            >
              {isSaving ? 'Guardando Lote...' : 'Guardar y Sincronizar Lote'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
