import React, { useState } from 'react';
import { Copy, Check, FileCode, Sparkles, HelpCircle, Info, Bot, Terminal, Layers } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { MASTER_AI_NUTRITION_PROMPT, JSON_BLANK_SCHEMA_TEMPLATE, SAMPLE_JSON_TEMPLATES } from '../../db/seedData';

interface SchemaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectJsonToEdit?: (jsonStr: string) => void;
}

export const SchemaGuideModal: React.FC<SchemaGuideModalProps> = ({
  isOpen,
  onClose,
  onSelectJsonToEdit
}) => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'json'>('prompt');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedBlank, setCopiedBlank] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(MASTER_AI_NUTRITION_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyBlank = () => {
    navigator.clipboard.writeText(JSON_BLANK_SCHEMA_TEMPLATE);
    setCopiedBlank(true);
    setTimeout(() => setCopiedBlank(false), 2000);
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_JSON_TEMPLATES[0].json);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleOpenInEditor = (json: string) => {
    if (onSelectJsonToEdit) {
      onSelectJsonToEdit(json);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Bot size={20} />
          </div>
          <span>Prompt y Formato JSON de 24 Nutrientes para IA</span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Banner Explicativo */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-3">
          <Info size={18} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-bold text-emerald-950">¿Cómo usarlo con ChatGPT, Claude o DeepSeek?</p>
            <p className="text-[11px] leading-relaxed text-slate-600">
              Copia el <strong>Prompt Maestro</strong>, escribe tu comida donde indica el texto y pégaselo a cualquier IA. Te responderá con el JSON exacto de los <strong>24 nutrientes y lípidos</strong>, listo para pegarlo aquí con 1 clic.
            </p>
          </div>
        </div>

        {/* 3 Opciones de Copia */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Opción 1: Prompt Maestro para IA */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Bot size={15} className="text-indigo-700" />
                <span className="text-xs font-black text-indigo-950">Prompt para IA</span>
              </div>
              <p className="text-[10px] text-slate-600 mb-3">
                Instrucción lista para ChatGPT / Claude que exige los 24 nutrientes.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopyPrompt}
              icon={copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
              className="w-full text-xs shadow-xs"
            >
              {copiedPrompt ? '¡Copiado!' : 'Copiar Prompt'}
            </Button>
          </div>

          {/* Opción 2: Plantilla JSON 24 Nutrientes */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <FileCode size={15} className="text-slate-700" />
                <span className="text-xs font-black text-slate-900">Plantilla JSON</span>
              </div>
              <p className="text-[10px] text-slate-600 mb-3">
                Estructura con los 24 campos (lípidos, vitaminas, minerales).
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyBlank}
              icon={copiedBlank ? <Check size={13} /> : <Copy size={13} />}
              className="w-full text-xs"
            >
              {copiedBlank ? '¡Copiado!' : 'Copiar JSON'}
            </Button>
          </div>

          {/* Opción 3: Ejemplo Relleno */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Sparkles size={15} className="text-amber-600" />
                <span className="text-xs font-black text-slate-900">Ejemplo Real</span>
              </div>
              <p className="text-[10px] text-slate-600 mb-3">
                Desayuno post-entreno completo con macros y micros calculados.
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopySample}
                icon={copiedSample ? <Check size={13} /> : <Copy size={13} />}
                className="flex-1 text-xs"
              >
                {copiedSample ? '¡Listo!' : 'Copiar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenInEditor(SAMPLE_JSON_TEMPLATES[0].json)}
                className="text-xs"
              >
                Cargar
              </Button>
            </div>
          </div>
        </div>

        {/* Selector de Pestañas del Visor */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'prompt'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              🤖 Prompt Maestro para IA Externa
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'json'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              📄 Esquema JSON (24 Nutrientes)
            </button>
          </div>
          <Badge variant={activeTab === 'prompt' ? 'purple' : 'emerald'} size="sm">
            {activeTab === 'prompt' ? 'ChatGPT / Claude' : 'Matriz Bioquímica'}
          </Badge>
        </div>

        {/* Visor de Código / Texto */}
        <div className="relative">
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-72 custom-scrollbar border border-slate-800 leading-relaxed">
            <pre>{activeTab === 'prompt' ? MASTER_AI_NUTRITION_PROMPT : JSON_BLANK_SCHEMA_TEMPLATE}</pre>
          </div>
          <button
            onClick={activeTab === 'prompt' ? handleCopyPrompt : handleCopyBlank}
            className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold backdrop-blur-md border border-white/20 transition-all flex items-center gap-1"
          >
            <Copy size={12} /> Copiar
          </button>
        </div>

        {/* Desglose de los 24 Nutrientes Incluidos */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
          <span className="text-[11px] font-bold text-slate-800 block">
            Matriz de los 24 Nutrientes Soportados en el Esquema:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-slate-600">
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">🫒 Lípidos (7):</strong>
              omega3_g, saturated_fat_g, monounsaturated_fat_g, polyunsaturated_fat_g, trans_fat_g, cholesterol_mg, choline_mg
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">🍊 Vitaminas (8):</strong>
              vitamin_c_mg, vitamin_d_iu, vitamin_a_mcg, vitamin_b12_mcg, folate_mcg, vitamin_e_mg, vitamin_k_mcg, vitamin_b6_mg
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <strong className="text-slate-900 block mb-1">⚡ Minerales & Otros (9):</strong>
              iron_mg, magnesium_mg, potassium_mg, calcium_mg, zinc_mg, sodium_mg, phosphorus_mg, selenium_mcg, sugar_g
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Entendido, cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
