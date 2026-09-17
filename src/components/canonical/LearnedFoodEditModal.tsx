import React, { useState, useEffect } from 'react';
import { 
  History, 
  Save, 
  Star, 
  Sparkles, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Sliders, 
  Info,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { LearnedFood } from '../../types/db.types';
import { CanonicalFood, Micronutrients } from '../../types/nutrition.types';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { FOOD_EMOJI_PALETTE, getSmartFoodEmoji } from '../../utils/foodEmoji';
import { awardXp } from '../../services/gamificationService';

interface LearnedFoodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: LearnedFood | null;
  onPromoted?: () => void;
}

export const LearnedFoodEditModal: React.FC<LearnedFoodEditModalProps> = ({
  isOpen,
  onClose,
  food,
  onPromoted
}) => {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍽️');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [servingSize, setServingSize] = useState('1 porción (~100g)');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fat, setFat] = useState('0');
  const [fiber, setFiber] = useState('0');
  const [nutrients, setNutrients] = useState<Record<string, string>>({});
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (food) {
      setName(food.name || '');
      setEmoji(getSmartFoodEmoji(food.name));
      setServingSize(food.sampleAmount || '1 porción (~100g)');
      setCalories(String(food.avgCalories || 0));
      setProtein(String(food.avgProtein || 0));
      setCarbs(String(food.avgCarbs || 0));
      setFat(String(food.avgFat || 0));
      setFiber(String(food.avgFiber || 0));

      const nMap: Record<string, string> = {};
      if (food.nutrients) {
        for (const [k, v] of Object.entries(food.nutrients)) {
          if (v !== undefined && v !== null) {
            nMap[k] = String(v);
          }
        }
      }
      setNutrients(nMap);
    }
    setSuccessMessage(null);
  }, [food, isOpen]);

  if (!isOpen || !food) return null;

  const handleNutrientChange = (key: string, val: string) => {
    setNutrients(prev => ({ ...prev, [key]: val }));
  };

  // Cálculo Atwater en vivo
  const pNum = parseFloat(protein) || 0;
  const cNum = parseFloat(carbs) || 0;
  const fNum = parseFloat(fat) || 0;
  const calNum = parseFloat(calories) || 0;
  const atwaterCal = Math.round((pNum * 4) + (cNum * 4) + (fNum * 9));
  const atwaterDiff = Math.abs(atwaterCal - calNum);
  const isAtwaterBalanced = calNum === 0 || atwaterDiff <= Math.max(10, calNum * 0.15);

  // Promover a canónico oficial
  const handlePromote = async () => {
    setIsSaving(true);
    try {
      const parsedNutrients: Micronutrients = {};
      for (const [k, v] of Object.entries(nutrients)) {
        const num = parseFloat(v);
        if (!isNaN(num)) {
          parsedNutrients[k as keyof Micronutrients] = num;
        }
      }

      const newCanonical: CanonicalFood = {
        id: `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: name.trim(),
        brand: 'Promovido de comidas',
        servingSize,
        servingGrams: 100,
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        fiber: parseFloat(fiber) || 0,
        category: 'other',
        notes: `Alimento aprendido (consumido en ${food.count} comidas). Promovido a canónico.`,
        sourceType: 'manual',
        nutrients: parsedNutrients,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await dbService.saveCanonicalFood(newCanonical);
      awardXp(50, `Alimento Canónico Promovido: ${name}`);
      setSuccessMessage('¡Promovido exitosamente al Banco Canónico Oficial!');
      if (onPromoted) onPromoted();
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
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
        <div className="flex items-center gap-2.5">
          <div className="text-2xl p-1.5 rounded-2xl bg-indigo-50 border border-indigo-200">
            {emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base">Alimento Aprendido de Comidas</span>
              <Badge variant="purple" size="sm">Registrado en {food.count} comida(s)</Badge>
            </div>
            <span className="text-xs text-slate-500 font-normal">
              Inspecciona todos sus nutrientes, ajusta el emoji o promueve a tu banco oficial.
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Selector de Emoji y Nombre */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-3">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Emoji:</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-2xl transition-colors shadow-2xs"
              >
                <span>{emoji}</span>
                <Edit3 size={13} className="text-slate-400" />
              </button>

              {showEmojiPicker && (
                <div className="absolute top-12 left-0 z-50 p-2.5 bg-white border border-slate-200 rounded-2xl shadow-xl w-64 max-h-48 overflow-y-auto custom-scrollbar grid grid-cols-6 gap-1.5">
                  {FOOD_EMOJI_PALETTE.map((e, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setEmoji(e);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 hover:bg-slate-100 rounded-lg text-lg transition-transform hover:scale-110 flex items-center justify-center"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-9">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre del Alimento:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Porción y Calorías */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Porción de Referencia:</label>
            <input
              type="text"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Calorías (kcal):</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full text-xs font-mono font-black px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 text-amber-800"
            />
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Balance Atwater:</label>
            <div className={`p-2 rounded-xl border text-[10px] font-mono font-bold flex items-center justify-between ${
              isAtwaterBalanced ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}>
              <span>4P+4C+9G: {atwaterCal} kcal</span>
              {isAtwaterBalanced ? <span>✓ Coherente</span> : <span>⚠️ ~{atwaterDiff} kcal dif</span>}
            </div>
          </div>
        </div>

        {/* Macros Principales */}
        <div className="grid grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-[10px] text-emerald-700 block font-bold font-sans">Proteína (g)</span>
            <input
              type="number"
              step="0.1"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full bg-white text-emerald-950 font-black px-2 py-1 rounded-lg border border-emerald-300 text-center"
            />
          </div>

          <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
            <span className="text-[10px] text-sky-700 block font-bold font-sans">Carbos (g)</span>
            <input
              type="number"
              step="0.1"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="w-full bg-white text-sky-950 font-black px-2 py-1 rounded-lg border border-sky-300 text-center"
            />
          </div>

          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-[10px] text-amber-700 block font-bold font-sans">Grasas (g)</span>
            <input
              type="number"
              step="0.1"
              value={fat}
              onChange={(e) => setFat(e.target.value)}
              className="w-full bg-white text-amber-950 font-black px-2 py-1 rounded-lg border border-amber-300 text-center"
            />
          </div>

          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200">
            <span className="text-[10px] text-teal-700 block font-bold font-sans">Fibra (g)</span>
            <input
              type="number"
              step="0.1"
              value={fiber}
              onChange={(e) => setFiber(e.target.value)}
              className="w-full bg-white text-teal-950 font-black px-2 py-1 rounded-lg border border-teal-300 text-center"
            />
          </div>
        </div>

        {/* Desglose de Micronutrientes y Lípidos */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAllNutrients(!showAllNutrients)}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders size={14} className="text-indigo-600" />
              <span>Desglose de 25 Micronutrientes & Perfil Lipídico ({Object.keys(nutrients).length} registrados)</span>
            </div>
            {showAllNutrients ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showAllNutrients && (
            <div className="p-3.5 space-y-3 bg-white max-h-64 overflow-y-auto custom-scrollbar">
              {/* Sección Lípidos */}
              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-1.5">Perfil Lipídico & Colesterol:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Sat (g):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.saturated_fat_g || ''}
                      onChange={(e) => handleNutrientChange('saturated_fat_g', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Mono (g):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.monounsaturated_fat_g || ''}
                      onChange={(e) => handleNutrientChange('monounsaturated_fat_g', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Poli (g):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.polyunsaturated_fat_g || ''}
                      onChange={(e) => handleNutrientChange('polyunsaturated_fat_g', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Omega-3 (g):</label>
                    <input
                      type="number"
                      step="0.01"
                      value={nutrients.omega3_g || ''}
                      onChange={(e) => handleNutrientChange('omega3_g', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Sección Minerales y Vitaminas Clave */}
              <div>
                <span className="text-[11px] font-bold text-slate-900 block mb-1.5">Minerales & Vitaminas:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Sodio (mg):</label>
                    <input
                      type="number"
                      value={nutrients.sodium_mg || ''}
                      onChange={(e) => handleNutrientChange('sodium_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Potasio (mg):</label>
                    <input
                      type="number"
                      value={nutrients.potassium_mg || ''}
                      onChange={(e) => handleNutrientChange('potassium_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Magnesio (mg):</label>
                    <input
                      type="number"
                      value={nutrients.magnesium_mg || ''}
                      onChange={(e) => handleNutrientChange('magnesium_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Hierro (mg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.iron_mg || ''}
                      onChange={(e) => handleNutrientChange('iron_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Calcio (mg):</label>
                    <input
                      type="number"
                      value={nutrients.calcium_mg || ''}
                      onChange={(e) => handleNutrientChange('calcium_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Zinc (mg):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.zinc_mg || ''}
                      onChange={(e) => handleNutrientChange('zinc_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Vit C (mg):</label>
                    <input
                      type="number"
                      value={nutrients.vitamin_c_mg || ''}
                      onChange={(e) => handleNutrientChange('vitamin_c_mg', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">Vit D (IU):</label>
                    <input
                      type="number"
                      value={nutrients.vitamin_d_iu || ''}
                      onChange={(e) => handleNutrientChange('vitamin_d_iu', e.target.value)}
                      className="w-full text-xs font-mono px-2 py-1 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <Check size={16} className="text-emerald-700 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500">
            Promover añade este alimento con sus nutrientes a tu banco canónico oficial.
          </span>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handlePromote}
              disabled={isSaving}
              icon={<Star size={14} className="text-amber-300 fill-amber-300" />}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
            >
              {isSaving ? 'Guardando...' : '⭐ Promover a Banco Canónico'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
