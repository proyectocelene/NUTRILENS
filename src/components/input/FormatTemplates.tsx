import React from 'react';
import { Sparkles, FileCode } from 'lucide-react';
import { SAMPLE_JSON_TEMPLATES } from '../../db/seedData';

interface FormatTemplatesProps {
  onSelectTemplate: (jsonString: string) => void;
}

export const FormatTemplates: React.FC<FormatTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
        <Sparkles size={14} className="text-emerald-700" />
        <span>Plantillas y Menús del Plan de Recomposición</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SAMPLE_JSON_TEMPLATES.map((tmpl) => (
          <button
            key={tmpl.id}
            type="button"
            onClick={() => onSelectTemplate(tmpl.json)}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 text-left transition-all group flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors block">
                {tmpl.title}
              </span>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                {tmpl.description}
              </p>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
              <FileCode size={12} /> Cargar en el editor
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
