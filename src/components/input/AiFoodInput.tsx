import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Camera, 
  Image as ImageIcon, 
  X, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  Zap,
  Calendar,
  Clock,
  Pill
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  analyzeFoodWithAI, 
  createSpeechRecognizer, 
  isSpeechRecognitionSupported, 
  getStoredGeminiApiKey,
  ConversationTurn,
  AiAnalysisResult
} from '../../services/aiNutritionService';
import { Meal } from '../../types/nutrition.types';

interface AiFoodInputProps {
  onFoodAnalyzed: (meal: Meal, rawJson: string) => void;
  onOpenSettings?: () => void;
}

const QUICK_EXAMPLES = [
  { text: '4 huevos revueltos con 135ml de claras líquidas, 80g de avena y 1 plátano', tag: 'Desayuno Top: 52g Proteína • Potasio • Vitamina D' },
  { text: '240g pechuga de pollo a la plancha, 350g arroz jazmín y 70g aguacate Hass', tag: 'Almuerzo: 63g Proteína • Magnesio • Grasas Saludables' },
  { text: 'Salmón al horno (220g) con 200g de batata y ensalada de espinacas baby', tag: 'Cena: 60g Proteína • Omega-3 • Hierro Hemo' },
  { text: 'Batido con 1 scoop whey protein (30g), 1 taza de arándanos, 40g de avena y 5g de creatina', tag: 'Post-Entreno: 38g Proteína • Antioxidantes • Fuerza' },
  { text: '200g de ternera magra con 250g de papas al horno y brócoli al vapor', tag: 'Rico en Hierro & Zinc: 55g Proteína • Vitamina C' },
  { text: 'Bowl de yogur griego natural (250g) con 30g de nueces, semillas de chía y miel', tag: 'Fibra & Calcio: 30g Proteína • Magnesio' },
  { text: 'Atún en agua (2 latas de 140g) con ensalada de quinoa, tomate y aceite de oliva', tag: 'Ultra Magro: 48g Proteína • Vitamina B12' },
  { text: 'Tortilla de 3 huevos con 50g de jamón de pavo, espinacas y 1 taza de fresas', tag: 'Keto/Low-Carb: 36g Proteína • Vitamina C • Folatos' }
];

const SUPPLEMENT_EXAMPLES = [
  '1 cápsula de Vitamina D3 (2,000 UI)',
  '5g de Creatina Monohidratada con agua',
  '1 cápsula de Citrato de Magnesio (400mg)',
  '1 cápsula de Omega 3 (1000mg EPA/DHA)',
  '1 scoop de Proteína Whey Isolate (25g P)',
  '1 tableta de Multivitamínico completo'
];

export const AiFoodInput: React.FC<AiFoodInputProps> = ({ onFoodAnalyzed, onOpenSettings }) => {
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recognizer, setRecognizer] = useState<any>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Fecha y hora del registro
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [targetTime, setTargetTime] = useState<string>(new Date().toTimeString().slice(0, 5));
  
  // Estado de conversación y refinamiento continuo
  const [analysisResult, setAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [followUpText, setFollowUpText] = useState('');
  const [showAllExamples, setShowAllExamples] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHasApiKey(!!getStoredGeminiApiKey());
  }, []);

  const handleStartVoice = () => {
    if (isListening && recognizer) {
      recognizer.stop();
      setIsListening(false);
      return;
    }

    setErrorMessage(null);
    const rec = createSpeechRecognizer(
      (transcript) => {
        setPrompt(transcript);
      },
      (error) => {
        setErrorMessage(error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );

    if (rec) {
      setRecognizer(rec);
      setIsListening(true);
      try {
        rec.start();
      } catch (err) {
        console.warn('Error starting voice recognizer:', err);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage(result);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async (overridePrompt?: string) => {
    const textToSend = overridePrompt !== undefined ? overridePrompt : prompt;
    if (!textToSend.trim() && !selectedImage) return;

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeFoodWithAI(
        textToSend, 
        selectedImage, 
        conversationHistory,
        undefined,
        targetDate,
        targetTime
      );

      if (result.success && result.meal && result.rawJson) {
        setAnalysisResult(result);
        onFoodAnalyzed(result.meal, result.rawJson);

        // Guardar turno en el historial
        const newTurn: ConversationTurn = {
          role: 'user',
          text: textToSend,
          image: selectedImage || undefined
        };
        const modelTurn: ConversationTurn = {
          role: 'model',
          text: result.rawJson
        };
        setConversationHistory(prev => [...prev, newTurn, modelTurn]);
        setFollowUpText('');
      } else {
        setErrorMessage(result.error || 'No se pudo analizar la comida con los modelos disponibles.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error analizando con IA.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFollowUpRefine = (suggestion?: string) => {
    const text = suggestion || followUpText;
    if (!text.trim()) return;

    const fullPrompt = `Ajuste / Clarificación: ${text}. Recalcula y actualiza el desglose nutricional respetando las bases científicas.`;
    setPrompt(fullPrompt);
    handleAnalyze(fullPrompt);
  };

  const handleResetConversation = () => {
    setConversationHistory([]);
    setAnalysisResult(null);
    setPrompt('');
    setSelectedImage(null);
    setFollowUpText('');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-4">
      {/* Selector de Fecha y Hora del Registro */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Calendar size={14} className="text-emerald-700" />
          <span>Fecha y Hora de Ingesta:</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
          />
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-slate-400" />
            <input
              type="time"
              value={targetTime}
              onChange={(e) => setTargetTime(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Input principal de IA */}
      <div className="relative rounded-2xl border-2 border-emerald-500/30 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all bg-white p-3 shadow-xs">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe tu comida o suplemento, o toma una foto del plato...&#10;&#10;Ej: 'Almorcé 200g de pechuga a la plancha, 1 taza de arroz y 1 cápsula de Vitamina D3'"
          rows={3}
          className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed bg-transparent"
        />

        {/* Vista previa de la foto adjunta si existe */}
        {selectedImage && (
          <div className="mb-2 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src={selectedImage} 
                alt="Comida adjunta" 
                className="w-12 h-12 object-cover rounded-lg border border-slate-300 shrink-0" 
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-800 block truncate">Foto del plato lista</span>
                <span className="text-[10px] text-slate-500 block">Gemini analizará visualmente los alimentos y proporciones</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
              title="Quitar foto"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Barra de acciones inferiores del prompt */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-2">
          {/* Botones de captura: Cámara, Galería, Voz */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              ref={cameraInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
              title="Tomar foto con la cámara"
            >
              <Camera size={14} className="text-emerald-700" />
              <span className="hidden xs:inline sm:inline">Cámara</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
              title="Adjuntar foto de la galería"
            >
              <ImageIcon size={14} className="text-sky-700" />
              <span className="hidden xs:inline sm:inline">Foto</span>
            </button>

            {isSpeechRecognitionSupported() && (
              <button
                type="button"
                onClick={handleStartVoice}
                className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-semibold ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
                title={isListening ? 'Detener dictado' : 'Dictar por voz'}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span className="hidden xs:inline sm:inline">
                  {isListening ? 'Escuchando...' : 'Voz'}
                </span>
              </button>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => handleAnalyze()}
            disabled={(!prompt.trim() && !selectedImage) || isAnalyzing}
            icon={isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            className="shadow-md shadow-emerald-600/20 text-xs px-3.5"
          >
            {isAnalyzing ? 'Analizando con IA...' : 'Analizar Alimentos & Suplementos'}
          </Button>
        </div>
      </div>

      {/* Mensaje de error si falla */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium animate-fadeIn">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Retroalimentación Científica del Modelo y Preguntas de Seguimiento */}
      {analysisResult && (
        <div className="space-y-3 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200/80 animate-fadeIn">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-emerald-900 font-bold">
              <Zap size={14} className="text-emerald-700" />
              <span>Verificado con base científica ({analysisResult.modelUsed})</span>
            </div>

            <button
              type="button"
              onClick={handleResetConversation}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw size={12} /> Nueva consulta
            </button>
          </div>

          {analysisResult.nutritionalFeedback && (
            <p className="text-xs text-slate-700 bg-white/80 p-2.5 rounded-xl border border-emerald-100 leading-relaxed font-medium">
              💡 {analysisResult.nutritionalFeedback}
            </p>
          )}

          {/* Preguntas de Seguimiento para Afinar la Comida */}
          {((analysisResult.clarificationQuestions && analysisResult.clarificationQuestions.length > 0) ||
            (analysisResult.quickSuggestions && analysisResult.quickSuggestions.length > 0)) && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <HelpCircle size={14} className="text-amber-600" />
                <span>¿Deseas afinar detalles o micronutrientes específicos?</span>
              </div>

              {analysisResult.clarificationQuestions?.map((q, idx) => (
                <p key={idx} className="text-xs text-slate-600 pl-2 border-l-2 border-amber-400">
                  {q}
                </p>
              ))}

              {analysisResult.quickSuggestions && analysisResult.quickSuggestions.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {analysisResult.quickSuggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnalyzing}
                      onClick={() => handleFollowUpRefine(sug)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100/70 border border-slate-200 hover:border-emerald-300 text-xs font-medium text-slate-700 hover:text-emerald-950 transition-all text-left shadow-2xs flex items-center gap-1"
                    >
                      <Sparkles size={11} className="text-emerald-600" />
                      <span>{sug}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1.5 pt-2">
                <input
                  type="text"
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFollowUpRefine();
                    }
                  }}
                  placeholder="Escribe detalles adicionales (ej: 'El pollo era 300g con 1 cda de aceite')"
                  className="flex-1 text-xs bg-white border border-slate-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleFollowUpRefine()}
                  disabled={!followUpText.trim() || isAnalyzing}
                  icon={<ArrowRight size={13} />}
                  className="text-xs px-2.5 py-1.5"
                >
                  Recalcular
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sugerencias Rápidas Iniciales y Suplementos */}
      {!analysisResult && (
        <div className="space-y-3 pt-1">
          {/* Comidas Clásicas con Nutrientes */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Lightbulb size={13} className="text-amber-600" />
                <span>Ejemplos densos en proteína, hierro, magnesio y fibra:</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllExamples(!showAllExamples)}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
              >
                {showAllExamples ? 'Ver menos' : `Ver más (+${QUICK_EXAMPLES.length - 4} platos)`}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(showAllExamples ? QUICK_EXAMPLES : QUICK_EXAMPLES.slice(0, 4)).map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(ex.text);
                    setErrorMessage(null);
                  }}
                  className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all text-[11px] text-slate-700 group flex items-start gap-2 shadow-2xs"
                >
                  <Sparkles size={12} className="text-emerald-600 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0 flex-1">
                    <span className="line-clamp-2 font-medium">{ex.text}</span>
                    <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                      {ex.tag}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Suplementos y Vitaminas con 1 toque */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
              <Pill size={13} className="text-purple-600" />
              <span>Registrar Suplementación & Vitaminas (1 Toque):</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {SUPPLEMENT_EXAMPLES.map((sup, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPrompt(sup);
                    setErrorMessage(null);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-50/60 hover:bg-purple-100/80 border border-purple-200 text-left transition-all text-[11px] text-purple-900 font-medium flex items-center gap-1.5 shadow-2xs"
                >
                  <Pill size={11} className="text-purple-700" />
                  <span>{sup}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
