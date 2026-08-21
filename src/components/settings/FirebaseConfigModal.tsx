import React, { useState, useEffect } from 'react';
import { Database, Check, AlertCircle, Save, Key, RefreshCw, Cloud, Zap } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { 
  FirebaseConfig, 
  getStoredFirebaseConfig, 
  setStoredFirebaseConfig, 
  initFirebase, 
  forceSyncAllWithCloud 
} from '../../services/firebaseService';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [rawJson, setRawJson] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [appId, setAppId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getStoredFirebaseConfig();
      if (cfg) {
        setApiKey(cfg.apiKey || '');
        setProjectId(cfg.projectId || '');
        setAuthDomain(cfg.authDomain || '');
        setAppId(cfg.appId || '');
        setStorageBucket(cfg.storageBucket || '');
        setMessagingSenderId(cfg.messagingSenderId || '');
      }
      setTestStatus(null);
    }
  }, [isOpen]);

  const handlePasteJsonConfig = (jsonStr: string) => {
    setRawJson(jsonStr);
    try {
      // Intentar extraer el objeto si pegaron firebaseConfig = { ... } o json directo
      let clean = jsonStr.trim();
      if (clean.includes('{') && clean.includes('}')) {
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');
        clean = clean.substring(start, end + 1);
        
        // Manejar posibles claves sin comillas
        const fixed = clean.replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":');
        const parsed = JSON.parse(fixed);

        if (parsed.apiKey) setApiKey(parsed.apiKey);
        if (parsed.projectId) setProjectId(parsed.projectId);
        if (parsed.authDomain) setAuthDomain(parsed.authDomain);
        if (parsed.appId) setAppId(parsed.appId);
        if (parsed.storageBucket) setStorageBucket(parsed.storageBucket);
        if (parsed.messagingSenderId) setMessagingSenderId(parsed.messagingSenderId);
      }
    } catch (e) {
      console.warn('Could not auto-parse JSON config:', e);
    }
  };

  const handleSaveAndTest = async () => {
    if (!apiKey.trim() || !projectId.trim() || !appId.trim()) {
      setTestStatus({
        type: 'error',
        message: 'Por favor completa al menos: API Key, Project ID y App ID.'
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);

    const config: FirebaseConfig = {
      apiKey: apiKey.trim(),
      projectId: projectId.trim(),
      authDomain: authDomain.trim() || `${projectId.trim()}.firebaseapp.com`,
      appId: appId.trim(),
      storageBucket: storageBucket.trim() || `${projectId.trim()}.appspot.com`,
      messagingSenderId: messagingSenderId.trim()
    };

    setStoredFirebaseConfig(config);

    try {
      const ok = await initFirebase();
      if (ok) {
        const syncResult = await forceSyncAllWithCloud();
        setTestStatus({
          type: 'success',
          message: `¡Conectado exitosamente con Firebase Firestore! ${syncResult.message}`
        });

        if (onConfigSaved) onConfigSaved();
      } else {
        setTestStatus({
          type: 'error',
          message: 'No se pudo conectar a Firebase. Revisa que las credenciales sean correctas.'
        });
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: `Error probando conexión: ${err.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    setStoredFirebaseConfig(null);
    setApiKey('');
    setProjectId('');
    setAuthDomain('');
    setAppId('');
    setStorageBucket('');
    setMessagingSenderId('');
    setTestStatus({ type: 'success', message: 'Firebase desconectado. Los datos seguirán guardándose localmente en IndexedDB.' });
    if (onConfigSaved) onConfigSaved();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-100 text-amber-800">
            <Cloud size={18} />
          </div>
          <span>Configurar Firebase Cloud Firestore</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-slate-700 space-y-1">
          <p className="font-bold text-amber-900">¿Cómo conectar tu base de datos de Firebase?</p>
          <p className="leading-relaxed">
            Ve a tu consola de <strong>Firebase Console</strong> → Configuración de Proyecto → Copia el objeto <code>firebaseConfig</code> y pégalo abajo, o rellena los campos manualmente.
          </p>
        </div>

        {/* Pegar JSON rápido */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1">
            Pegar objeto de configuración rápido (opcional):
          </label>
          <textarea
            value={rawJson}
            onChange={(e) => handlePasteJsonConfig(e.target.value)}
            placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "...",\n  appId: "..."\n};`}
            rows={3}
            className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Campos individuales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">API Key *</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Project ID *</label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="nutrilens-app"
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">App ID *</label>
            <input
              type="text"
              value={appId}
              onChange={(e) => setAppId(e.target.value)}
              placeholder="1:123456:web:..."
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Auth Domain</label>
            <input
              type="text"
              value={authDomain}
              onChange={(e) => setAuthDomain(e.target.value)}
              placeholder="project-id.firebaseapp.com"
              className="w-full text-xs font-mono bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Mensaje de estado */}
        {testStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
              testStatus.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            {testStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{testStatus.message}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleDisconnect}
            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
          >
            Desconectar Firebase
          </button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cerrar
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAndTest}
              disabled={isTesting}
              icon={isTesting ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            >
              {isTesting ? 'Conectando...' : 'Guardar y Conectar'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
