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
  signInAnonymously, 
  onAuthStateChanged, 
  User, 
  Auth 
} from 'firebase/auth';
import { Meal, NutritionGoals } from '../types/nutrition.types';
import { DbRecipe } from '../types/db.types';
import { db } from '../db';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const LOCAL_STORAGE_FIREBASE_KEY = 'nutrilens_firebase_config';
const LOCAL_STORAGE_ANON_UID = 'nutrilens_guest_user_id';

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;
let currentUser: User | null = null;
let unsubscribers: Unsubscribe[] = [];

export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_FIREBASE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error leyendo config de Firebase:', err);
  }

  // Fallback a variables de entorno
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

  return null;
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

export const getOrCreateGuestUserId = (): string => {
  let uid = localStorage.getItem(LOCAL_STORAGE_ANON_UID);
  if (!uid) {
    uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(LOCAL_STORAGE_ANON_UID, uid);
  }
  return uid;
};

export const initFirebase = async (): Promise<boolean> => {
  const config = getStoredFirebaseConfig();
  if (!config) return false;

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }

    firestore = getFirestore(app);
    auth = getAuth(app);

    // Intentar inicio de sesión anónimo silencioso
    try {
      const userCredential = await signInAnonymously(auth);
      currentUser = userCredential.user;
    } catch (authErr) {
      console.warn('Firebase Auth Anónimo no habilitado o con error, usando ID local seguro:', authErr);
    }

    return true;
  } catch (err) {
    console.error('Error inicializando Firebase:', err);
    return false;
  }
};

export const getEffectiveUserId = (): string => {
  return currentUser?.uid || getOrCreateGuestUserId();
};

export const syncMealToFirestore = async (meal: Meal): Promise<void> => {
  if (!firestore) {
    const initialized = await initFirebase();
    if (!initialized || !firestore) return;
  }

  try {
    const userId = getEffectiveUserId();
    const mealDoc = doc(firestore, 'users', userId, 'meals', meal.id!);
    await setDoc(mealDoc, { ...meal, syncedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Error sincronizando comida con Firestore:', err);
  }
};

export const deleteMealFromFirestore = async (mealId: string): Promise<void> => {
  if (!firestore) {
    const initialized = await initFirebase();
    if (!initialized || !firestore) return;
  }

  try {
    const userId = getEffectiveUserId();
    const mealDoc = doc(firestore, 'users', userId, 'meals', mealId);
    await deleteDoc(mealDoc);
  } catch (err) {
    console.warn('Error eliminando comida de Firestore:', err);
  }
};

export const syncRecipeToFirestore = async (recipe: DbRecipe): Promise<void> => {
  if (!firestore) {
    const initialized = await initFirebase();
    if (!initialized || !firestore) return;
  }

  try {
    const userId = getEffectiveUserId();
    const recipeDoc = doc(firestore, 'users', userId, 'recipes', recipe.id!);
    await setDoc(recipeDoc, { ...recipe, syncedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Error sincronizando receta con Firestore:', err);
  }
};

export const deleteRecipeFromFirestore = async (recipeId: string): Promise<void> => {
  if (!firestore) {
    const initialized = await initFirebase();
    if (!initialized || !firestore) return;
  }

  try {
    const userId = getEffectiveUserId();
    const recipeDoc = doc(firestore, 'users', userId, 'recipes', recipeId);
    await deleteDoc(recipeDoc);
  } catch (err) {
    console.warn('Error eliminando receta de Firestore:', err);
  }
};

export const syncGoalsToFirestore = async (goals: NutritionGoals): Promise<void> => {
  if (!firestore) {
    const initialized = await initFirebase();
    if (!initialized || !firestore) return;
  }

  try {
    const userId = getEffectiveUserId();
    const goalsDoc = doc(firestore, 'users', userId, 'settings', 'nutrition_goals');
    await setDoc(goalsDoc, { ...goals, syncedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Error sincronizando metas con Firestore:', err);
  }
};

/**
 * Escucha cambios en Firestore en tiempo real e hidrata la base IndexedDB local
 */
export const startRealtimeFirestoreSync = async (
  onStatusChange?: (status: 'connected' | 'syncing' | 'error' | 'idle') => void
): Promise<void> => {
  const isReady = await initFirebase();
  if (!isReady || !firestore) {
    if (onStatusChange) onStatusChange('idle');
    return;
  }

  // Limpiar escuchas previas
  stopRealtimeFirestoreSync();

  const userId = getEffectiveUserId();
  if (onStatusChange) onStatusChange('syncing');

  try {
    // 1. Escuchar comidas remotas
    const mealsColl = collection(firestore, 'users', userId, 'meals');
    const unsubMeals = onSnapshot(mealsColl, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data() as Meal;
        if (change.type === 'added' || change.type === 'modified') {
          await db.meals.put(data);
        } else if (change.type === 'removed') {
          await db.meals.delete(change.doc.id);
        }
      }
      if (onStatusChange) onStatusChange('connected');
    }, (err) => {
      console.warn('Error en realtime snapshot de comidas:', err);
      if (onStatusChange) onStatusChange('error');
    });

    // 2. Escuchar recetas remotas
    const recipesColl = collection(firestore, 'users', userId, 'recipes');
    const unsubRecipes = onSnapshot(recipesColl, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        const data = change.doc.data() as DbRecipe;
        if (change.type === 'added' || change.type === 'modified') {
          await db.recipes.put(data);
        } else if (change.type === 'removed') {
          await db.recipes.delete(change.doc.id);
        }
      }
    });

    unsubscribers.push(unMealsWrapper(unsubMeals), unsubRecipes);
  } catch (err) {
    console.error('Error iniciando sincronización en tiempo real:', err);
    if (onStatusChange) onStatusChange('error');
  }
};

const unMealsWrapper = (unsub: Unsubscribe): Unsubscribe => {
  return unsub;
};

export const stopRealtimeFirestoreSync = (): void => {
  unsubscribers.forEach(unsub => {
    try {
      unsub();
    } catch (e) {}
  });
  unsubscribers = [];
};

/**
 * Empuja todos los registros locales a Firestore y descarga los remotos
 */
export const forceSyncAllWithCloud = async (): Promise<{ success: boolean; message: string; count: number }> => {
  const isReady = await initFirebase();
  if (!isReady || !firestore) {
    return { success: false, message: 'Firebase no está configurado o no se pudo conectar.', count: 0 };
  }

  const userId = getEffectiveUserId();
  let syncCount = 0;

  try {
    // 1. Subir comidas locales a Firestore
    const localMeals = await db.meals.toArray();
    for (const m of localMeals) {
      const mealDoc = doc(firestore, 'users', userId, 'meals', m.id!);
      await setDoc(mealDoc, { ...m, syncedAt: Date.now() }, { merge: true });
      syncCount++;
    }

    // 2. Subir recetas locales
    const localRecipes = await db.recipes.toArray();
    for (const r of localRecipes) {
      const recipeDoc = doc(firestore, 'users', userId, 'recipes', r.id!);
      await setDoc(recipeDoc, { ...r, syncedAt: Date.now() }, { merge: true });
      syncCount++;
    }

    // 3. Subir metas locales
    const localGoals = await db.goals.get('user_default_goals');
    if (localGoals) {
      const goalsDoc = doc(firestore, 'users', userId, 'settings', 'nutrition_goals');
      await setDoc(goalsDoc, { ...localGoals, syncedAt: Date.now() }, { merge: true });
    }

    // 4. Descargar comidas remotas
    const remoteMealsSnap = await getDocs(collection(firestore, 'users', userId, 'meals'));
    for (const d of remoteMealsSnap.docs) {
      await db.meals.put(d.data() as Meal);
    }

    // 5. Descargar recetas remotas
    const remoteRecipesSnap = await getDocs(collection(firestore, 'users', userId, 'recipes'));
    for (const d of remoteRecipesSnap.docs) {
      await db.recipes.put(d.data() as DbRecipe);
    }

    return { 
      success: true, 
      message: `Sincronización completada exitosamente. ${syncCount} elementos sincronizados con Cloud Firestore.`, 
      count: syncCount 
    };
  } catch (err: any) {
    return { success: false, message: `Error durante la sincronización: ${err.message}`, count: 0 };
  }
};
