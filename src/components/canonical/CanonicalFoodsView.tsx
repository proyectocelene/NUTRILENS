import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Database, 
  Camera, 
  Plus, 
  Search, 
  Trash2, 
  Edit3,
  Copy, 
  Check, 
  ShieldCheck, 
  FileCode,
  Download,
  AlertCircle,
  History,
  Star,
  CheckCircle2,
  Sparkles,
  SlidersHorizontal,
  Eye
} from 'lucide-react';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { CanonicalFood } from '../../types/nutrition.types';
import { LearnedFood } from '../../types/db.types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LabelScannerModal } from './LabelScannerModal';
import { BatchFoodEditorModal } from './BatchFoodEditorModal';
import { DatabaseAuditorModal } from '../analytics/DatabaseAuditorModal';
import { CanonicalFoodEditModal } from './CanonicalFoodEditModal';
import { LearnedFoodEditModal } from './LearnedFoodEditModal';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';

export const CanonicalFoodsView: React.FC = () => {
  const [activeBankTab, setActiveBankTab] = useState<'canonical' | 'learned'>('canonical');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isAuditorOpen, setIsAuditorOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLearnedModalOpen, setIsLearnedModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<CanonicalFood | null>(null);
  const [editingLearnedFood, setEditingLearnedFood] = useState<LearnedFood | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canonicalFoods = useLiveQuery(async () => {
    return await db.canonicalFoods.orderBy('name').toArray();
  }, []) || [];

  const learnedFoods = useLiveQuery(async () => {
    return await dbService.getLearnedFoods();
  }, []) || [];

  const filteredFoods = canonicalFoods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const filteredLearnedFoods = learnedFoods.filter(f => {
    return f.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const openCreateModal = () => {
    setEditingFood(null);
    setIsEditModalOpen(true);
  };

  const openEditModal = (food: CanonicalFood) => {
    setEditingFood(food);
    setIsEditModalOpen(true);
  };

  const openLearnedModal = (food: LearnedFood) => {
    setEditingLearnedFood(food);
    setIsLearnedModalOpen(true);
  };

  const handleCopySingleJson = (food: CanonicalFood) => {
    navigator.clipboard.writeText(JSON.stringify(food, null, 2));
    setCopiedId(food.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePromoteToCanonical = (item: LearnedFood) => {
    const newCanonical: CanonicalFood = {
      id: `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: item.name,
      brand: 'Detectado en comidas',
      servingSize: item.sampleAmount || '1 porción (~100g)',
      servingGrams: 100,
      calories: item.avgCalories,
      protein: item.avgProtein,
      carbs: item.avgCarbs,
      fat: item.avgFat,
      fiber: item.avgFiber,
      category: 'other',
      notes: `Alimento aprendido de tus comidas registradas (consumido en ${item.count} ocasiones). Promovido a canónico.`,
      sourceType: 'manual',
      nutrients: item.nutrients || {},
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setEditingFood(newCanonical);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${name}" del banco canónico?`)) {
      await dbService.deleteCanonicalFood(id);
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Banner Principal */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck size={14} /> Base de Datos Canónica Personal ({canonicalFoods.length} Alimentos)
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Banco Canónico de Alimentos & Auditoría Global
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Tu base de datos con fichas nutrimentales exactas y auditoría bioquímica. Cada vez que registras una comida, <strong>la IA compara en vivo con tus alimentos oficiales</strong> para eliminar discrepancias.
          </p>

          <div className="flex items-center gap-2.5 pt-3 flex-wrap">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Camera size={16} /> 📸 Escanear Etiqueta
            </button>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
            >
              <Plus size={16} /> ➕ Agregar Manual
            </button>
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <SlidersHorizontal size={16} /> 📄 Editor / Lote de Alimentos
            </button>
            <button
              onClick={() => setIsAuditorOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Database size={16} /> 🔍 Auditar & Exportar Base (JSON)
            </button>
          </div>
        </div>
      </div>

      {/* Selector de Pestañas: Canónico vs Aprendidos de Comidas */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveBankTab('canonical')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeBankTab === 'canonical'
              ? 'bg-white text-emerald-950 shadow-sm border border-slate-200/80 ring-2 ring-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck size={16} className={activeBankTab === 'canonical' ? 'text-emerald-700' : 'text-slate-400'} />
          <span>⭐ Banco Canónico ({canonicalFoods.length} Verificados)</span>
        </button>

        <button
          onClick={() => setActiveBankTab('learned')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeBankTab === 'learned'
              ? 'bg-white text-indigo-950 shadow-sm border border-slate-200/80 ring-2 ring-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History size={16} className={activeBankTab === 'learned' ? 'text-indigo-700' : 'text-slate-400'} />
          <span>🔍 Alimentos Aprendidos ({learnedFoods.length})</span>
        </button>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeBankTab === 'canonical'
                ? "Buscar en alimentos canónicos por nombre o marca..."
                : "Buscar en alimentos aprendidos de tus comidas..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 shadow-2xs font-medium"
          />
        </div>

        {activeBankTab === 'canonical' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'protein', label: '🥩 Proteínas' },
              { id: 'dairy', label: '🥛 Lácteos' },
              { id: 'grains', label: '🍞 Granos/Pan' },
              { id: 'fats', label: '🥑 Grasas' },
              { id: 'fruits', label: '🍎 Frutas/Verduras' },
              { id: 'supplements', label: '💊 Suplementos' },
              { id: 'other', label: '📦 Otros' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VISTA 1: GRID DE ALIMENTOS CANÓNICOS OFICIALES */}
      {activeBankTab === 'canonical' && (
        filteredFoods.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-slate-200">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 inline-block mb-3">
              <Database size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Sin alimentos coincidentes</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Escanea una etiqueta o agrega productos manualmente para alimentar tu base de datos canónica.
            </p>
          </Card>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFoods.map((food) => {
            const emoji = getSmartFoodEmoji(food.name);
            return (
              <Card key={food.id} className="border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="text-2xl p-2 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
                        {emoji}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                            {food.brand || 'Marca'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                            {food.sourceType === 'label_scan' ? '📸 Etiqueta' : food.sourceType === 'json' ? '📄 JSON' : '✍️ Ficha'}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 truncate">{food.name}</h4>
                        <p className="text-xs text-slate-500 font-medium font-mono">Porción: {food.servingSize}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-800 font-mono block">{food.calories} kcal</span>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <button
                          onClick={() => handleCopySingleJson(food)}
                          title="Copiar JSON con 24 nutrientes"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          {copiedId === food.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                        <button
                          onClick={() => openEditModal(food)}
                          title="Editar alimento y lípidos"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(food.id, food.name)}
                          title="Eliminar del banco"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-slate-100 text-center text-xs font-mono">
                    <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-emerald-800 block font-bold font-sans">Proteína</span>
                      <span className="font-extrabold text-emerald-950">{food.protein}g</span>
                    </div>
                    <div className="bg-sky-50/70 p-1.5 rounded-xl border border-sky-100">
                      <span className="text-[10px] text-sky-800 block font-bold font-sans">Carbos</span>
                      <span className="font-extrabold text-sky-950">{food.carbs}g</span>
                    </div>
                    <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100">
                      <span className="text-[10px] text-amber-800 block font-bold font-sans">Grasas</span>
                      <span className="font-extrabold text-amber-950">{food.fat}g</span>
                    </div>
                    <div className="bg-teal-50/70 p-1.5 rounded-xl border border-teal-100">
                      <span className="text-[10px] text-teal-800 block font-bold font-sans">Fibra</span>
                      <span className="font-extrabold text-teal-950">{food.fiber}g</span>
                    </div>
                  </div>
                </div>

                {/* Lípidos y Micronutrientes si existen */}
                {food.nutrients && Object.keys(food.nutrients).length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                    {Object.entries(food.nutrients).slice(0, 5).map(([key, val]) => (
                      <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {key.replace('_mg', 'mg').replace('_g', 'g').replace('_iu', 'UI').replace('_mcg', 'mcg')}: <strong>{val}</strong>
                      </span>
                    ))}
                    {Object.keys(food.nutrients).length > 5 && (
                      <span className="text-[9px] text-slate-400 self-center font-mono">
                        +{Object.keys(food.nutrients).length - 5} más
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        )
      )}

      {/* VISTA 2: GRID DE ALIMENTOS APRENDIDOS DE COMIDAS (BANCO NO CANÓNICO) */}
      {activeBankTab === 'learned' && (
        filteredLearnedFoods.length === 0 ? (
          <Card className="p-8 text-center bg-white border-dashed border-slate-200">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-700 inline-block mb-3">
              <History size={28} />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Sin alimentos aprendidos aún</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Cada vez que registras una comida o pegas un JSON, el sistema extrae automáticamente sus ingredientes aquí para que puedas analizarlos y promoverlos a tu banco canónico oficial con un solo clic.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredLearnedFoods.map((item) => {
              const emoji = getSmartFoodEmoji(item.name);
              return (
                <Card
                  key={item.id}
                  className="border-slate-200 bg-white shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="text-2xl p-2 rounded-2xl bg-indigo-50/60 border border-indigo-100 shrink-0">
                          {emoji}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                              🍽️ En {item.count} comida{item.count !== 1 ? 's' : ''}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              Última vez: {item.lastUsedDate}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 truncate">{item.name}</h4>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            Porción ref: {item.sampleAmount} ({item.sampleMealName})
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-amber-800 font-mono block">
                          ~{item.avgCalories} kcal
                        </span>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <button
                            onClick={() => openLearnedModal(item)}
                            title="Editar e inspeccionar 25 nutrientes"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Macros Promedio */}
                    <div className="grid grid-cols-4 gap-1.5 pt-3 mt-3 border-t border-slate-100 text-center text-xs font-mono">
                      <div className="bg-emerald-50/70 p-1.5 rounded-xl border border-emerald-100">
                        <span className="text-[10px] text-emerald-800 block font-bold font-sans">Proteína</span>
                        <span className="font-extrabold text-emerald-950">{item.avgProtein}g</span>
                      </div>
                      <div className="bg-sky-50/70 p-1.5 rounded-xl border border-sky-100">
                        <span className="text-[10px] text-sky-800 block font-bold font-sans">Carbos</span>
                        <span className="font-extrabold text-sky-950">{item.avgCarbs}g</span>
                      </div>
                      <div className="bg-amber-50/70 p-1.5 rounded-xl border border-amber-100">
                        <span className="text-[10px] text-amber-800 block font-bold font-sans">Grasas</span>
                        <span className="font-extrabold text-amber-950">{item.avgFat}g</span>
                      </div>
                      <div className="bg-teal-50/70 p-1.5 rounded-xl border border-teal-100">
                        <span className="text-[10px] text-teal-800 block font-bold font-sans">Fibra</span>
                        <span className="font-extrabold text-teal-950">{item.avgFiber}g</span>
                      </div>
                    </div>
                  </div>

                  {/* Pie de Tarjeta: Acciones Editar e Inspeccionar / Promover */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openLearnedModal(item)}
                      className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
                    >
                      <Eye size={13} />
                      <span>Ver Nutrientes</span>
                    </button>

                    {item.isAlreadyCanonical ? (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                        <CheckCircle2 size={13} className="text-emerald-700" />
                        <span>✓ En Banco Canónico</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePromoteToCanonical(item)}
                        title="Verificar y agregar como alimento canónico oficial"
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-emerald-600/20 active:scale-95 transition-all"
                      >
                        <Star size={13} className="text-amber-300 fill-amber-300" />
                        <span>⭐ Promover</span>
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      )}

      {/* Modal Escáner de Etiquetas */}
      <LabelScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaved={() => {}}
      />

      {/* Modal Editor de Lotes / Hoja de Cálculo Canónica */}
      <BatchFoodEditorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        canonicalFoods={canonicalFoods}
      />

      {/* Modal Auditor & Exportador Global de la Base de Datos */}
      <DatabaseAuditorModal
        isOpen={isAuditorOpen}
        onClose={() => setIsAuditorOpen(false)}
      />

      {/* Modal de Creación / Edición Canónica Completa con Emojis & Lípidos */}
      <CanonicalFoodEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        food={editingFood}
      />

      {/* Modal de Edición e Inspección de Alimento Aprendido */}
      <LearnedFoodEditModal
        isOpen={isLearnedModalOpen}
        onClose={() => setIsLearnedModalOpen(false)}
        food={editingLearnedFood}
        onPromoted={() => {}}
      />
    </div>
  );
};
