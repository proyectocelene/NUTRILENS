import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  ChefHat, 
  Copy, 
  Check, 
  Sparkles, 
  ExternalLink, 
  Clock, 
  Dumbbell, 
  Utensils, 
  Eye, 
  MessageSquareQuote,
  Flame,
  Wheat,
  Droplets
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DailyNutritionSummary, NutritionGoals } from '../../types/nutrition.types';
import { buildChefRecommendationPrompt } from '../../services/chefPromptGenerator';

interface ChefPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailySummary: DailyNutritionSummary;
  goals: NutritionGoals;
}

export const ChefPromptModal: React.FC<ChefPromptModalProps> = ({
  isOpen,
  onClose,
  dailySummary,
  goals
}) => {
  const [cravings, setCravings] = useState('');
  const [nextMealType, setNextMealType] = useState('cena');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const currentTime = new Date().toTimeString().slice(0, 5);

  const remCalories = Math.max(0, goals.calories - dailySummary.totalCalories);
  const remProtein = Math.max(0, Math.round((goals.protein - dailySummary.totalProtein) * 10) / 10);
  const remCarbs = Math.max(0, Math.round((goals.carbs - dailySummary.totalCarbs) * 10) / 10);
  const remFat = Math.max(0, Math.round((goals.fat - dailySummary.totalFat) * 10) / 10);

  const fullPrompt = useMemo(() => {
    return buildChefRecommendationPrompt({
      dailySummary,
      goals,
      currentTime,
      userCravingsOrFridge: cravings,
      nextMealType
    });
  }, [dailySummary, goals, currentTime, cravings, nextMealType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopied(true);

      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#F59E0B', '#6366F1']
      });

      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
            <ChefHat size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              ¿Qué comer ahora? • Prompt de Chef & Nutricionista
            </h3>
            <p className="text-[11px] text-slate-500 font-normal">
              Genera la consulta científica exacta con tu bitácora de hoy para ChatGPT o Claude
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Resumen de Macros Restantes Hoy */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Clock size={12} className="text-amber-400" /> Hora: {currentTime} • Déficit exacto para cerrar el día:
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
              Protocolo Adonis
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">Calorías</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-400">~{remCalories}</span>
              <span className="text-[9px] text-slate-500 block">kcal</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">Proteína</span>
              <span className="text-sm sm:text-base font-extrabold text-emerald-400">~{remProtein}g</span>
              <span className="text-[9px] text-slate-500 block">restante</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">Carbos</span>
              <span className="text-sm sm:text-base font-extrabold text-sky-400">~{remCarbs}g</span>
              <span className="text-[9px] text-slate-500 block">restante</span>
            </div>
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              <span className="text-[10px] text-slate-400 block font-sans">Grasas</span>
              <span className="text-sm sm:text-base font-extrabold text-amber-300">~{remFat}g</span>
              <span className="text-[9px] text-slate-500 block">restante</span>
            </div>
          </div>
        </div>

        {/* Parámetros de Personalización */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Momento de la comida:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'desayuno', label: 'Desayuno', icon: '🍳' },
                { id: 'comida', label: 'Comida', icon: '🥗' },
                { id: 'cena', label: 'Cena', icon: '🐟' },
                { id: 'snack', label: 'Snack', icon: '🍎' }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setNextMealType(t.id)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    nextMealType === t.id
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              ¿Tienes ingredientes a mano o algún antojo? <span className="text-slate-400 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              value={cravings}
              onChange={(e) => setCravings(e.target.value)}
              placeholder="Ej: Tengo pechuga de pollo, huevos, aguacate y 10 minutos para cocinar"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* Botón Principal de Copiado */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleCopy}
            className="w-full justify-center py-3 text-sm font-extrabold shadow-sm active:scale-[0.99] transition-all"
            icon={copied ? <Check size={18} className="text-emerald-200" /> : <Copy size={18} />}
          >
            {copied ? '¡Prompt Copiado al Portapapeles!' : 'Copiar Prompt con mi Bitácora de Hoy'}
          </Button>
          {copied && (
            <p className="text-center text-xs font-bold text-emerald-700 mt-2 animate-fadeIn">
              ✅ ¡Listo! Pégalo directamente en ChatGPT, Claude o Gemini. Te dará opciones deliciosas y el bloque JSON para NUTRILENS.
            </p>
          )}
        </div>

        {/* Enlaces Rápidos a IAs Populares */}
        <div className="pt-2 border-t border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 block mb-2 text-center sm:text-left">
            Pégalo con un clic en tu IA favorita:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <a
              href="https://chatgpt.com"
              target="_blank"
              rel="noreferrer"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition-colors"
            >
              <span>ChatGPT</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://claude.ai"
              target="_blank"
              rel="noreferrer"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors"
            >
              <span>Claude</span>
              <ExternalLink size={12} />
            </a>
            <a
              href="https://gemini.google.com"
              target="_blank"
              rel="noreferrer"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200 text-xs font-bold transition-colors"
            >
              <span>Gemini</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Vista previa desplegable del texto del prompt */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors mx-auto"
          >
            <Eye size={12} /> {showPreview ? 'Ocultar texto completo del prompt' : 'Ver texto completo que se copiará'}
          </button>

          {showPreview && (
            <div className="mt-2 p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl max-h-60 overflow-y-auto leading-relaxed select-all whitespace-pre-wrap">
              {fullPrompt}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
