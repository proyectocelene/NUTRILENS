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

export const getStoredFirebaseConfig = (): FirebaseConfig | null => {
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

export const getCurrentUser = (): User | null => currentUser;

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
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authListeners.forEach(l => l(user));
    });
    await new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth!, (user) => {
        currentUser = user;
        unsub();
        resolve();
      });
      setTimeout(resolve, 3000);
    });
    return true;
  } catch (err) {
    console.error('Error inicializando Firebase:', err);
    return false;
  }
};

export const signInWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  const isReady = await initFirebase();
  if (!isReady || !auth) {
    return { success: false, error: 'Firebase no esta configurado.' };
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
      return { success: false, error: 'Cerraste la ventana antes de completar el inicio de sesion.' };
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

export const syncMealToFirestore = async (meal: Meal): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const mealDoc = doc(firestore, 'users', currentUser.uid, 'meals', meal.id!);
    await setDoc(mealDoc, { ...meal, syncedAt: Date.now() }, { merge: true });
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

export const syncRecipeToFirestore = async (recipe: DbRecipe): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const recipeDoc = doc(firestore, 'users', currentUser.uid, 'recipes', recipe.id!);
    await setDoc(recipeDoc, { ...recipe, syncedAt: Date.now() }, { merge: true });
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

export const syncGoalsToFirestore = async (goals: NutritionGoals): Promise<void> => {
  if (!firestore) await initFirebase();
  if (!firestore || !currentUser) return;
  try {
    const goalsDoc = doc(firestore, 'users', currentUser.uid, 'settings', 'nutrition_goals');
    await setDoc(goalsDoc, { ...goals, syncedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Error sincronizando metas:', err);
  }
};

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
    const unsubMeals = onSnapshot(
      collection(firestore, 'users', userId, 'meals'),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as Meal;
          if (change.type === 'added' || change.type === 'modified') {
            await db.meals.put(data);
          } else if (change.type === 'removed') {
            await db.meals.delete(change.doc.id);
          }
        }
        if (onStatusChange) onStatusChange('connected');
      },
      (err) => {
        console.warn('Error en snapshot:', err);
        if (onStatusChange) onStatusChange('error');
      }
    );
    const unsubRecipes = onSnapshot(
      collection(firestore, 'users', userId, 'recipes'),
      async (snapshot) => {
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as DbRecipe;
          if (change.type === 'added' || change.type === 'modified') {
            await db.recipes.put(data);
          } else if (change.type === 'removed') {
            await db.recipes.delete(change.doc.id);
          }
        }
      }
    );
    unsubscribers.push(unsubMeals, unsubRecipes);
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
    return { success: false, message: 'Firebase no esta configurado.', count: 0 };
  }
  if (!currentUser) {
    return { success: false, message: 'Debes iniciar sesion con Google para sincronizar.', count: 0 };
  }
  const userId = currentUser.uid;
  let syncCount = 0;
  try {
    const localMeals = await db.meals.toArray();
    for (const m of localMeals) {
      await setDoc(doc(firestore, 'users', userId, 'meals', m.id!), { ...m, syncedAt: Date.now() }, { merge: true });
      syncCount++;
    }
    const localRecipes = await db.recipes.toArray();
    for (const r of localRecipes) {
      await setDoc(doc(firestore, 'users', userId, 'recipes', r.id!), { ...r, syncedAt: Date.now() }, { merge: true });
      syncCount++;
    }
    const localGoals = await db.goals.get('user_default_goals');
    if (localGoals) {
      await setDoc(doc(firestore, 'users', userId, 'settings', 'nutrition_goals'), { ...localGoals, syncedAt: Date.now() }, { merge: true });
    }
    const remoteMeals = await getDocs(collection(firestore, 'users', userId, 'meals'));
    for (const d of remoteMeals.docs) await db.meals.put(d.data() as Meal);
    const remoteRecipes = await getDocs(collection(firestore, 'users', userId, 'recipes'));
    for (const d of remoteRecipes.docs) await db.recipes.put(d.data() as DbRecipe);
    return { success: true, message: `Sincronizacion completa. ${syncCount} elementos subidos.`, count: syncCount };
  } catch (err: any) {
    return { success: false, message: `Error: ${err.message}`, count: 0 };
  }
};
