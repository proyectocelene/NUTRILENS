import React, { useRef, useState } from 'react';
import { Download, Upload, Database, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { exportDatabaseToJson, importDatabaseFromJson } from '../../services/backupService';

export const BackupManager: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    try {
      setIsProcessing(true);
      await exportDatabaseToJson();
      setStatusMessage({ type: 'success', text: 'Copia de seguridad descargada exitosamente en formato JSON.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error exportando datos.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      const text = await file.text();
      const result = await importDatabaseFromJson(text);
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Error leyendo archivo: ${err.message}` });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-slate-200 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
          <Database size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Persistencia y Respaldos (IndexedDB)</h3>
          <p className="text-xs text-slate-500">Tus datos se guardan de forma permanente en tu dispositivo y nunca se borran</p>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 mb-4 flex items-start gap-3">
        <ShieldCheck size={20} className="text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <p className="font-bold text-emerald-900">Almacenamiento Local Seguro Offline-First</p>
          <p className="text-slate-600 leading-relaxed">
            NutriLens utiliza IndexedDB para persistir todo el historial de comidas, recetas y metas en el navegador. Además, puedes descargar un archivo de respaldo en cualquier momento para transferirlo a otros dispositivos.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl mb-4 text-xs flex items-center gap-2 font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Exportar Base de Datos</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Descarga un archivo .json con todas tus comidas, banco de recetas y configuración actual.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExport}
            disabled={isProcessing}
            icon={<Download size={14} />}
          >
            Descargar Backup JSON
          </Button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-1">Importar o Restaurar Backup</h4>
            <p className="text-[11px] text-slate-500 mb-3">
              Carga un archivo de respaldo previo para restaurar todas tus comidas y recetas.
            </p>
          </div>
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              icon={<Upload size={14} />}
              className="w-full"
            >
              Seleccionar Archivo JSON
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
