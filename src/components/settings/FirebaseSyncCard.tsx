import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Settings, CheckCircle2, ShieldCheck, Database } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  isFirebaseConfigured, 
  forceSyncAllWithCloud, 
  getEffectiveUserId, 
  getStoredFirebaseConfig,
  startRealtimeFirestoreSync
} from '../../services/firebaseService';
import { FirebaseConfigModal } from './FirebaseConfigModal';

export const FirebaseSyncCard: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [userId, setUserId] = useState('');

  const refreshState = () => {
    const configured = isFirebaseConfigured();
    setIsConfigured(configured);
    setUserId(getEffectiveUserId());
    if (configured) {
      startRealtimeFirestoreSync();
    }
  };

  useEffect(() => {
    refreshState();
  }, []);

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await forceSyncAllWithCloud();
      setSyncStatus(res.message);
    } catch (e: any) {
      setSyncStatus(`Error: ${e.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const config = getStoredFirebaseConfig();

  return (
    <>
      <Card className="border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-xl border ${isConfigured ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isConfigured ? <Cloud size={18} /> : <CloudOff size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Base de Datos en la Nube (Firebase Cloud Firestore)</h3>
                <Badge variant={isConfigured ? 'emerald' : 'amber'} size="sm">
                  {isConfigured ? 'Conectado' : 'Modo Local'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Sincronización en tiempo real entre múltiples dispositivos con Cloud Firestore</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Settings size={14} />}
            className="text-xs self-start sm:self-auto"
          >
            {isConfigured ? 'Gestionar Conexión' : 'Configurar Firebase'}
          </Button>
        </div>

        {isConfigured ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 size={15} />
                  <span>Sincronización Automática Bidireccional Activa</span>
                </div>
                <p className="text-[11px] text-slate-600 font-mono">
                  Proyecto: <strong className="text-slate-800">{config?.projectId}</strong> • ID Usuario: <strong className="text-slate-800">{userId.slice(0, 16)}...</strong>
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleForceSync}
                disabled={isSyncing}
                icon={<RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />}
                className="text-xs shrink-0"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
              </Button>
            </div>

            {syncStatus && (
              <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                {syncStatus}
              </p>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-800 block">Tus datos están guardados de forma 100% segura en IndexedDB local.</span>
              <p className="text-[11px] text-slate-500">Conecta Firebase para respaldar automáticamente tus comidas en la nube y acceder desde cualquier celular o PC.</p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              icon={<Database size={13} />}
              className="text-xs shrink-0"
            >
              Conectar a la Nube
            </Button>
          </div>
        )}
      </Card>

      <FirebaseConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfigSaved={() => {
          refreshState();
        }}
      />
    </>
  );
};
