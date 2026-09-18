import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  User, 
  Settings as SettingsIcon,
  HelpCircle,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  Smartphone,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { 
  isFirebaseConfigured, 
  forceSyncAllWithCloud, 
  startRealtimeFirestoreSync,
  signInWithGoogle,
  signOutFromGoogle,
  getCurrentUser,
  onAuthUserChange,
  initFirebase,
  testFirestoreConnection,
  DiagnosticResult,
  getEffectiveUserId,
  getCustomSyncId,
  setCustomSyncId,
  onSyncStateChange,
  SyncStateInfo,
  DEFAULT_MASTER_USER_ID
} from '../../services/firebaseService';

export const FirebaseSyncCard: React.FC = () => {
  const [user, setUser] = useState(getCurrentUser());
  const [isSigning, setIsSigning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [syncInfo, setSyncInfo] = useState<SyncStateInfo>({
    state: 'idle',
    lastError: null,
    lastSuccessTime: null,
    userId: getEffectiveUserId(),
    isGoogleUser: !!getCurrentUser()
  });

  // Personalización del Sync ID
  const [syncIdInput, setSyncIdInput] = useState(getCustomSyncId());
  const [isEditingSyncId, setIsEditingSyncId] = useState(false);

  useEffect(() => {
    // Inicializar Firebase al montar
    initFirebase().then(() => {
      const u = getCurrentUser();
      setUser(u);
      startRealtimeFirestoreSync();
    });

    const unsubAuth = onAuthUserChange((u) => {
      setUser(u);
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
    const result = await signInWithGoogle();
    if (result.success && result.user) {
      setSyncStatus({ type: 'success', message: `¡Bienvenido, ${result.user.displayName}! Sincronización con tu cuenta activada.` });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } else {
      setSyncStatus({ type: 'error', message: result.error || 'No se pudo iniciar sesión.' });
    }
    setIsSigning(false);
  };

  const handleSignOut = async () => {
    await signOutFromGoogle();
    setSyncStatus({ type: 'success', message: 'Sesión cerrada. Regresando a sincronización de usuario único.' });
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const res = await forceSyncAllWithCloud();
    setSyncStatus({ type: res.success ? 'success' : 'error', message: res.message });
    if (res.success) {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
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
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }
    setIsTesting(false);
  };

  const handleSaveSyncId = () => {
    setCustomSyncId(syncIdInput);
    setIsEditingSyncId(false);
    setSyncStatus({ type: 'success', message: `ID de sincronización actualizado a: "${syncIdInput}". Todos tus dispositivos con este ID compartirán la base de datos.` });
  };

  const firestoreRulesText = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permite lectura y escritura a las colecciones de NutriLens
    match /users/{userId}/{document=**} {
      allow read, write: if true;
    }
  }
}`;

  const copyToClipboard = (text: string, type: 'rules' | 'domain') => {
    navigator.clipboard.writeText(text);
    if (type === 'rules') {
      setCopiedRules(true);
      setTimeout(() => setCopiedRules(false), 2000);
    } else {
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    }
  };

  const isConfigured = isFirebaseConfigured();

  return (
    <>
      <Card className="border-slate-200 bg-white shadow-xs">
        {/* Encabezado Principal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              syncInfo.state === 'connected' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : syncInfo.state === 'error'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {syncInfo.state === 'connected' ? <Cloud size={20} /> : <CloudOff size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Sincronización en la Nube (Google Firebase)</h3>
                <Badge 
                  variant={
                    syncInfo.state === 'connected' 
                      ? 'emerald' 
                      : syncInfo.state === 'error' 
                      ? 'rose' 
                      : 'amber'
                  } 
                  size="sm"
                >
                  {syncInfo.state === 'connected' 
                    ? '🟢 En Vivo' 
                    : syncInfo.state === 'syncing' 
                    ? '⏳ Sincronizando...' 
                    : syncInfo.state === 'error'
                    ? '🔴 Error de Reglas / Red'
                    : '⚪ Inactivo'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Respaldo automático en tiempo real de comidas, recetas, metas y suplementos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              title="Credenciales de Firebase"
            >
              <SettingsIcon size={13} />
              <span>Proyecto</span>
            </button>
            <button
              type="button"
              onClick={() => setShowConfigGuide(!showConfigGuide)}
              className="flex items-center gap-1 text-xs text-amber-800 hover:text-amber-950 font-medium px-2.5 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
              title="¿Cómo configurar Firebase Console?"
            >
              <HelpCircle size={13} />
              <span>Guía Firebase</span>
              {showConfigGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Guía Desplegable de Configuración en Firebase Console */}
        {showConfigGuide && (
          <div className="mb-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3 text-xs text-slate-700">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Zap size={15} />
              <span>¿Qué debes configurar en Firebase Console para que sincronice?</span>
            </div>
            
            <p className="leading-relaxed">
              Para que tu PWA pueda comunicarse con Firebase sin que Google bloquee las peticiones, realiza estos 3 pasos rápidos en{' '}
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold underline text-amber-900 hover:text-amber-950"
              >
                console.firebase.google.com
              </a>{' '}
              (Proyecto: <strong>coachv2-app</strong>):
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Paso 1: Base de datos creada */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 space-y-1">
                <p className="font-bold text-slate-900">1. Crear la Base de Datos Firestore (si aún no existe)</p>
                <p className="text-[11px] text-slate-600">
                  En el menú izquierdo ve a <strong>Compilación → Firestore Database</strong>. Si aparece el botón <strong>&ldquo;Crear base de datos&rdquo;</strong>, haz clic en él y selecciona la ubicación más cercana (ej. <em>nam5 / us-central</em>).
                </p>
              </div>

              {/* Paso 2: Reglas de seguridad */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">2. Configurar Reglas de Seguridad (¡Imprescindible!)</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(firestoreRulesText, 'rules')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors"
                  >
                    {copiedRules ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedRules ? '¡Copiado!' : 'Copiar Reglas'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  En <strong>Firestore Database</strong>, entra a la pestaña <strong>Reglas (Rules)</strong>, reemplaza todo el contenido por esto y haz clic en <strong>Publicar</strong>:
                </p>
                <pre className="p-2 rounded-lg bg-slate-900 text-slate-100 text-[10px] font-mono overflow-x-auto leading-snug">
                  {firestoreRulesText}
                </pre>
              </div>

              {/* Paso 3: Dominio autorizado para Google */}
              <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900">3. Autorizar Dominio de GitHub Pages (Para Login Google)</p>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('proyectocelene.github.io', 'domain')}
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 px-2 py-0.5 rounded-md bg-amber-100 hover:bg-amber-200 transition-colors"
                  >
                    {copiedDomain ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copiedDomain ? '¡Copiado!' : 'Copiar Dominio'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-600">
                  En el menú izquierdo ve a <strong>Authentication → Configuración (Settings) → Dominios autorizados</strong>. Haz clic en <strong>&ldquo;Agregar dominio&rdquo;</strong> y añade: <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">proyectocelene.github.io</code>.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Panel de Modo de Sincronización y Acciones */}
        <div className="space-y-3">
          {/* Tarjeta de Perfil Activo */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {user ? (
                user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border-2 border-emerald-300 shadow-xs" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center">
                    <User size={18} className="text-emerald-800" />
                  </div>
                )
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <Smartphone size={20} />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900">
                    {user ? (user.displayName || 'Cuenta de Google') : 'Perfil de Usuario Único (Multi-dispositivo)'}
                  </p>
                  <Badge variant={user ? 'emerald' : 'blue'} size="sm">
                    {user ? 'Google Auth' : 'Automático'}
                  </Badge>
                </div>
                
                {user ? (
                  <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-500">ID compartido en Firestore:</span>
                    {isEditingSyncId ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={syncIdInput}
                          onChange={(e) => setSyncIdInput(e.target.value)}
                          className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-slate-300 bg-white"
                          placeholder="nutrilens_master_user"
                        />
                        <button
                          type="button"
                          onClick={handleSaveSyncId}
                          className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold"
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => setIsEditingSyncId(true)}
                        className="text-[11px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.2 rounded cursor-pointer hover:bg-emerald-200 transition-colors"
                        title="Clic para cambiar ID"
                      >
                        {getEffectiveUserId()} ✏️
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botones de acción principales */}
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

              {user && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-colors"
                  title="Cerrar sesión de Google"
                >
                  <LogOut size={13} />
                  <span>Salir</span>
                </button>
              )}
            </div>
          </div>

          {/* Si NO tiene sesión de Google, ofrecer inicio opcional */}
          {!user && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800">
                  📱 Sincronización transparente activa entre tus dispositivos
                </p>
                <p className="text-[11px] text-slate-500">
                  Cualquier comida que agregues aquí se respaldará automáticamente en Firestore. Abre la PWA en tu celular para ver tus datos reflejados al instante.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigning}
                className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-2xs transition-all shrink-0 self-start sm:self-auto"
              >
                <svg width="14" height="14" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                <span>{isSigning ? 'Abriendo...' : 'Vincular con Google'}</span>
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
          {syncInfo.lastError && !diagnostic && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-bold">Error en tiempo real: </span>
                <span>{syncInfo.lastError}</span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <FirebaseConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfigSaved={() => {
          initFirebase().then(() => {
            const u = getCurrentUser();
            setUser(u);
            startRealtimeFirestoreSync();
          });
        }}
      />
    </>
  );
};
