import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { Card } from '../common/Card';
import { Micronutrients, NutritionGoals } from '../../types/nutrition.types';
import { ProgressBar } from '../common/ProgressBar';

interface MicronutrientGridProps {
  nutrients: Micronutrients;
  goals: NutritionGoals;
}

interface NutrientDef {
  key: keyof Micronutrients;
  name: string;
  unit: string;
  targetKey?: keyof NutritionGoals['microGoals'];
  category: 'lipids' | 'vitamins' | 'minerals' | 'other';
  idealNote?: string;
}

const NUTRIENT_DEFINITIONS: NutrientDef[] = [
  // Perfil Lipídico & Grasas
  { key: 'omega3_g', name: 'Omega 3 (EPA/DHA/ALA)', unit: 'g', category: 'lipids', idealNote: 'Meta: ≥1.5g / día' },
  { key: 'monounsaturated_fat_g', name: 'Grasas Monoinsaturadas (Buenas)', unit: 'g', category: 'lipids', idealNote: 'Aceite de oliva, aguacate' },
  { key: 'polyunsaturated_fat_g', name: 'Grasas Poliinsaturadas', unit: 'g', category: 'lipids', idealNote: 'Frutos secos, pescado' },
  { key: 'saturated_fat_g', name: 'Grasas Saturadas', unit: 'g', category: 'lipids', idealNote: 'Mantener ≤15-20g / día' },
  { key: 'trans_fat_g', name: 'Grasas Trans', unit: 'g', category: 'lipids', idealNote: 'Ideal: 0g' },
  { key: 'cholesterol_mg', name: 'Colesterol Dietético', unit: 'mg', category: 'lipids', idealNote: 'Huevos, carnes magras' },
  { key: 'choline_mg', name: 'Colina (Salud Hepática)', unit: 'mg', category: 'lipids', idealNote: 'Meta: ~450mg' },

  // Vitaminas
  { key: 'vitamin_c_mg', name: 'Vitamina C', unit: 'mg', targetKey: 'vitamin_c_mg', category: 'vitamins' },
  { key: 'vitamin_d_iu', name: 'Vitamina D', unit: 'IU', targetKey: 'vitamin_d_iu', category: 'vitamins' },
  { key: 'vitamin_a_mcg', name: 'Vitamina A', unit: 'mcg', targetKey: 'vitamin_a_mcg', category: 'vitamins' },
  { key: 'vitamin_b12_mcg', name: 'Vitamina B12', unit: 'mcg', targetKey: 'vitamin_b12_mcg', category: 'vitamins' },
  { key: 'folate_mcg', name: 'Folato (B9)', unit: 'mcg', targetKey: 'folate_mcg', category: 'vitamins' },
  { key: 'vitamin_e_mg', name: 'Vitamina E', unit: 'mg', targetKey: 'vitamin_e_mg', category: 'vitamins' },
  { key: 'vitamin_k_mcg', name: 'Vitamina K', unit: 'mcg', category: 'vitamins' },
  { key: 'vitamin_b6_mg', name: 'Vitamina B6', unit: 'mg', category: 'vitamins' },

  // Minerales
  { key: 'iron_mg', name: 'Hierro', unit: 'mg', targetKey: 'iron_mg', category: 'minerals' },
  { key: 'magnesium_mg', name: 'Magnesio', unit: 'mg', targetKey: 'magnesium_mg', category: 'minerals' },
  { key: 'potassium_mg', name: 'Potasio', unit: 'mg', targetKey: 'potassium_mg', category: 'minerals' },
  { key: 'calcium_mg', name: 'Calcio', unit: 'mg', targetKey: 'calcium_mg', category: 'minerals' },
  { key: 'zinc_mg', name: 'Zinc', unit: 'mg', targetKey: 'zinc_mg', category: 'minerals' },
  { key: 'sodium_mg', name: 'Sodio', unit: 'mg', targetKey: 'sodium_mg', category: 'minerals' },
  { key: 'phosphorus_mg', name: 'Fósforo', unit: 'mg', category: 'minerals' },
  { key: 'selenium_mcg', name: 'Selenio', unit: 'mcg', category: 'minerals' },

  // Otros
  { key: 'sugar_g', name: 'Azúcares Simples', unit: 'g', category: 'other' }
];

export const MicronutrientGrid: React.FC<MicronutrientGridProps> = ({ nutrients, goals }) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'lipids' | 'vitamins' | 'minerals' | 'other'>('all');

  const filteredDefinitions = NUTRIENT_DEFINITIONS.filter(d => {
    if (filterCategory === 'all') return true;
    return d.category === filterCategory;
  });

  return (
    <Card className="border-slate-200 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 min-w-0">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 truncate">
            <Sparkles size={16} className="text-emerald-600 shrink-0" />
            <span className="truncate">Desglose Integral de Nutrientes & Lípidos</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate">Vitaminas, minerales, perfil lipídico (Omega 3, saturadas) y colina</p>
        </div>

        {/* Selector de Categorías */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs overflow-x-auto no-scrollbar max-w-full shrink-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'lipids', label: '🫒 Grasas & Omega 3' },
            { id: 'vitamins', label: '🍊 Vitaminas' },
            { id: 'minerals', label: '⚡ Minerales' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all shrink-0 text-xs ${
                filterCategory === cat.id
                  ? 'bg-white text-emerald-800 font-bold shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredDefinitions.map(def => {
          const val = nutrients[def.key] || 0;
          const target = def.targetKey ? goals.microGoals[def.targetKey] : undefined;
          const pct = target && target > 0 ? Math.round((val / target) * 100) : null;

          return (
            <div
              key={def.key}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">{def.name}</span>
                  <span className="font-black text-slate-900 font-mono">
                    {val} <span className="text-[10px] font-normal text-slate-500">{def.unit}</span>
                  </span>
                </div>

                {target !== undefined ? (
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Meta: {target} {def.unit}</span>
                      <span className={pct && pct >= 80 ? 'text-emerald-700 font-bold' : 'text-amber-800 font-medium'}>
                        {pct}%
                      </span>
                    </div>
                    <ProgressBar value={val} max={target} height="sm" color="auto" />
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-500 mt-1">
                    {def.idealNote || 'Registro bioquímico'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
