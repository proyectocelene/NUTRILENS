import React, { useState } from 'react';
import { FileCode, Copy, Check, Bot, AlertCircle, Save, Wand2, Trash2, Layers, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { CanonicalFood } from '../../types/nutrition.types';
import { MASTER_CANONICAL_FOODS_AI_PROMPT } from '../../db/seedData';
import { dbService } from '../../db/dbService';
import { awardXp } from '../../services/gamificationService';

interface CanonicalJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  canonicalFoods: CanonicalFood[];
  onImportSuccess?: () => void;
}

export const CanonicalJsonModal: React.FC<CanonicalJsonModalProps> = ({
  isOpen,
  onClose,
  canonicalFoods,
  onImportSuccess
}) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const sampleSingle = {
    name: "Pan Bimbo Cero Cero",
    brand: "Bimbo",
    servingSize: "2 rebanadas (60g)",
    servingGrams: 60,
    calories: 140,
    protein: 7.0,
    carbs: 23.0,
    fat: 1.5,
    fiber: 3.5,
    category: "grains",
    notes: "0% azúcares añadidos",
    nutrients: {
      saturated_fat_g: 0.2,
      monounsaturated_fat_g: 0.4,
      polyunsaturated_fat_g: 0.7,
      trans_fat_g: 0.0,
      omega3_g: 0.0,
      cholesterol_mg: 0,
      choline_mg: 14,
      sugar_g: 1.5,
      sodium_mg: 180,
      iron_mg: 1.5,
      calcium_mg: 80,
      magnesium_mg: 32,
      potassium_mg: 95,
      zinc_mg: 0.9,
      vitamin_b6_mg: 0.2,
      folate_mcg: 65,
      vitamin_e_mg: 0.3,
      vitamin_c_mg: 0,
      vitamin_d_iu: 0,
      vitamin_a_mcg: 0,
      vitamin_b12_mcg: 0,
      vitamin_k_mcg: 1.5,
      selenium_mcg: 18.2,
      phosphorus_mg: 90
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_CANONICAL_FOODS_AI_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyAll = () => {
    navigator.clipboard.writeText(JSON.stringify(canonicalFoods, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON.stringify([sampleSingle], null, 2));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
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

  const handleImport = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      let clean = jsonText.trim();
      if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');

      const parsed = JSON.parse(clean);
      const itemsToProcess = Array.isArray(parsed) ? parsed : [parsed];

      if (itemsToProcess.length === 0) {
        throw new Error('No se encontraron alimentos en el JSON.');
      }

      let importedCount = 0;
      for (const item of itemsToProcess) {
        if (!item || typeof item !== 'object' || !item.name) continue;

        const food: CanonicalFood = {
          id: item.id || `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: String(item.name).trim(),
          brand: item.brand ? String(item.brand).trim() : 'Genérico',
          servingSize: item.servingSize ? String(item.servingSize).trim() : '100g',
          servingGrams: Number(item.servingGrams) || 100,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          fiber: Number(item.fiber) || 0,
          category: item.category || 'other',
          notes: item.notes || 'Importado desde JSON',
          sourceType: 'json',
          nutrients: item.nutrients || {},
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now()
        };

        await dbService.saveCanonicalFood(food);
        importedCount++;
      }

      awardXp(importedCount * 20, `${importedCount} Alimentos Canónicos Importados`);
      setSuccessMessage(`¡${importedCount} alimento(s) canónico(s) guardado(s) exitosamente!`);
      if (onImportSuccess) onImportSuccess();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error importando alimentos canónicos.');
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
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-100 text-indigo-800">
            <FileCode size={20} />
          </div>
          <span>Editor & Importador JSON Canónico (Individual o Lote)</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Barra de Acciones de Copia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCopyPrompt}
            icon={copiedPrompt ? <Check size={13} /> : <Bot size={13} />}
            className="text-xs shadow-xs"
          >
            {copiedPrompt ? '¡Prompt Copiado!' : 'Copiar Prompt para IA'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleCopyTemplate}
            icon={copiedTemplate ? <Check size={13} /> : <Copy size={13} />}
            className="text-xs"
          >
            {copiedTemplate ? '¡Plantilla Copiada!' : 'Copiar Plantilla JSON'}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            icon={copiedAll ? <Check size={13} /> : <Download size={13} />}
            className="text-xs"
          >
            {copiedAll ? '¡Base Copiada!' : `Copiar Mi Base (${canonicalFoods.length})`}
          </Button>
        </div>

        {/* Textarea de edición JSON */}
        <div className="relative">
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            rows={12}
            placeholder={`Pega aquí un objeto JSON individual o un arreglo de varios alimentos:\n\n[\n  {\n    "name": "Pan Bimbo Cero Cero",\n    "brand": "Bimbo",\n    "servingSize": "2 rebanadas (60g)",\n    "calories": 140,\n    "protein": 7,\n    "carbs": 23,\n    "fat": 1.5,\n    "fiber": 3.5,\n    "nutrients": {\n      "saturated_fat_g": 0.2,\n      "omega3_g": 0,\n      "sodium_mg": 180\n    }\n  }\n]`}
            className="w-full font-mono text-xs bg-slate-900 text-emerald-400 p-3.5 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 custom-scrollbar leading-relaxed"
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

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFormat}
              disabled={!jsonText.trim()}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Wand2 size={13} /> Formatear JSON
            </button>
            <button
              type="button"
              onClick={() => setJsonText('')}
              disabled={!jsonText.trim()}
              className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              <Trash2 size={13} /> Limpiar
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleImport}
              disabled={isSaving || !jsonText.trim()}
              icon={<Save size={14} />}
              className="shadow-sm"
            >
              {isSaving ? 'Guardando...' : 'Importar y Guardar Alimentos'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
