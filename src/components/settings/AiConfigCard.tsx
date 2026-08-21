import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, Save, ExternalLink, ShieldCheck, Zap, Layers, Cpu } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  getStoredGeminiApiKey, 
  setStoredGeminiApiKey, 
  getStoredGeminiModel, 
  setStoredGeminiModel,
  getStoredDeepSeekApiKey,
  setStoredDeepSeekApiKey,
  getStoredDeepSeekModel,
  setStoredDeepSeekModel,
  getStoredAiProvider,
  setStoredAiProvider,
  DEEPSEEK_FALLBACK_CHAIN,
  GEMINI_FALLBACK_CHAIN
} from '../../services/aiNutritionService';

export const AiConfigCard: React.FC = () => {
  const [geminiKey, setGeminiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash-lite');
  const [deepSeekKey, setDeepSeekKey] = useState('');
  const [deepSeekModel, setDeepSeekModel] = useState('deepseek-v4-pro');
  const [provider, setProvider] = useState<'hybrid' | 'deepseek' | 'gemini'>('hybrid');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setGeminiKey(getStoredGeminiApiKey());
    setGeminiModel(getStoredGeminiModel());
    setDeepSeekKey(getStoredDeepSeekApiKey());
    setDeepSeekModel(getStoredDeepSeekModel());
    setProvider(getStoredAiProvider());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredGeminiApiKey(geminiKey);
    setStoredGeminiModel(geminiModel);
    setStoredDeepSeekApiKey(deepSeekKey);
    setStoredDeepSeekModel(deepSeekModel);
    setStoredAiProvider(provider);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Motores de Inteligencia Artificial (DeepSeek V4 & Gemini)</h3>
              <Badge variant="emerald" size="sm">Multi-Motor Híbrido</Badge>
            </div>
            <p className="text-xs text-slate-500">Razonamiento bioquímico con DeepSeek V4 Pro (~300ms) y visión multimodal con Gemini</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Selector de Modo de Operación */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            Modo de Funcionamiento IA:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { 
                id: 'hybrid', 
                title: '🚀 Híbrido Inteligente (Recomendado)', 
                desc: 'DeepSeek V4 Pro para texto (~300ms) + Gemini para fotos' 
              },
              { 
                id: 'deepseek', 
                title: '⚡ Solo DeepSeek V4', 
                desc: 'Máxima velocidad y razonamiento para texto' 
              },
              { 
                id: 'gemini', 
                title: '🤖 Solo Gemini', 
                desc: 'Google AI Studio para texto y fotos' 
              }
            ].map((mode) => (
              <button
                type="button"
                key={mode.id}
                onClick={() => setProvider(mode.id as any)}
                className={`p-3 rounded-xl text-left border transition-all ${
                  provider === mode.id
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                    : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                }`}
              >
                <span className="text-xs font-bold text-slate-900 block">{mode.title}</span>
                <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuración DeepSeek V4 */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-950">DeepSeek AI (Texto & Razonamiento V4)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Cuenta de Pago Activa ✓
              </span>
            </div>
            <a
              href="https://platform.deepseek.com/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1"
            >
              <span>Platform</span> <ExternalLink size={11} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                DeepSeek API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={deepSeekKey}
                  onChange={(e) => setDeepSeekKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Modelo DeepSeek
              </label>
              <select
                value={deepSeekModel}
                onChange={(e) => setDeepSeekModel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-indigo-500"
              >
                <option value="deepseek-v4-pro">DeepSeek V4 Pro (~300ms - Flagship)</option>
                <option value="deepseek-v4-flash">DeepSeek V4 Flash</option>
                <option value="deepseek-chat">DeepSeek Chat (V3)</option>
                <option value="deepseek-reasoner">DeepSeek Reasoner (R1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuración Google Gemini */}
        <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-950">Google Gemini (Visión Multimodal & Fotos)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                Visión de Platos & Etiquetas ✓
              </span>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
            >
              <span>Google AI Studio</span> <ExternalLink size={11} />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Gemini API Key (AI Studio)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AQ... o AIzaSy..."
                  className="w-full bg-white border border-slate-300 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                />
                <Key size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                Modelo Gemini
              </label>
              <select
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-purple-500"
              >
                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Ultra Rápido)</option>
                <option value="gemini-flash-latest">Gemini Flash Latest</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[11px] text-slate-600">
            <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
            <span>Tus claves se cifran y guardan exclusivamente en tu navegador de forma 100% privada.</span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {savedSuccess && (
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <Check size={14} /> ¡Configuración Guardada!
              </span>
            )}
            <Button variant="primary" size="sm" type="submit" icon={<Save size={14} />}>
              Guardar Configuración IA
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
