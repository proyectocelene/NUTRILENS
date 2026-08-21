import React, { useState } from 'react';
import { Clipboard, Wand2, Trash2, AlertCircle, CheckCircle2, FileCode, Check } from 'lucide-react';
import { Button } from '../common/Button';
import { JSON_BLANK_SCHEMA_TEMPLATE } from '../../db/seedData';

interface JsonEditorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
  isValid?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  error,
  isValid = true
}) => {
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text);
      }
    } catch (err) {
      console.warn('Clipboard read permission denied or not supported', err);
    }
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(JSON_BLANK_SCHEMA_TEMPLATE);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch (err) {
      // Ignorar si el JSON no es parseable directamente
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {/* Barra de herramientas del editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">Editor JSON</span>
          {value.trim() && (
            isValid ? (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 size={11} /> Válido
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] text-rose-800 font-semibold bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                <AlertCircle size={11} /> Revisar formato
              </span>
            )
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 self-end sm:self-auto w-full sm:w-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyTemplate}
            icon={copiedTemplate ? <Check size={13} className="text-emerald-600" /> : <FileCode size={13} className="text-emerald-700" />}
            className="text-xs py-1.5 px-2.5"
            title="Copiar plantilla vacía JSON con todos los micronutrientes"
          >
            {copiedTemplate ? '¡Plantilla Copiada!' : 'Copiar Formato'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handlePasteClipboard}
            icon={<Clipboard size={13} />}
            className="text-xs py-1.5 px-2.5"
          >
            Pegar
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleFormat}
            disabled={!value.trim()}
            icon={<Wand2 size={13} />}
            className="text-xs py-1.5 px-2.5"
          >
            Formatear
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={!value.trim()}
            icon={<Trash2 size={13} />}
            className="text-xs py-1.5 px-2"
            title="Limpiar texto"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Textarea con estilo código de alto contraste */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-slate-900 shadow-inner">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Pega aquí tu JSON de comida...\n\nEjemplo:\n{\n  "name": "Comida de Recomposición",\n  "foods": [\n    {\n      "name": "Pechuga de Pollo",\n      "calories": 300,\n      "protein": 50,\n      "carbs": 0,\n      "fat": 6\n    }\n  ]\n}`}
          rows={10}
          className="w-full bg-transparent text-emerald-300 font-mono text-xs p-4 focus:outline-none resize-y selection:bg-emerald-500 selection:text-black leading-relaxed"
          spellCheck={false}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
