import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { 
  Database, 
  Camera, 
  Plus, 
  Search, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  Tag, 
  FileText, 
  Info,
  Check
} from 'lucide-react';
import { db } from '../../db';
import { dbService } from '../../db/dbService';
import { CanonicalFood } from '../../types/nutrition.types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { LabelScannerModal } from './LabelScannerModal';

export const CanonicalFoodsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Formulario manual
  const [manualName, setManualName] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualServing, setManualServing] = useState('100g');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');
  const [manualFiber, setManualFiber] = useState('');
  const [manualSatFat, setManualSatFat] = useState('');
  const [manualOmega3, setManualOmega3] = useState('');
  const [manualCholesterol, setManualCholesterol] = useState('');
  const [manualSodium, setManualSodium] = useState('');

  const canonicalFoods = useLiveQuery(async () => {
    return await db.canonicalFoods.orderBy('name').toArray();
  }, []) || [];

  const filteredFoods = canonicalFoods.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (f.brand && f.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDelete = async (id: string) => {
    await dbService.deleteCanonicalFood(id);
  };

  const handleSaveManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const newFood: CanonicalFood = {
      id: `canon_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: manualName.trim(),
      brand: manualBrand.trim() || 'Genérico',
      servingSize: manualServing.trim() || '100g',
      calories: parseFloat(manualCalories) || 0,
      protein: parseFloat(manualProtein) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fat: parseFloat(manualFat) || 0,
      fiber: parseFloat(manualFiber) || 0,
      category: 'other',
      sourceType: 'manual',
      nutrients: {
        saturated_fat_g: manualSatFat ? parseFloat(manualSatFat) : undefined,
        omega3_g: manualOmega3 ? parseFloat(manualOmega3) : undefined,
        cholesterol_mg: manualCholesterol ? parseFloat(manualCholesterol) : undefined,
        sodium_mg: manualSodium ? parseFloat(manualSodium) : undefined
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await dbService.saveCanonicalFood(newFood);
    setIsManualModalOpen(false);
    // Limpiar campos
    setManualName('');
    setManualBrand('');
    setManualCalories('');
    setManualProtein('');
    setManualCarbs('');
    setManualFat('');
    setManualFiber('');
  };

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Banner Principal */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck size={14} /> Base de Datos Canónica Verificada
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Mi Banco de Alimentos & Etiquetas Canónicas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Registra y escanea la información nutrimental exacta de tus marcas habituales. Cada vez que registres comidas, <strong>la IA comparará tus alimentos con esta tabla</strong> para usar sus datos oficiales exactos sin discrepancias.
          </p>

          <div className="flex items-center gap-3 pt-3 flex-wrap">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Camera size={16} /> 📸 Escanear Foto de Etiqueta
            </button>
            <button
              onClick={() => setIsManualModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all"
            >
              <Plus size={16} /> ➕ Agregar Manual / Ficha
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
          <h4 className="text-sm font-bold text-slate-900 mb-1">Sin alimentos canónicos coincidentes</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Escanea la tabla nutrimental de un producto con la cámara o agrégalo manualmente para comenzar tu catálogo.
          </p>
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-2 hover:bg-emerald-800 transition-all"
          >
            <Camera size={15} /> Escanear mi primer producto
          </button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFoods.map((food) => (
            <Card key={food.id} className="border-slate-200 bg-white shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                      {food.brand || 'Marca'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      {food.sourceType === 'label_scan' ? '📸 Etiqueta IA' : '✍️ Canónico'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 truncate">{food.name}</h4>
                  <p className="text-xs text-slate-500 font-medium">Porción: {food.servingSize}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-amber-800 font-mono block">{food.calories} kcal</span>
                  <button
                    onClick={() => handleDelete(food.id)}
                    title="Eliminar del banco"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
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

              {/* Lípidos y Micronutrientes si existen */}
              {food.nutrients && Object.keys(food.nutrients).length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {Object.entries(food.nutrients).slice(0, 4).map(([key, val]) => (
                    <span key={key} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {key.replace('_mg', '').replace('_g', '').replace('_iu', 'UI')}: <strong>{val}</strong>
                    </span>
                  ))}
                  {Object.keys(food.nutrients).length > 4 && (
                    <span className="text-[9px] text-slate-400 self-center">
                      +{Object.keys(food.nutrients).length - 4} más
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal Escáner de Etiquetas */}
      <LabelScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSaved={() => {}}
      />

      {/* Modal Manual */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Agregar Alimento Canónico</h3>
              <button onClick={() => setIsManualModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveManual} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Alimento *</label>
                  <input
                    type="text"
                    required
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="Ej: Pan Cero Cero"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Marca</label>
                  <input
                    type="text"
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    placeholder="Ej: Bimbo"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Porción de Referencia</label>
                <input
                  type="text"
                  value={manualServing}
                  onChange={(e) => setManualServing(e.target.value)}
                  placeholder="Ej: 2 rebanadas (60g)"
                  className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Calorías</label>
                  <input
                    type="number"
                    value={manualCalories}
                    onChange={(e) => setManualCalories(e.target.value)}
                    placeholder="kcal"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-emerald-800 block mb-1">Proteína (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualProtein}
                    onChange={(e) => setManualProtein(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-sky-800 block mb-1">Carbos (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualCarbs}
                    onChange={(e) => setManualCarbs(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-800 block mb-1">Grasa (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFat}
                    onChange={(e) => setManualFat(e.target.value)}
                    placeholder="g"
                    className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Grasa Sat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualSatFat}
                    onChange={(e) => setManualSatFat(e.target.value)}
                    placeholder="g"
                    className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Omega 3 (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualOmega3}
                    onChange={(e) => setManualOmega3(e.target.value)}
                    placeholder="g"
                    className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Sodio (mg)</label>
                  <input
                    type="number"
                    value={manualSodium}
                    onChange={(e) => setManualSodium(e.target.value)}
                    placeholder="mg"
                    className="w-full p-1.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
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
                  Guardar Alimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
