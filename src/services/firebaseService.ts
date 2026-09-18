import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  Firestore,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup,
  signInAnonymously,
  GoogleAuthProvider,
  onAuthStateChanged, 
  signOut,
  User, 
  Auth 
} from 'firebase/auth';
import { Meal, NutritionGoals, CanonicalFood } from '../types/nutrition.types';
import { DbRecipe, DbDailyLog } from '../types/db.types';
import { db } from '../db';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyA_yh24eke6_1GI9EfKV6nXVYYsrD7Wtkw",
  authDomain: "nutrilens-fce87.firebaseapp.com",
  projectId: "nutrilens-fce87",
  storageBucket: "nutrilens-fce87.firebasestorage.app",
  messagingSenderId: "1088128589619",
  appId: "1:1088128589619:web:1223d6d72755bf484e6846"
};

const LOCAL_STORAGE_FIREBASE_KEY = 'nutrilens_firebase_config';
const LOCAL_STORAGE_SYNC_USER_KEY = 'nutrilens_sync_user_id';
export const DEFAULT_MASTER_USER_ID = 'nutrilens_master_user';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let currentUser: User | null = null;
let unsubscribers: Unsubscribe[] = [];

// --- Estado Global de Sincronización ---
export interface SyncStateInfo {
  state: 'connected' | 'syncing' | 'error' | 'idle';
  lastError: string | null;
  lastSuccessTime: number | null;
  userId: string;
  isGoogleUser: boolean;
}

let currentSyncInfo: SyncStateInfo = {
  state: 'idle',
  lastError: null,
  lastSuccessTime: null,
  userId: DEFAULT_MASTER_USER_ID,
  isGoogleUser: false
};

const syncListeners: ((info: SyncStateInfo) => void)[] = [];

export const onSyncStateChange = (listener: (info: SyncStateInfo) => void) => {
  syncListeners.push(listener);
  listener(currentSyncInfo);
  return () => {
    const idx = syncListeners.indexOf(listener);
    if (idx >= 0) syncListeners.splice(idx, 1);
  };
};

const updateSyncState = (partial: Partial<SyncStateInfo>) => {
  currentSyncInfo = { ...currentSyncInfo, ...partial };
  syncListeners.forEach(l => l(currentSyncInfo));
};

type AuthListener = (user: User | null) => void;
const authListeners: AuthListener[] = [];

export const onAuthUserChange = (listener: AuthListener) => {
  authListeners.push(listener);
  listener(currentUser);
  return () => {
    const idx = authListeners.indexOf(listener);
    if (idx >= 0) authListeners.splice(idx, 1);
  };
};

/**
 * Limpia recursivamente cualquier valor 'undefined' para que Firestore nunca lance
 * 'Unsupported field value: undefined'. Los valores undefined en objetos son eliminados,
 * y en arrays son convertidos a null.
 */
export function sanitizeForFirestore<T = any>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (data instanceof Date) return data.toISOString();
  if (Array.isArray(data)) {
    return data.map(item => item === undefined ? null : sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export const getStoredFirebaseConfig = (): FirebaseConfig => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_FIREBASE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && parsed.projectId === 'nutrilens-fce87' && parsed.apiKey) {
        return parsed;
      }
      localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
    }
  } catch (err) {
    localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

export const setStoredFirebaseConfig = (config: FirebaseConfig | null): void => {
  if (config) {
    localStorage.setItem(LOCAL_STORAGE_FIREBASE_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_FIREBASE_KEY);
  }
};

export const isFirebaseConfigured = (): boolean => {
  const cfg = getStoredFirebaseConfig();
  return !!(cfg && cfg.apiKey && cfg.projectId && cfg.appId);
};

export const getCurrentUser = (): User | null => currentUser;

// --- Manejo del ID de Usuario / Perfil de Sincronización ---
export const getCustomSyncId = (): string => {
  return localStorage.getItem(LOCAL_STORAGE_SYNC_USER_KEY) || DEFAULT_MASTER_USER_ID;
};

export const setCustomSyncId = (syncId: string): void => {
  const clean = syncId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  if (clean) {
    localStorage.setItem(LOCAL_STORAGE_SYNC_USER_KEY, clean);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_SYNC_USER_KEY);
  }
  updateSyncState({ userId: getEffectiveUserId() });
  startRealtimeFirestoreSync().catch(console.error);
};

export const getEffectiveUserId = (): string => {
  if (currentUser?.uid) return currentUser.uid;
  return getCustomSyncId();
};

let initPromise: Promise<boolean> | null = null;

export const initFirebase = (): Promise<boolean> => {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = getStoredFirebaseConfig();
    if (!config || !config.apiKey) return false;
    try {
      if (!getApps().length) {
        app = initializeApp(config);
      } else {
        app = getApp();
      }
      firestore = getFirestore(app);
      auth = getAuth(app);

      onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateSyncState({
          userId: getEffectiveUserId(),
          isGoogleUser: !!user
        });
        authListeners.forEach(l => l(user));
      });

      updateSyncState({
        userId: getEffectiveUserId(),
        isGoogleUser: !!currentUser
      });

      return true;
    } catch (err: any) {
      console.error('Error inicializando Firebase:', err);
      updateSyncState({ state: 'error', lastError: err.message });
      initPromise = null;
      return false;
    }
  })();

  return initPromise;
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  const isReady = await initFirebase();
  if (!isReady || !auth) {
    return { success: false, error: 'Firebase no está configurado.' };
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
    updateSyncState({
      userId: result.user.uid,
      isGoogleUser: true
    });
    authListeners.forEach(l => l(currentUser));
    return { success: true, user: result.user };
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Cerraste la ventana antes de completar el inicio de sesión.' };
    }
    if (err.code === 'auth/unauthorized-domain') {
      return { 
        success: false, 
        error: `El dominio actual no está autorizado en Firebase Authentication. Ve a Firebase Console -> Authentication -> Configuración -> Dominios autorizados y agrega: proyectocelene.github.io` 
      };
    }
    if (err.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: `El proveedor Google no está habilitado en tu proyecto de Firebase. Actívalo en Firebase Console -> Authentication -> Método de inicio de sesión.`
      };
    }
    return { success: false, error: err.message || 'Error iniciando sesión con Google' };
  }
};

export const signOutFromGoogle = async (): Promise<void> => {
  if (auth) {
    stopRealtimeFirestoreSync();
    await signOut(auth);
    currentUser = null;
    updateSyncState({
      userId: getEffectiveUserId(),
      isGoogleUser: false
    });
    authListeners.forEach(l => l(null));
    startRealtimeFirestoreSync().catch(console.error);
  }
};

// --- Diagnóstico y Prueba de Conexión en Vivo ---
export interface DiagnosticResult {
  success: boolean;
  message: string;
  code?: string;
  latencyMs?: number;
  userId: string;
  recommendation?: string;
}

export const testFirestoreConnection = async (): Promise<DiagnosticResult> => {
  const startTime = Date.now();
  try {
    const isReady = await initFirebase();
    if (!isReady || !firestore) {
      return {
        success: false,
        message: 'No se pudo inicializar Firebase. Revisa las credenciales de tu proyecto.',
        userId: 'desconocido',
        recommendation: 'Asegúrate de que apiKey, projectId y appId sean válidos.'
      };
    }

    const userId = getEffectiveUserId();
    const testDocRef = doc(firestore, 'users', userId, '_diagnostic', 'ping');
    
    // Probar escritura en Firestore
    await setDoc(testDocRef, {
      ping: true,
      timestamp: Date.now(),
      clientTime: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node'
    }, { merge: true });

    // Probar lectura de Firestore
    const snap = await getDoc(testDocRef);
    if (!snap.exists()) {
      return {
        success: false,
        message: 'Se escribió el documento de prueba pero no se pudo leer de vuelta.',
        userId,
        recommendation: 'Verifica las reglas de lectura en Firebase Firestore.'
      };
    }

    const latency = Date.now() - startTime;
    updateSyncState({
      state: 'connected',
      lastSuccessTime: Date.now(),
      lastError: null
    });

    return {
      success: true,
      message: `¡Conexión y sincronización con Cloud Firestore 100% exitosa! (Latencia: ${latency}ms)`,
      latencyMs: latency,
      userId
    };
  } catch (err: any) {
    const code = err.code || '';
    let recommendation = 'Revisa la consola de Firebase.';
    let friendlyMessage = err.message || 'Error desconocido';

    if (code === 'permission-denied') {
      if (!currentUser) {
        friendlyMessage = 'Permisos denegados (permission-denied): Tus reglas de seguridad exigen iniciar sesión con Google (request.auth != null).';
        recommendation = 'Haz clic en el botón "Iniciar sesión con Google" para autenticarte y sincronizar tus comidas con tu cuenta personal.';
      } else {
        friendlyMessage = 'Permisos denegados (permission-denied): Las reglas de Firestore no permitieron escribir en tu carpeta de usuario.';
        recommendation = 'Verifica que tus reglas tengan: match /users/{userId}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == userId; }';
      }
    } else if (code === 'not-found' || err.message?.includes('database') || err.message?.includes('not exist')) {
      friendlyMessage = 'Base de datos Firestore no encontrada o proyecto no coincide.';
      recommendation = 'Verifica que el projectId en la configuración sea exactamente nutrilens-fce87.';
    } else if (code === 'unavailable') {
      friendlyMessage = 'Servicio de Firebase no disponible o sin conexión a internet.';
      recommendation = 'Verifica tu conexión de red o si Firebase tiene intermitencias.';
    }

    updateSyncState({
      state: 'error',
      lastError: friendlyMessage
    });

    return {
      success: false,
      message: friendlyMessage,
      code,
      userId: getEffectiveUserId(),
      recommendation
    };
  }
};

// --- Sincronización de Comidas ---
export const syncMealToFirestore = async (meal: Meal): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    const mealDoc = doc(firestore, 'users', userId, 'meals', meal.id!);
    await setDoc(mealDoc, sanitizeForFirestore({ ...meal, syncedAt: Date.now() }), { merge: true });
    updateSyncState({ lastSuccessTime: Date.now(), lastError: null });
  } catch (err: any) {
    console.warn('Error sincronizando comida con Firestore:', err);
    updateSyncState({ lastError: err.message });
  }
};

export const deleteMealFromFirestore = async (mealId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    await deleteDoc(doc(firestore, 'users', userId, 'meals', mealId));
  } catch (err: any) {
    console.warn('Error eliminando comida de Firestore:', err);
  }
};

// --- Sincronización de Recetas ---
export const syncRecipeToFirestore = async (recipe: DbRecipe): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    const recipeDoc = doc(firestore, 'users', userId, 'recipes', recipe.id!);
    await setDoc(recipeDoc, sanitizeForFirestore({ ...recipe, syncedAt: Date.now() }), { merge: true });
    updateSyncState({ lastSuccessTime: Date.now(), lastError: null });
  } catch (err: any) {
    console.warn('Error sincronizando receta con Firestore:', err);
  }
};

export const deleteRecipeFromFirestore = async (recipeId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    await deleteDoc(doc(firestore, 'users', userId, 'recipes', recipeId));
  } catch (err: any) {
    console.warn('Error eliminando receta de Firestore:', err);
  }
};

// --- Sincronización de Metas ---
export const syncGoalsToFirestore = async (goals: NutritionGoals): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    const goalsDoc = doc(firestore, 'users', userId, 'settings', 'nutrition_goals');
    await setDoc(goalsDoc, sanitizeForFirestore({ ...goals, syncedAt: Date.now() }), { merge: true });
    updateSyncState({ lastSuccessTime: Date.now(), lastError: null });
  } catch (err: any) {
    console.warn('Error sincronizando metas con Firestore:', err);
  }
};

// --- Sincronización de Logs Diarios (Agua, Notas, Suplementos, Reflexión) ---
export const syncDailyLogToFirestore = async (log: DbDailyLog): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    const logDoc = doc(firestore, 'users', userId, 'dailyLogs', log.date);
    await setDoc(logDoc, sanitizeForFirestore({ ...log, syncedAt: Date.now() }), { merge: true });
    updateSyncState({ lastSuccessTime: Date.now(), lastError: null });
  } catch (err: any) {
    console.warn('Error sincronizando log diario con Firestore:', err);
  }
};

export const deleteDailyLogFromFirestore = async (date: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    await deleteDoc(doc(firestore, 'users', userId, 'dailyLogs', date));
  } catch (err: any) {
    console.warn('Error eliminando log diario de Firestore:', err);
  }
};

// --- Sincronización de Alimentos Canónicos ---
export const syncCanonicalFoodToFirestore = async (food: CanonicalFood): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    const foodDoc = doc(firestore, 'users', userId, 'canonicalFoods', food.id!);
    await setDoc(foodDoc, sanitizeForFirestore({ ...food, syncedAt: Date.now() }), { merge: true });
    updateSyncState({ lastSuccessTime: Date.now(), lastError: null });
  } catch (err: any) {
    console.warn('Error sincronizando alimento canónico con Firestore:', err);
  }
};

export const deleteCanonicalFoodFromFirestore = async (foodId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore) return;
  try {
    const userId = getEffectiveUserId();
    await deleteDoc(doc(firestore, 'users', userId, 'canonicalFoods', foodId));
  } catch (err: any) {
    console.warn('Error eliminando alimento canónico de Firestore:', err);
  }
};

// --- Sincronización en Tiempo Real Bidireccional Ultra-Rápida ---
export const startRealtimeFirestoreSync = async (
  onStatusChange?: (status: 'connected' | 'syncing' | 'error' | 'idle') => void
): Promise<void> => {
  const isReady = await initFirebase();
  if (!isReady || !firestore) {
    if (onStatusChange) onStatusChange('idle');
    updateSyncState({ state: 'idle' });
    return;
  }
  stopRealtimeFirestoreSync();
  const userId = getEffectiveUserId();
  if (onStatusChange) onStatusChange('syncing');
  updateSyncState({ state: 'syncing', userId });

  const handleSnapshotError = (collectionName: string, err: any) => {
    console.warn(`Error en snapshot de ${collectionName}:`, err);
    let friendly = err.message || 'Error en tiempo real';
    if (err.code === 'permission-denied') {
      friendly = 'Permisos denegados en Firestore. Actualiza las reglas en Firebase Console.';
    } else if (err.code === 'not-found') {
      friendly = 'Base de datos Firestore no encontrada en Firebase Console.';
    }
    updateSyncState({ state: 'error', lastError: friendly });
    if (onStatusChange) onStatusChange('error');
  };

  try {
    // 1. Escuchar Comidas con bulkPut
    const unsubMeals = onSnapshot(
      collection(firestore, 'users', userId, 'meals'),
      async (snapshot) => {
        const toPut: Meal[] = [];
        const toDelete: string[] = [];
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as Meal;
          if (change.type === 'added' || change.type === 'modified') {
            toPut.push(data);
          } else if (change.type === 'removed') {
            toDelete.push(change.doc.id);
          }
        }
        if (toPut.length > 0) await db.meals.bulkPut(toPut);
        if (toDelete.length > 0) await db.meals.bulkDelete(toDelete);
        updateSyncState({ state: 'connected', lastSuccessTime: Date.now(), lastError: null });
        if (onStatusChange) onStatusChange('connected');
      },
      (err) => handleSnapshotError('comidas', err)
    );

    // 2. Escuchar Recetas con bulkPut
    const unsubRecipes = onSnapshot(
      collection(firestore, 'users', userId, 'recipes'),
      async (snapshot) => {
        const toPut: DbRecipe[] = [];
        const toDelete: string[] = [];
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as DbRecipe;
          if (change.type === 'added' || change.type === 'modified') {
            toPut.push(data);
          } else if (change.type === 'removed') {
            toDelete.push(change.doc.id);
          }
        }
        if (toPut.length > 0) await db.recipes.bulkPut(toPut);
        if (toDelete.length > 0) await db.recipes.bulkDelete(toDelete);
        updateSyncState({ state: 'connected', lastSuccessTime: Date.now() });
      },
      (err) => handleSnapshotError('recetas', err)
    );

    // 3. Escuchar Logs Diarios con bulkPut
    const unsubDailyLogs = onSnapshot(
      collection(firestore, 'users', userId, 'dailyLogs'),
      async (snapshot) => {
        const toPut: DbDailyLog[] = [];
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as DbDailyLog;
          if (change.type === 'added' || change.type === 'modified') {
            const id = data.id || `log_${data.date}`;
            toPut.push({ ...data, id });
          } else if (change.type === 'removed') {
            const found = await db.dailyLogs.where('date').equals(change.doc.id).first();
            if (found && found.id) {
              await db.dailyLogs.delete(found.id);
            }
          }
        }
        if (toPut.length > 0) await db.dailyLogs.bulkPut(toPut);
        updateSyncState({ state: 'connected', lastSuccessTime: Date.now() });
      },
      (err) => handleSnapshotError('logs diarios', err)
    );

    // 4. Escuchar Alimentos Canónicos con bulkPut
    const unsubCanonical = onSnapshot(
      collection(firestore, 'users', userId, 'canonicalFoods'),
      async (snapshot) => {
        const toPut: CanonicalFood[] = [];
        const toDelete: string[] = [];
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as CanonicalFood;
          if (change.type === 'added' || change.type === 'modified') {
            toPut.push(data);
          } else if (change.type === 'removed') {
            toDelete.push(change.doc.id);
          }
        }
        if (toPut.length > 0) await db.canonicalFoods.bulkPut(toPut);
        if (toDelete.length > 0) await db.canonicalFoods.bulkDelete(toDelete);
        updateSyncState({ state: 'connected', lastSuccessTime: Date.now() });
      },
      (err) => handleSnapshotError('alimentos canónicos', err)
    );

    // 5. Escuchar Metas Nutricionales
    const unsubGoals = onSnapshot(
      doc(firestore, 'users', userId, 'settings', 'nutrition_goals'),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as NutritionGoals;
          await db.goals.put({ ...data, id: 'user_default_goals' });
          updateSyncState({ state: 'connected', lastSuccessTime: Date.now() });
        }
      },
      (err) => handleSnapshotError('metas nutricionales', err)
    );

    unsubscribers.push(unsubMeals, unsubRecipes, unsubDailyLogs, unsubCanonical, unsubGoals);
  } catch (err: any) {
    console.error('Error iniciando sync en tiempo real:', err);
    updateSyncState({ state: 'error', lastError: err.message });
    if (onStatusChange) onStatusChange('error');
  }
};

export const stopRealtimeFirestoreSync = (): void => {
  unsubscribers.forEach(unsub => { try { unsub(); } catch (e) {} });
  unsubscribers = [];
};

export const forceSyncAllWithCloud = async (): Promise<{ success: boolean; message: string; count: number }> => {
  const isReady = await initFirebase();
  if (!isReady || !firestore) {
    return { success: false, message: 'Firebase no está configurado o no se pudo inicializar.', count: 0 };
  }
  const userId = getEffectiveUserId();
  let syncCount = 0;
  updateSyncState({ state: 'syncing' });

  try {
    // 1. Subir Comidas locales a Firestore
    const localMeals = await db.meals.toArray();
    for (const m of localMeals) {
      if (m.id) {
        await setDoc(doc(firestore, 'users', userId, 'meals', m.id), sanitizeForFirestore({ ...m, syncedAt: Date.now() }), { merge: true });
        syncCount++;
      }
    }

    // 2. Subir Recetas locales
    const localRecipes = await db.recipes.toArray();
    for (const r of localRecipes) {
      if (r.id) {
        await setDoc(doc(firestore, 'users', userId, 'recipes', r.id), sanitizeForFirestore({ ...r, syncedAt: Date.now() }), { merge: true });
        syncCount++;
      }
    }

    // 3. Subir Metas
    const localGoals = await db.goals.get('user_default_goals');
    if (localGoals) {
      await setDoc(doc(firestore, 'users', userId, 'settings', 'nutrition_goals'), sanitizeForFirestore({ ...localGoals, syncedAt: Date.now() }), { merge: true });
      syncCount++;
    }

    // 4. Subir Logs Diarios
    const localDailyLogs = await db.dailyLogs.toArray();
    for (const dl of localDailyLogs) {
      if (dl.date) {
        await setDoc(doc(firestore, 'users', userId, 'dailyLogs', dl.date), sanitizeForFirestore({ ...dl, syncedAt: Date.now() }), { merge: true });
        syncCount++;
      }
    }

    // 5. Subir Alimentos Canónicos
    const localCanonical = await db.canonicalFoods.toArray();
    for (const cf of localCanonical) {
      if (cf.id) {
        await setDoc(doc(firestore, 'users', userId, 'canonicalFoods', cf.id), sanitizeForFirestore({ ...cf, syncedAt: Date.now() }), { merge: true });
        syncCount++;
      }
    }

    // Descarga desde Firestore a IndexedDB local
    const remoteMeals = await getDocs(collection(firestore, 'users', userId, 'meals'));
    const remoteMealsData: Meal[] = [];
    remoteMeals.forEach(d => remoteMealsData.push(d.data() as Meal));
    if (remoteMealsData.length > 0) {
      await db.meals.bulkPut(remoteMealsData);
    }

    const remoteRecipes = await getDocs(collection(firestore, 'users', userId, 'recipes'));
    const remoteRecipesData: DbRecipe[] = [];
    remoteRecipes.forEach(d => remoteRecipesData.push(d.data() as DbRecipe));
    if (remoteRecipesData.length > 0) {
      await db.recipes.bulkPut(remoteRecipesData);
    }

    const remoteDailyLogs = await getDocs(collection(firestore, 'users', userId, 'dailyLogs'));
    const remoteLogsData: DbDailyLog[] = [];
    remoteDailyLogs.forEach(d => {
      const data = d.data() as DbDailyLog;
      remoteLogsData.push({ ...data, id: data.id || `log_${data.date}` });
    });
    if (remoteLogsData.length > 0) {
      await db.dailyLogs.bulkPut(remoteLogsData);
    }

    const remoteCanonical = await getDocs(collection(firestore, 'users', userId, 'canonicalFoods'));
    const remoteCanonicalData: CanonicalFood[] = [];
    remoteCanonical.forEach(d => remoteCanonicalData.push(d.data() as CanonicalFood));
    if (remoteCanonicalData.length > 0) {
      await db.canonicalFoods.bulkPut(remoteCanonicalData);
    }

    updateSyncState({
      state: 'connected',
      lastSuccessTime: Date.now(),
      lastError: null
    });

    return { 
      success: true, 
      message: `Sincronización completa. ${syncCount} elementos locales respaldados en Cloud Firestore.`, 
      count: syncCount 
    };
  } catch (err: any) {
    const errMsg = err.code === 'permission-denied'
      ? 'Permisos denegados (permission-denied): Las reglas de Firestore impidieron la escritura. Revisa las reglas en Firebase Console.'
      : (err.message || 'Error desconocido');
    updateSyncState({ state: 'error', lastError: errMsg });
    return { success: false, message: `Error: ${errMsg}`, count: syncCount };
  }
};
