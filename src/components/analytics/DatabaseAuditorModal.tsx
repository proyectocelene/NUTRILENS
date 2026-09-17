import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Code, 
  Activity, 
  Sparkles, 
  RefreshCw, 
  Flame, 
  Utensils, 
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { generateFullDatabasePayload, exportDatabaseToJson } from '../../services/backupService';
import { ExportDataPayload, DatabaseAuditDiagnostic } from '../../types/db.types';

interface DatabaseAuditorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseAuditorModal: React.FC<DatabaseAuditorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'json' | 'issues'>('summary');
  const [auditData, setAuditData] = useState<{ payload: ExportDataPayload; diagnostic: DatabaseAuditDiagnostic } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonSearchQuery, setJsonSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'warning' | 'error' | 'info'>('all');

  const runAudit = async () => {
    setIsLoading(true);
    try {
      const data = await generateFullDatabasePayload();
      setAuditData(data);
    } catch (err) {
      console.error('Error ejecutando auditoría:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runAudit();
    }
  }, [isOpen]);

  const handleDownload = async () => {
    try {
      await exportDatabaseToJson();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyJson = () => {
    if (!auditData) return;
    navigator.clipboard.writeText(JSON.stringify(auditData.payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2200);
  };

  if (!isOpen) return null;

  const diag = auditData?.diagnostic;
  const payload = auditData?.payload;

  const filteredIssues = diag?.issuesList.filter(issue => {
    if (filterSeverity === 'all') return true;
    return issue.type === filterSeverity;
  }) || [];

  const rawJsonString = payload ? JSON.stringify(payload, null, 2) : '';
  const filteredJsonString = jsonSearchQuery
    ? rawJsonString.split('\n').filter(line => line.toLowerCase().includes(jsonSearchQuery.toLowerCase())).join('\n')
    : rawJsonString;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Database size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-base sm:text-lg">Auditoría & Exportador Global de la Base de Datos</span>
              <Badge variant="purple" size="sm">JSON v2 Integral</Badge>
            </div>
            <span className="text-xs text-slate-500 font-normal block">
              Inspección de integridad matemática, bioquímica, Atwater, comidas, recetas y banco canónico.
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Selector de Pestañas del Auditor */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'summary'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-2 ring-indigo-500/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={14} className={activeTab === 'summary' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Resumen Diagnóstico</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('issues')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'issues'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-2 ring-indigo-500/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlertTriangle size={14} className={diag && diag.issuesList.length > 0 ? 'text-amber-500' : 'text-slate-400'} />
            <span>Alertas Bioquímicas ({diag?.issuesList.length || 0})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'json'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 ring-2 ring-indigo-500/10'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code size={14} className={activeTab === 'json' ? 'text-indigo-600' : 'text-slate-400'} />
            <span>Visor JSON Completo</span>
          </button>
        </div>

        {/* PESTAÑA 1: RESUMEN DIAGNÓSTICO */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Tarjeta de Puntuación de Integridad */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                  Índice de Salud de la Base de Datos
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl font-black font-mono text-emerald-400">
                    {diag?.integrityScorePct || 100}%
                  </span>
                  <span className="text-xs text-slate-300 max-w-xs">
                    {diag && diag.integrityScorePct >= 90
                      ? 'Base de datos altamente consistente. Fórmulas Atwater y perfiles lipídicos coherentes.'
                      : 'Se detectaron alimentos o comidas con ligeras discrepancias calóricas o lípidos sin desglosar.'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={runAudit}
                  disabled={isLoading}
                  icon={<RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />}
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
                >
                  Re-auditar
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleDownload}
                  icon={<Download size={14} />}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
                >
                  Descargar JSON
                </Button>
              </div>
            </div>

            {/* Grid de Conteos de Entidades */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Comidas</span>
                <span className="text-lg font-black text-slate-900 font-mono">{diag?.mealsCount || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Ingredientes</span>
                <span className="text-lg font-black text-slate-900 font-mono">{diag?.individualFoodsCount || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Canónicos</span>
                <span className="text-lg font-black text-emerald-700 font-mono">{diag?.canonicalFoodsCount || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Aprendidos</span>
                <span className="text-lg font-black text-indigo-700 font-mono">{diag?.learnedFoodsCount || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Recetario</span>
                <span className="text-lg font-black text-slate-900 font-mono">{diag?.recipesCount || 0}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-bold block">Bitácoras</span>
                <span className="text-lg font-black text-purple-700 font-mono">{diag?.dailyLogsCount || 0}</span>
              </div>
            </div>

            {/* Explicación Científica del Auditor */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-indigo-600" />
                <span>¿Qué audita esta herramienta en tu base de datos?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 leading-relaxed pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-0.5">📐 Fórmula Atwater ($4P + 4C + 9G$)</span>
                  <span>Verifica que las calorías calculadas a partir de macronutrientes coincidan matemáticamente con las calorías declaradas.</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                  <span className="font-bold text-slate-900 block mb-0.5">🥑 Coherencia de Ácidos Grasos</span>
                  <span>Comprueba que los alimentos con grasa tengan desglosados sus ácidos grasos saturados, monoinsaturados y poliinsaturados.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: LISTA DE ALERTAS BIOQUÍMICAS */}
        {activeTab === 'issues' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-700">
                {diag?.issuesList.length === 0
                  ? '🎉 No se encontraron inconsistencias bioquímicas ni matemáticas.'
                  : `${diag?.issuesList.length} observación(es) en la base de datos:`}
              </span>

              <div className="flex items-center gap-1 text-xs">
                {(['all', 'warning', 'error', 'info'] as const).map(sev => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setFilterSeverity(sev)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                      filterSeverity === sev
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sev === 'all' ? 'Todos' : sev === 'warning' ? 'Advertencias' : sev === 'error' ? 'Errores' : 'Info'}
                  </button>
                ))}
              </div>
            </div>

            {filteredIssues.length === 0 ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-950">¡Base de datos matemáticamente perfecta!</h4>
                <p className="text-xs text-emerald-800">
                  Todos tus alimentos canónicos y comidas cumplen con los balances calóricos y perfiles lipídicos.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                {filteredIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                      issue.type === 'error'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : issue.type === 'warning'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        {issue.type === 'error' ? (
                          <AlertTriangle size={14} className="text-rose-600" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-600" />
                        )}
                        <span>{issue.title}</span>
                      </div>
                      <Badge variant={issue.type === 'error' ? 'rose' : 'amber'} size="sm">
                        {issue.entityType}
                      </Badge>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">{issue.description}</p>
                    {(issue.expected || issue.actual) && (
                      <div className="flex items-center gap-3 text-[10px] font-mono pt-1">
                        {issue.expected && <span>Esperado: <strong>{issue.expected}</strong></span>}
                        {issue.actual && <span>Actual: <strong className="text-rose-700">{issue.actual}</strong></span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 3: VISOR JSON COMPLETO */}
        {activeTab === 'json' && (
          <div className="space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar en el JSON (ej: 'Pan', 'Almendras', '2026-09')..."
                  value={jsonSearchQuery}
                  onChange={(e) => setJsonSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyJson}
                icon={copiedJson ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                className="text-xs shrink-0"
              >
                {copiedJson ? '¡Copiado!' : 'Copiar Todo el JSON'}
              </Button>
            </div>

            <div className="relative">
              <pre className="w-full h-80 overflow-auto bg-slate-950 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono border border-slate-800 custom-scrollbar leading-relaxed selection:bg-emerald-900">
                {filteredJsonString}
              </pre>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>{payload?.meals.length || 0} comidas | {payload?.canonicalFoods?.length || 0} canónicos | {payload?.recipes.length || 0} recetas</span>
              <span>Tamaño aproximado: ~{(rawJsonString.length / 1024).toFixed(1)} KB</span>
            </div>
          </div>
        )}

        {/* Pie del Modal con Acciones */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div className="text-[11px] text-slate-500">
            Exportación completa con bitácora, configuración y banco canónico.
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleCopyJson}
              icon={copiedJson ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              className="text-xs"
            >
              {copiedJson ? '¡JSON Copiado!' : 'Copiar JSON'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="button"
              onClick={handleDownload}
              icon={<Download size={14} />}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs shadow-indigo-600/20"
            >
              Descargar Backup JSON
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
