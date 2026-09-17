import React from 'react';
import { Utensils, Hand, Eye, CheckCircle2, Flame, Award, Heart, Sparkles } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';

interface VisualPortionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualPortionGuideModal: React.FC<VisualPortionGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Eye size={18} />
          </div>
          <span>Guía Visual de Raciones y Platos por Momento del Día</span>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Método de la Mano para Estimar Porciones sin Báscula */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
            <Hand size={16} className="text-emerald-700" />
            <span>Método Práctico de la Mano (Para comer fuera de casa o sin báscula):</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-lg block mb-1">✋</span>
              <span className="font-bold text-slate-800 block">Palma de la Mano</span>
              <span className="text-[11px] text-emerald-800 font-medium">Proteína Magra</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">~150g - 200g (35-45g P)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-lg block mb-1">✊</span>
              <span className="font-bold text-slate-800 block">Puño Cerrado</span>
              <span className="text-[11px] text-sky-800 font-medium">Carbohidratos</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">~1 taza arroz/avena (40-50g C)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-lg block mb-1">👐</span>
              <span className="font-bold text-slate-800 block">Dos Manos Juntas</span>
              <span className="text-[11px] text-emerald-800 font-medium">Vegetales & Ensalada</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">~150g - 200g libres (Fibra/Micros)</span>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-emerald-100 shadow-2xs">
              <span className="text-lg block mb-1">👍</span>
              <span className="font-bold text-slate-800 block">Dedo Pulgar</span>
              <span className="text-[11px] text-amber-800 font-medium">Grasas Saludables</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">1 cda aceite o 1/2 aguacate</span>
            </div>
          </div>
        </div>

        {/* Estructura Ideal de las 3 Comidas Principales */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Distribución Visual Recomendada en tu Plan de 1,950 kcal (Protocolo Adonis):
          </h4>

          {/* 1. Desayuno */}
          <div className="p-3.5 rounded-2xl bg-white border border-amber-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥤</span>
                <h5 className="text-xs font-bold text-slate-900">Desayuno Anabólico Rápido (~385 kcal)</h5>
              </div>
              <Badge variant="amber" size="sm">48g P • 36g C • 5g F</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Plato:</strong> 1 scoop Bulk Power Whey (Vanilla S'mores) + 350ml Leche Alpura Pro (alta proteína deslactosada) + 1 plátano mediano (100g pulpa).
            </p>
            <div className="flex items-center gap-1 text-[10px] text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
              <Sparkles size={11} />
              <span>Satura el umbral de leucina (&gt;3.2g) activando mTORC1 sin distensión previa a consulta médica.</span>
            </div>
          </div>

          {/* 2. Almuerzo */}
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥗</span>
                <h5 className="text-xs font-bold text-slate-900">Almuerzo Post-Gym Máxima Densidad (~744 kcal)</h5>
              </div>
              <Badge variant="emerald" size="sm">71g P • 89g C • 13g F</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Plato:</strong> 120g Pechuga de pollo asada en Air Fryer + 1 lata Atún Dolores en agua (100g drenado) + 160g arroz jazmín cocido (1 taza) + 2 rebanadas Pan Bimbo Cero Cero + 35g aguacate (1/4 pza) + ensalada verde al gusto con limón y sal.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
              <Sparkles size={11} />
              <span>Pico de síntesis proteica, 12g de fibra, recarga de glucógeno y saciedad prolongada para estudio ENARM.</span>
            </div>
          </div>

          {/* 3. Cena */}
          <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🥣</span>
                <h5 className="text-xs font-bold text-slate-900">Cena Reparadora SNC & Caseína Lenta (~426 kcal)</h5>
              </div>
              <Badge variant="blue" size="sm">30g P • 42g C • 16g F</Badge>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong>Plato:</strong> 170g Yogur Griego Fage 0% o Chobani Zero + 30g copos de avena + 15g mantequilla de maní natural (1 cda) + 10g almendras picadas + 1 rebanada Pan Bimbo Cero Cero tostada con canela.
            </p>
            <div className="flex items-center gap-1 text-[10px] text-blue-900 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
              <Sparkles size={11} />
              <span>Caseína micelar sostenida (6-7h), triptófano anti-antojos quetiapina, magnesio y vitamina E dérmica.</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
