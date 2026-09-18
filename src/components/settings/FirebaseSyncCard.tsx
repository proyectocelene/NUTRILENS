import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  User, 
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  forceSyncAllWithCloud, 
  startRealtimeFirestoreSync,
  signInWithGoogle,
  signOutFromGoogle,
  getCurrentUser,
  onAuthUserChange,
  initFirebase,
  testFirestoreConnection,
  DiagnosticResult,
  onSyncStateChange,
  SyncStateInfo
} from '../../services/firebaseService';

export const FirebaseSyncCard: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isSigning, setIsSigning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [syncInfo, setSyncInfo] = useState<SyncStateInfo>({
    state: 'idle',
    lastError: null,
    lastSuccessTime: null,
    userId: '',
    isGoogleUser: !!getCurrentUser()
  });

  useEffect(() => {
    // Asegurar que cualquier residuo viejo en localStorage sea eliminado
    try {
      const stored = localStorage.getItem('nutrilens_firebase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.projectId !== 'nutrilens-fce87') {
          localStorage.removeItem('nutrilens_firebase_config');
        }
      }
    } catch (e) {
      localStorage.removeItem('nutrilens_firebase_config');
    }

    // Inicializar Firebase
    initFirebase().then(() => {
      const u = getCurrentUser();
      setUser(u);
      if (u) startRealtimeFirestoreSync();
    });

    const unsubAuth = onAuthUserChange((u) => {
      setUser(u);
      if (u) {
        startRealtimeFirestoreSync();
      }
    });

    const unsubSync = onSyncStateChange((info) => {
      setSyncInfo(info);
    });

    return () => {
      unsubAuth();
      unsubSync();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigning(true);
    setSyncStatus(null);
    setDiagnostic(null);
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      setSyncStatus({ type: 'success', message: `¡Bienvenido, ${result.user.displayName}! Sincronización con nutrilens-fce87 activada.` });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
      startRealtimeFirestoreSync();
    } else {
      setSyncStatus({ type: 'error', message: result.error || 'No se pudo iniciar sesión.' });
    }
    setIsSigning(false);
  };

  const handleSignOut = async () => {
    await signOutFromGoogle();
    setSyncStatus({ type: 'success', message: 'Sesión cerrada correctamente.' });
    setDiagnostic(null);
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await forceSyncAllWithCloud();
    setSyncStatus({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
    setIsSyncing(false);
  };

  const handleRunDiagnostic = async () => {
    setIsTesting(true);
    setDiagnostic(null);
    setSyncStatus(null);
    const res = await testFirestoreConnection();
    setDiagnostic(res);
    if (res.success) {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    }
    setIsTesting(false);
  };

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            user && syncInfo.state === 'connected' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : syncInfo.state === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {user ? <Cloud size={20} /> : <CloudOff size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Sincronización en la Nube (Firebase)</h3>
              <Badge 
                variant={
                  user 
                    ? (syncInfo.state === 'connected' ? 'emerald' : 'blue') 
                    : 'amber'
                } 
                size="sm"
              >
                {user 
                  ? (syncInfo.state === 'connected' ? '🟢 En Vivo' : '🟢 Conectado') 
                  : '🔒 Sesión requerida'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              Proyecto: <strong className="font-mono text-slate-700">nutrilens-fce87</strong> • Respaldo en tiempo real con Google
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {user ? (
          /* === USUARIO CON SESIÓN INICIADA === */
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border-2 border-emerald-300 shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
                    <User size={18} className="text-emerald-800" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-emerald-950">{user.displayName || 'Usuario de Google'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  icon={<RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />}
                  className="text-xs"
                >
                  {isSyncing ? 'Sincronizando...' : 'Respaldar Todo Ahora'}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRunDiagnostic}
                  disabled={isTesting}
                  icon={<ShieldCheck size={13} className={isTesting ? 'animate-spin text-amber-600' : 'text-emerald-600'} />}
                  className="text-xs"
                >
                  {isTesting ? 'Comprobando...' : '🔍 Probar Conexión'}
                </Button>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors"
                  title="Cerrar sesión de Google"
                >
                  <LogOut size={13} />
                  <span>Salir</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 size={14} />
                <span>Base de datos vinculada con tu cuenta de Google</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tus comidas, recetas, metas y notas se guardan automáticamente en Cloud Firestore (<code className="font-mono text-[10px] text-slate-700">nutrilens-fce87</code>) y se sincronizan con cualquier otro dispositivo donde inicies sesión.
              </p>
            </div>
          </div>
        ) : (
          /* === SIN SESIÓN INICIADA === */
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck size={16} className="text-blue-600" />
                <span>Todo configurado en nutrilens-fce87</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed max-w-xl">
                Tu proyecto de Firebase está listo. Para proteger la privacidad de tus datos según tus reglas de seguridad (<code className="bg-slate-100 px-1 py-0.5 rounded text-blue-900 font-mono text-[10px]">request.auth != null</code>), solo debes iniciar sesión con tu cuenta de Google para comenzar a sincronizar automáticamente entre tu PC y tu celular.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigning}
              className="flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-sm transition-all shrink-0 self-start sm:self-auto hover:border-slate-400 active:scale-98"
            >
              <svg width="16" height="16" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
              <span>{isSigning ? 'Abriendo Google...' : 'Iniciar Sesión con Google'}</span>
            </button>
          </div>
        )}

        {/* Resultado del Diagnóstico */}
        {diagnostic && (
          <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
            diagnostic.success 
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/90 border-rose-200 text-rose-950'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {diagnostic.success ? (
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-rose-700 shrink-0" />
              )}
              <span>{diagnostic.success ? 'Diagnóstico: Conexión Exitosa' : 'Diagnóstico: Problema Detectado'}</span>
            </div>
            <p className="leading-relaxed pl-6">{diagnostic.message}</p>
            {diagnostic.recommendation && (
              <div className="ml-6 p-2 rounded-xl bg-white/80 border border-current/20 text-[11px] font-medium leading-relaxed">
                💡 <strong>Qué hacer:</strong> {diagnostic.recommendation}
              </div>
            )}
          </div>
        )}

        {/* Mensaje de Estado / Notificación */}
        {syncStatus && (
          <div className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
            syncStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <span>{syncStatus.message}</span>
          </div>
        )}

        {/* Error de sincronización en tiempo real global */}
        {syncInfo.lastError && !diagnostic && user && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <span className="font-bold">Aviso de sincronización: </span>
              <span>{syncInfo.lastError}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
