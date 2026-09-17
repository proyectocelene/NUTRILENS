import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, CheckCircle2, LogIn, LogOut, User } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  isFirebaseConfigured, 
  forceSyncAllWithCloud, 
  startRealtimeFirestoreSync,
  signInWithGoogle,
  signOutFromGoogle,
  getCurrentUser,
  onAuthUserChange,
  initFirebase
} from '../../services/firebaseService';

export const FirebaseSyncCard: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isSigning, setIsSigning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [syncState, setSyncState] = useState<'connected' | 'syncing' | 'error' | 'idle'>('idle');

  useEffect(() => {
    // Inicializar Firebase al montar (restaura sesión guardada automáticamente)
    initFirebase().then(() => {
      const u = getCurrentUser();
      setUser(u);
      if (u) startRealtimeFirestoreSync(setSyncState);
    });

    // Escuchar cambios de sesión
    const unsub = onAuthUserChange((u) => {
      setUser(u);
      if (u) {
        startRealtimeFirestoreSync(setSyncState);
      } else {
        setSyncState('idle');
      }
    });

    return () => unsub();
  }, []);

  const handleGoogleSignIn = async () => {
    setIsSigning(true);
    setSyncStatus(null);
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      // La sincronización inicia automáticamente vía onAuthUserChange
      setSyncStatus({ type: 'success', message: `¡Bienvenido, ${result.user.displayName}! Sincronización activada.` });
    } else {
      setSyncStatus({ type: 'error', message: result.error || 'No se pudo iniciar sesión.' });
    }
    setIsSigning(false);
  };

  const handleSignOut = async () => {
    await signOutFromGoogle();
    setSyncStatus(null);
    setSyncState('idle');
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await forceSyncAllWithCloud();
    setSyncStatus({ type: res.success ? 'success' : 'error', message: res.message });
    setIsSyncing(false);
  };

  const isConfigured = isFirebaseConfigured();

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-xl border ${user ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {user ? <Cloud size={18} /> : <CloudOff size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Sincronización en la Nube</h3>
              <Badge variant={user ? 'emerald' : 'amber'} size="sm">
                {user ? (syncState === 'connected' ? '🟢 En Vivo' : '⏳ Conectando...') : 'Sin sesión'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500">
              {user 
                ? `Datos de ${user.displayName || user.email} sincronizados en todos tus dispositivos`
                : 'Inicia sesión con Google para sincronizar entre dispositivos'}
            </p>
          </div>
        </div>
      </div>

      {user ? (
        /* === SESIÓN ACTIVA === */
        <div className="space-y-3">
          {/* Info de usuario */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-9 h-9 rounded-full border-2 border-emerald-300 shadow-xs" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-200 flex items-center justify-center">
                  <User size={16} className="text-emerald-800" />
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-emerald-950">{user.displayName || 'Usuario'}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={handleForceSync}
                disabled={isSyncing}
                icon={<RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />}
                className="text-xs"
              >
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Todo'}
              </Button>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                <LogOut size={13} />
                <span>Salir</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700">
            <CheckCircle2 size={13} />
            <span>Sincronización automática en tiempo real activada — tus datos se reflejan en todos tus dispositivos.</span>
          </div>
        </div>
      ) : (
        /* === SIN SESIÓN === */
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Inicia sesión con tu cuenta de Google para guardar tus comidas, recetas y metas en la nube. 
            Podrás acceder y continuar desde cualquier dispositivo.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigning || !isConfigured}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-xs text-sm font-semibold text-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {/* Ícono de Google */}
            <svg width="18" height="18" viewBox="0 0 48 48" className="shrink-0">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            {isSigning ? 'Abriendo ventana de Google...' : 'Iniciar sesión con Google'}
          </button>

          {!isConfigured && (
            <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Firebase no está configurado aún. Recarga la página si acabas de configurarlo.
            </p>
          )}
        </div>
      )}

      {/* Mensaje de estado */}
      {syncStatus && (
        <div className={`mt-3 p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
          syncStatus.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          <span>{syncStatus.message}</span>
        </div>
      )}
    </Card>
  );
};

