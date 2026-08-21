import React, { useState, useRef } from 'react';
import { Camera, Upload, Sparkles, Check, AlertCircle, X, Loader2 } from 'lucide-react';
import { CanonicalFood } from '../../types/nutrition.types';
import { scanNutritionLabelWithAI } from '../../services/aiNutritionService';
import { dbService } from '../../db/dbService';
import { awardXp } from '../../services/gamificationService';

interface LabelScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (food: CanonicalFood) => void;
}

export const LabelScannerModal: React.FC<LabelScannerModalProps> = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedFood, setScannedFood] = useState<CanonicalFood | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setImageSrc(src);
      processImage(src);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (src: string) => {
    setIsScanning(true);
    setError(null);
    setScannedFood(null);

    try {
      const res = await scanNutritionLabelWithAI(src);
      if (res.success && res.food) {
        setScannedFood(res.food);
      } else {
        setError(res.error || 'No se pudo leer la tabla nutrimental. Asegúrate de que los números y texto sean legibles.');
      }
    } catch (err: any) {
      setError(err.message || 'Error analizando la etiqueta.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!scannedFood) return;
    try {
      const id = await dbService.saveCanonicalFood(scannedFood);
      awardXp(50, 'Alimento Canónico Escaneado');
      onSaved({ ...scannedFood, id });
      onClose();
    } catch (err: any) {
      setError('Error guardando alimento en la base de datos.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Camera size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Escáner IA de Tablas Nutricionales</h3>
              <p className="text-xs text-slate-500">Extrae automáticamente porciones, macros y vitaminas de cualquier etiqueta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {!imageSrc ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs mb-3 text-emerald-600">
                <Upload size={32} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-1">Sube o toma foto de la Tabla Nutrimental</h4>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Enfoca claramente la información nutrimental por porción o por 100g del empaque
              </p>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
                >
                  <Camera size={16} /> Tomar Foto o Subir
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview de la foto */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-48 bg-slate-900 flex items-center justify-center">
                <img src={imageSrc} alt="Etiqueta" className="max-h-48 object-contain" />
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setScannedFood(null);
                    setError(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white text-xs hover:bg-black/80 backdrop-blur-md"
                >
                  Cambiar foto
                </button>
              </div>

              {/* Estado cargando */}
              {isScanning && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <Loader2 size={28} className="animate-spin text-emerald-700 mx-auto" />
                  <p className="text-xs font-bold text-emerald-950">Analizando tabla nutrimental con Visión IA...</p>
                  <p className="text-[11px] text-slate-600">Extrayendo tamaño de porción, grasas saturadas, azúcares y micronutrientes</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-800 text-xs">
                  <AlertCircle size={18} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Resultado extraído */}
              {scannedFood && !isScanning && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <input
                        type="text"
                        value={scannedFood.name}
                        onChange={(e) => setScannedFood({ ...scannedFood, name: e.target.value })}
                        className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 w-full"
                        placeholder="Nombre del producto"
                      />
                      <input
                        type="text"
                        value={scannedFood.brand || ''}
                        onChange={(e) => setScannedFood({ ...scannedFood, brand: e.target.value })}
                        className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded-lg border border-slate-200 mt-1 w-full"
                        placeholder="Marca"
                      />
                    </div>
                    <span className="text-xs font-black text-amber-800 font-mono bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 shrink-0 ml-2">
                      {scannedFood.calories} kcal
                    </span>
                  </div>

                  {/* Porción */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Porción:</span>
                    <input
                      type="text"
                      value={scannedFood.servingSize}
                      onChange={(e) => setScannedFood({ ...scannedFood, servingSize: e.target.value })}
                      className="bg-white px-2 py-1 rounded-lg border border-slate-200 font-semibold text-slate-800 flex-1 text-xs"
                    />
                  </div>

                  {/* Macros Grid */}
                  <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200">
                      <span className="text-[10px] text-emerald-800 font-bold block">Proteína</span>
                      <span className="text-xs font-black text-emerald-950 font-mono">{scannedFood.protein}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-sky-100/70 border border-sky-200">
                      <span className="text-[10px] text-sky-800 font-bold block">Carbos</span>
                      <span className="text-xs font-black text-sky-950 font-mono">{scannedFood.carbs}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200">
                      <span className="text-[10px] text-amber-800 font-bold block">Grasas</span>
                      <span className="text-xs font-black text-amber-950 font-mono">{scannedFood.fat}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-teal-100/70 border border-teal-200">
                      <span className="text-[10px] text-teal-800 font-bold block">Fibra</span>
                      <span className="text-xs font-black text-teal-950 font-mono">{scannedFood.fiber}g</span>
                    </div>
                  </div>

                  {/* Desglose de Lípidos y Nutrientes Detectados */}
                  {scannedFood.nutrients && Object.keys(scannedFood.nutrients).length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                        Micronutrientes & Perfil Lipídico Detectado:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(scannedFood.nutrients).map(([key, val]) => (
                          <span key={key} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-mono">
                            {key.replace('_mg', ' mg').replace('_g', ' g').replace('_mcg', ' mcg').replace('_iu', ' UI')}: <strong>{val}</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
          >
            Cancelar
          </button>
          {scannedFood && !isScanning && (
            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check size={16} /> Guardar en Mi Banco Canónico (+50 XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
