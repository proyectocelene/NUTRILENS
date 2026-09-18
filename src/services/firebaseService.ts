import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot, 
  Firestore,
  Unsubscribe 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithPopup,
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
  apiKey: "AIzaSyCnnVOMmrh2caF0OiMkNVpwOOScyO_Z3tY",
  authDomain: "coachv2-app.firebaseapp.com",
  projectId: "coachv2-app",
  storageBucket: "coachv2-app.firebasestorage.app",
  messagingSenderId: "967180421561",
  appId: "1:967180421561:web:cca1b034ef90788b7e0e68"
};

const LOCAL_STORAGE_FIREBASE_KEY = 'nutrilens_firebase_config';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let currentUser: User | null = null;
let unsubscribers: Unsubscribe[] = [];

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
    if (stored) return JSON.parse(stored);
  } catch (err) {
    console.error('Error leyendo config de Firebase:', err);
  }
  const envKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProject = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  const envAppId = (import.meta as any).env?.VITE_FIREBASE_APP_ID;
  if (envKey && envProject && envAppId) {
    return {
      apiKey: envKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProject}.firebaseapp.com`,
      projectId: envProject,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProject}.appspot.com`,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: envAppId
    };
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
        authListeners.forEach(l => l(user));
      });
      return true;
    } catch (err) {
      console.error('Error inicializando Firebase:', err);
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
    authListeners.forEach(l => l(currentUser));
    return { success: true, user: result.user };
  } catch (err: any) {
    if (err.code === 'auth/popup-closed-by-user') {
      return { success: false, error: 'Cerraste la ventana antes de completar el inicio de sesión.' };
    }
    return { success: false, error: err.message };
  }
};

export const signOutFromGoogle = async (): Promise<void> => {
  if (auth) {
    stopRealtimeFirestoreSync();
    await signOut(auth);
    currentUser = null;
    authListeners.forEach(l => l(null));
  }
};

export const getEffectiveUserId = (): string | null => currentUser?.uid || null;

// --- Sincronización de Comidas ---
export const syncMealToFirestore = async (meal: Meal): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const mealDoc = doc(firestore, 'users', currentUser.uid, 'meals', meal.id!);
    await setDoc(mealDoc, sanitizeForFirestore({ ...meal, syncedAt: Date.now() }), { merge: true });
  } catch (err) {
    console.warn('Error sincronizando comida:', err);
  }
};

export const deleteMealFromFirestore = async (mealId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    await deleteDoc(doc(firestore, 'users', currentUser.uid, 'meals', mealId));
  } catch (err) {
    console.warn('Error eliminando comida:', err);
  }
};

// --- Sincronización de Recetas ---
export const syncRecipeToFirestore = async (recipe: DbRecipe): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const recipeDoc = doc(firestore, 'users', currentUser.uid, 'recipes', recipe.id!);
    await setDoc(recipeDoc, sanitizeForFirestore({ ...recipe, syncedAt: Date.now() }), { merge: true });
  } catch (err) {
    console.warn('Error sincronizando receta:', err);
  }
};

export const deleteRecipeFromFirestore = async (recipeId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    await deleteDoc(doc(firestore, 'users', currentUser.uid, 'recipes', recipeId));
  } catch (err) {
    console.warn('Error eliminando receta:', err);
  }
};

// --- Sincronización de Metas ---
export const syncGoalsToFirestore = async (goals: NutritionGoals): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const goalsDoc = doc(firestore, 'users', currentUser.uid, 'settings', 'nutrition_goals');
    await setDoc(goalsDoc, sanitizeForFirestore({ ...goals, syncedAt: Date.now() }), { merge: true });
  } catch (err) {
    console.warn('Error sincronizando metas:', err);
  }
};

// --- Sincronización de Logs Diarios (Agua, Notas, Suplementos, Reflexión) ---
export const syncDailyLogToFirestore = async (log: DbDailyLog): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const logDoc = doc(firestore, 'users', currentUser.uid, 'dailyLogs', log.date);
    await setDoc(logDoc, sanitizeForFirestore({ ...log, syncedAt: Date.now() }), { merge: true });
  } catch (err) {
    console.warn('Error sincronizando log diario:', err);
  }
};

export const deleteDailyLogFromFirestore = async (date: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    await deleteDoc(doc(firestore, 'users', currentUser.uid, 'dailyLogs', date));
  } catch (err) {
    console.warn('Error eliminando log diario:', err);
  }
};

// --- Sincronización de Alimentos Canónicos ---
export const syncCanonicalFoodToFirestore = async (food: CanonicalFood): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const foodDoc = doc(firestore, 'users', currentUser.uid, 'canonicalFoods', food.id!);
    await setDoc(foodDoc, sanitizeForFirestore({ ...food, syncedAt: Date.now() }), { merge: true });
  } catch (err) {
    console.warn('Error sincronizando alimento canónico:', err);
  }
};

export const deleteCanonicalFoodFromFirestore = async (foodId: string): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    await deleteDoc(doc(firestore, 'users', currentUser.uid, 'canonicalFoods', foodId));
  } catch (err) {
    console.warn('Error eliminando alimento canónico:', err);
  }
};

// --- Sincronización en Tiempo Real Bidireccional Ultra-Rápida ---
export const startRealtimeFirestoreSync = async (
  onStatusChange?: (status: 'connected' | 'syncing' | 'error' | 'idle') => void
): Promise<void> => {
  const isReady = await initFirebase();
  if (!isReady || !firestore || !currentUser) {
    if (onStatusChange) onStatusChange('idle');
    return;
  }
  stopRealtimeFirestoreSync();
  const userId = currentUser.uid;
  if (onStatusChange) onStatusChange('syncing');

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
        if (onStatusChange) onStatusChange('connected');
      },
      (err) => {
        console.warn('Error en snapshot de comidas:', err);
        if (onStatusChange) onStatusChange('error');
      }
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
      },
      (err) => console.warn('Error en snapshot de recetas:', err)
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
      },
      (err) => console.warn('Error en snapshot de logs diarios:', err)
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
      },
      (err) => console.warn('Error en snapshot de alimentos canónicos:', err)
    );

    // 5. Escuchar Metas Nutricionales
    const unsubGoals = onSnapshot(
      doc(firestore, 'users', userId, 'settings', 'nutrition_goals'),
      async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as NutritionGoals;
          await db.goals.put({ ...data, id: 'user_default_goals' });
        }
      },
      (err) => console.warn('Error en snapshot de metas nutricionales:', err)
    );

    unsubscribers.push(unsubMeals, unsubRecipes, unsubDailyLogs, unsubCanonical, unsubGoals);
  } catch (err) {
    console.error('Error iniciando sync en tiempo real:', err);
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
    return { success: false, message: 'Firebase no está configurado.', count: 0 };
  }
  if (!currentUser) {
    return { success: false, message: 'Debes iniciar sesión con Google para sincronizar.', count: 0 };
  }
  const userId = currentUser.uid;
  let syncCount = 0;
  try {
    // 1. Subir Comidas
    const localMeals = await db.meals.toArray();
    for (const m of localMeals) {
      await setDoc(doc(firestore, 'users', userId, 'meals', m.id!), sanitizeForFirestore({ ...m, syncedAt: Date.now() }), { merge: true });
      syncCount++;
    }

    // 2. Subir Recetas
    const localRecipes = await db.recipes.toArray();
    for (const r of localRecipes) {
      await setDoc(doc(firestore, 'users', userId, 'recipes', r.id!), sanitizeForFirestore({ ...r, syncedAt: Date.now() }), { merge: true });
      syncCount++;
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
    for (const d of remoteMeals.docs) await db.meals.put(d.data() as Meal);

    const remoteRecipes = await getDocs(collection(firestore, 'users', userId, 'recipes'));
    for (const d of remoteRecipes.docs) await db.recipes.put(d.data() as DbRecipe);

    const remoteDailyLogs = await getDocs(collection(firestore, 'users', userId, 'dailyLogs'));
    for (const d of remoteDailyLogs.docs) {
      const data = d.data() as DbDailyLog;
      await db.dailyLogs.put({ ...data, id: data.id || `log_${data.date}` });
    }

    const remoteCanonical = await getDocs(collection(firestore, 'users', userId, 'canonicalFoods'));
    for (const d of remoteCanonical.docs) await db.canonicalFoods.put(d.data() as CanonicalFood);

    return { 
      success: true, 
      message: `Sincronización completa. ${syncCount} elementos respaldados en Cloud Firestore.`, 
      count: syncCount 
    };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message}`, count: 0 };
  }
};
