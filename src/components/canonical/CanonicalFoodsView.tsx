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
  AlertCircle
} from 'lucide-react';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { CanonicalFood } from '../../types/nutrition.types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LabelScannerModal } from './LabelScannerModal';
import { CanonicalJsonModal } from './CanonicalJsonModal';
import { getSmartFoodEmoji } from '../../utils/foodEmoji';
import { awardXp } from '../../services/gamificationService';

export const CanonicalFoodsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<CanonicalFood | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Formulario manual
  const [formName, setFormName] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formServing, setFormServing] = useState('100g');
  const [formServingGrams, setFormServingGrams] = useState('100');
  const [formCalories, setFormCalories] = useState('');
  const [formProtein, setFormProtein] = useState('');
  const [formCarbs, setFormCarbs] = useState('');
  const [formFat, setFormFat] = useState('');
  const [formFiber, setFormFiber] = useState('');
  const [formCategory, setFormCategory] = useState<any>('other');
  const [formNotes, setFormNotes] = useState('');

  // 24 Nutrientes en Formulario
  const [nutrients, setNutrients] = useState<Record<string, string>>({});

  const canonicalFoods = useLiveQuery(async () => {
    return await db.canonicalFoods.orderBy('name').toArray();
  }, []) || [];

  const filteredFoods = canonicalFoods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openCreateModal = () => {
    setEditingFood(null);
    setFormName('');
    setFormBrand('');
    setFormServing('100g');
    setFormServingGrams('100');
    setFormCalories('');
    setFormProtein('');
    setFormCarbs('');
    setFormFat('');
    setFormFiber('');
    setFormCategory('other');
    setFormNotes('');
    setNutrients({});
    setIsManualModalOpen(true);
  };

  const openEditModal = (food: CanonicalFood) => {
    setEditingFood(food);
    setFormName(food.name);
    setFormBrand(food.brand || '');
    setFormServing(food.servingSize || '100g');
    setFormServingGrams(String(food.servingGrams || 100));
    setFormCalories(String(food.calories || 0));
    setFormProtein(String(food.protein || 0));
    setFormCarbs(String(food.carbs || 0));
    setFormFat(String(food.fat || 0));
    setFormFiber(String(food.fiber || 0));
    setFormCategory(food.category || 'other');
    setFormNotes(food.notes || '');

    const nMap: Record<string, string> = {};
    if (food.nutrients) {
      for (const [k, v] of Object.entries(food.nutrients)) {
        if (v !== undefined) nMap[k] = String(v);
      }
    }
    setNutrients(nMap);
    setIsManualModalOpen(true);
  };

  const handleCopySingleJson = (food: CanonicalFood) => {
    navigator.clipboard.writeText(JSON.stringify(food, null, 2));
    setCopiedId(food.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${name}" del banco canónico?`)) {
      await dbService.deleteCanonicalFood(id);
    }
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedNutrients: Record<string, number> = {};
    for (const [k, v] of Object.entries(nutrients)) {
      const num = parseFloat(v);
      if (!isNaN(num) && num > 0) {
        parsedNutrients[k] = num;
      }
    }

    const foodData: CanonicalFood = {
      id: editingFood ? editingFood.id : `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: formName.trim(),
      brand: formBrand.trim() || 'Genérico',
      servingSize: formServing.trim() || '100g',
      servingGrams: parseFloat(formServingGrams) || 100,
      calories: parseFloat(formCalories) || 0,
      protein: parseFloat(formProtein) || 0,
      carbs: parseFloat(formCarbs) || 0,
      fat: parseFloat(formFat) || 0,
      fiber: parseFloat(formFiber) || 0,
      category: formCategory,
      notes: formNotes.trim() || undefined,
      sourceType: editingFood ? editingFood.sourceType : 'manual',
      nutrients: parsedNutrients,
      createdAt: editingFood ? editingFood.createdAt : Date.now(),
      updatedAt: Date.now()
    };

    await dbService.saveCanonicalFood(foodData);
    if (!editingFood) awardXp(25, 'Alimento Canónico Registrado');
    setIsManualModalOpen(false);
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
            Banco Canónico de Alimentos & Etiquetas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Tu base de datos personal con fichas nutrimentales exactas. Cada vez que registras una comida, <strong>la IA compara en vivo con estos alimentos</strong> y usa sus datos oficiales para eliminar discrepancias.
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
              onClick={() => setIsJsonModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <FileCode size={16} /> 📄 Editor / Lote JSON
            </button>
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por alimento o marca..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'protein', label: 'Proteínas' },
            { id: 'dairy', label: 'Lácteos' },
            { id: 'grains', label: 'Granos / Pan' },
            { id: 'supplements', label: 'Suplementos' }
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
      </div>

      {/* Grid de Alimentos Canónicos */}
      {filteredFoods.length === 0 ? (
        <Card className="p-8 text-center bg-white border-dashed border-slate-200">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 inline-block mb-3">
            <Database size={28} />
          </div>
          <h4 className="text-sm font-bold text-slate-900 mb-1">Sin alimentos coincidentes</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Escanea una etiqueta o agrega productos manualmente para alimentar tu base de datos.
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
                          title="Editar alimento"
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
                      <span className="text-[9px] text-slate-400 self-center">
                        +{Object.keys(food.nutrients).length - 5} más
                      </span>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Escáner de Etiquetas */}
      <LabelScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaved={() => {}}
      />

      {/* Modal Editor / Lote JSON */}
      <CanonicalJsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        canonicalFoods={canonicalFoods}
      />

      {/* Modal de Creación / Edición Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingFood ? '✏️ Modificar Alimento Canónico' : '➕ Agregar Alimento Canónico'}
                </h3>
                <p className="text-xs text-slate-500">Valores de referencia con desglose completo de 24 nutrientes</p>
              </div>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveManual} className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Alimento *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ej: Pan Cero Cero Multigrano"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca Comercial</label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    placeholder="Ej: Bimbo"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Porción Descriptiva</label>
                  <input
                    type="text"
                    value={formServing}
                    onChange={(e) => setFormServing(e.target.value)}
                    placeholder="Ej: 2 rebanadas (60g)"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso en Gramos (g)</label>
                  <input
                    type="number"
                    value={formServingGrams}
                    onChange={(e) => setFormServingGrams(e.target.value)}
                    placeholder="60"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              {/* Macros Principales */}
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Calorías</label>
                  <input
                    type="number"
                    value={formCalories}
                    onChange={(e) => setFormCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formProtein}
                    onChange={(e) => setFormProtein(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-sky-800 block mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formCarbs}
                    onChange={(e) => setFormCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formFat}
                    onChange={(e) => setFormFat(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Perfil Lipídico */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">🫒 Perfil de Lípidos & Grasas:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Grasas Sat (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.saturated_fat_g || ''}
                      onChange={(e) => setNutrients({ ...nutrients, saturated_fat_g: e.target.value })}
                      placeholder="0.2"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Omega 3 (g)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.omega3_g || ''}
                      onChange={(e) => setNutrients({ ...nutrients, omega3_g: e.target.value })}
                      placeholder="0"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Colesterol (mg)</label>
                    <input
                      type="number"
                      value={nutrients.cholesterol_mg || ''}
                      onChange={(e) => setNutrients({ ...nutrients, cholesterol_mg: e.target.value })}
                      placeholder="0"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Minerales & Vitaminas Clave */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="font-bold text-slate-800 block text-xs">⚡ Minerales & Vitaminas:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Sodio (mg)</label>
                    <input
                      type="number"
                      value={nutrients.sodium_mg || ''}
                      onChange={(e) => setNutrients({ ...nutrients, sodium_mg: e.target.value })}
                      placeholder="180"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Potasio (mg)</label>
                    <input
                      type="number"
                      value={nutrients.potassium_mg || ''}
                      onChange={(e) => setNutrients({ ...nutrients, potassium_mg: e.target.value })}
                      placeholder="95"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Hierro (mg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nutrients.iron_mg || ''}
                      onChange={(e) => setNutrients({ ...nutrients, iron_mg: e.target.value })}
                      placeholder="1.5"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Calcio (mg)</label>
                    <input
                      type="number"
                      value={nutrients.calcium_mg || ''}
                      onChange={(e) => setNutrients({ ...nutrients, calcium_mg: e.target.value })}
                      placeholder="80"
                      className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {editingFood ? 'Guardar Cambios' : 'Registrar Alimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
