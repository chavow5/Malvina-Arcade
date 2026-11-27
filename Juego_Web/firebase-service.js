/**
 * ==============================================================
 * 🔥 MALVINAS ARCADE — SERVICIO FIREBASE (Firestore + Auth)
 * ==============================================================
 * - Ranking público en vivo (colección `ranking_publico`, sin datos privados)
 * - Datos completos de contacto solo para Admin (colección `ranking_privado`)
 * - Autenticación anónima silenciosa para jugadores
 * - Autenticación Email/Contraseña real en Firebase Auth para Admin
 * ==============================================================
 */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import {
  getAuth,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  writeBatch,
  query,
  orderBy,
  limit,
  onSnapshot,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyC5IzyRC61e0BN7vfr6Lwv1JmE1DbwIljI',
  authDomain: 'lasmalvinasarcade.firebaseapp.com',
  projectId: 'lasmalvinasarcade',
  storageBucket: 'lasmalvinasarcade.firebasestorage.app',
  messagingSenderId: '584004561602',
  appId: '1:584004561602:web:4b0fe1ee610f66d061295b'
};

const ADMIN_EMAIL = 'admin@lasmalvinasarcade.web.app';
const PUBLIC_COLLECTION = 'ranking_publico';
const PRIVATE_COLLECTION = 'ranking_privado';
const MAX_ALLOWED_SCORE = 50000;
const VERIFIED_SCORE_LIMIT = 15000;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let publicRanking = [];
let adminRanking = [];
let publicLoaded = false;
let adminLoaded = false;
let connectionError = null;
let unsubPublic = null;
let unsubAdmin = null;
let isSigningInAnon = false;

let resolveAuthReady = null;
const authReadyPromise = new Promise((resolve) => {
  resolveAuthReady = resolve;
});

function isAdminUser(user) {
  return Boolean(user && !user.isAnonymous && user.email === ADMIN_EMAIL);
}

function notifyUi() {
  if (typeof window.renderRanking === 'function') {
    window.renderRanking();
  }
  window.dispatchEvent(new CustomEvent('malvinas:db-updated', {
    detail: {
      isAdmin: isAdminUser(auth.currentUser),
      publicLoaded,
      adminLoaded,
      connectionError
    }
  }));
}

function maskContactForPublic(contact) {
  const clean = String(contact || '').trim();
  if (!clean) return '••••';
  if (clean.startsWith('@')) {
    const body = clean.slice(1);
    const prefix = body.slice(0, Math.min(2, body.length));
    return `@${prefix}••••`;
  }
  if (clean.length >= 4) {
    return `••••${clean.slice(-2)}`;
  }
  return '••••';
}

function subscribePublicRanking() {
  if (unsubPublic) return;
  const q = query(
    collection(db, PUBLIC_COLLECTION),
    orderBy('score', 'desc'),
    limit(10)
  );
  unsubPublic = onSnapshot(
    q,
    (snapshot) => {
      publicRanking = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || 'Jugador',
          score: typeof d.score === 'number' ? d.score : 0,
          verified: Boolean(d.verified),
          createdAt: d.createdAt || null
        };
      });
      publicLoaded = true;
      connectionError = null;
      notifyUi();
    },
    (err) => {
      console.error('[MalvinasDB] Error leyendo ranking público:', err);
      connectionError = 'No se pudo conectar con el ranking en vivo.';
      publicLoaded = true;
      notifyUi();
    }
  );
}

function subscribeAdminRanking() {
  if (unsubAdmin) return;
  const q = query(
    collection(db, PRIVATE_COLLECTION),
    orderBy('score', 'desc'),
    limit(500)
  );
  unsubAdmin = onSnapshot(
    q,
    (snapshot) => {
      adminRanking = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || 'Jugador',
          contact: d.contact || '',
          score: typeof d.score === 'number' ? d.score : 0,
          verified: Boolean(d.verified),
          createdAt: d.createdAt || null
        };
      });
      adminLoaded = true;
      notifyUi();
    },
    (err) => {
      console.error('[MalvinasDB] Error leyendo ranking privado:', err);
      adminLoaded = true;
      notifyUi();
    }
  );
}

function unsubscribeAdminRanking() {
  if (unsubAdmin) {
    unsubAdmin();
    unsubAdmin = null;
  }
  adminRanking = [];
  adminLoaded = false;
}

async function ensureAuthenticated() {
  if (auth.currentUser) return auth.currentUser;
  if (!isSigningInAnon) {
    isSigningInAnon = true;
    try {
      await signInAnonymously(auth);
    } finally {
      isSigningInAnon = false;
    }
  }
  await authReadyPromise;
  if (!auth.currentUser) {
    throw new Error('No se pudo establecer sesión con el servidor.');
  }
  return auth.currentUser;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    unsubscribeAdminRanking();
    if (!isSigningInAnon) {
      isSigningInAnon = true;
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error('[MalvinasDB] Error en sesión anónima:', err);
        connectionError = 'No se pudo iniciar sesión en el servidor.';
        publicLoaded = true;
        if (resolveAuthReady) {
          resolveAuthReady(null);
          resolveAuthReady = null;
        }
        notifyUi();
      } finally {
        isSigningInAnon = false;
      }
    }
    return;
  }

  if (resolveAuthReady) {
    resolveAuthReady(user);
    resolveAuthReady = null;
  }

  subscribePublicRanking();

  if (isAdminUser(user)) {
    subscribeAdminRanking();
  } else {
    unsubscribeAdminRanking();
  }

  notifyUi();
});

async function submitScore(name, contact, score) {
  const user = await ensureAuthenticated();
  const cleanName = String(name || '').trim().slice(0, 24);
  const cleanContact = String(contact || '').trim().slice(0, 40);
  const cleanScore = Math.max(0, Math.min(MAX_ALLOWED_SCORE, Math.floor(Number(score) || 0)));

  if (cleanName.length < 1) {
    throw new Error('Ingresá tu nombre o apodo.');
  }
  if (cleanContact.length < 2) {
    throw new Error('Ingresá tu WhatsApp o Instagram (mínimo 2 caracteres).');
  }

  const verified = cleanScore <= VERIFIED_SCORE_LIMIT;
  const entryRef = doc(collection(db, PUBLIC_COLLECTION));
  const entryId = entryRef.id;

  const batch = writeBatch(db);
  batch.set(doc(db, PUBLIC_COLLECTION, entryId), {
    name: cleanName,
    score: cleanScore,
    verified,
    uid: user.uid,
    createdAt: serverTimestamp()
  });
  batch.set(doc(db, PRIVATE_COLLECTION, entryId), {
    name: cleanName,
    contact: cleanContact,
    score: cleanScore,
    verified,
    uid: user.uid,
    createdAt: serverTimestamp()
  });

  await batch.commit();
  return { id: entryId, score: cleanScore, verified };
}

function mapAuthError(err) {
  const code = err && err.code ? err.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Contraseña incorrecta. Verificá e intentá nuevamente.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión a internet. Revisá tu red e intentá nuevamente.';
    case 'auth/weak-password':
      return 'La nueva contraseña debe tener al menos 6 caracteres.';
    case 'auth/requires-recent-login':
      return 'Volvé a iniciar sesión como administrador para cambiar la contraseña.';
    default:
      return 'No se pudo completar la operación. Intentá nuevamente.';
  }
}

async function loginAdmin(password) {
  const pwd = String(password || '');
  if (!pwd) {
    return { ok: false, error: 'Ingresá la contraseña de administrador.' };
  }
  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, pwd);
    subscribeAdminRanking();
    // Esperar una lectura inicial rápida si aún no cargó el snapshot
    if (!adminLoaded) {
      const snap = await getDocs(query(collection(db, PRIVATE_COLLECTION), orderBy('score', 'desc'), limit(500)));
      adminRanking = snap.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          name: d.name || 'Jugador',
          contact: d.contact || '',
          score: typeof d.score === 'number' ? d.score : 0,
          verified: Boolean(d.verified),
          createdAt: d.createdAt || null
        };
      });
      adminLoaded = true;
    }
    notifyUi();
    return { ok: true };
  } catch (err) {
    console.error('[MalvinasDB] Error en login admin:', err);
    return { ok: false, error: mapAuthError(err) };
  }
}

async function logoutAdmin() {
  unsubscribeAdminRanking();
  await signOut(auth);
  notifyUi();
}

async function changeAdminPassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  if (!isAdminUser(user)) {
    return { ok: false, error: 'Debés iniciar sesión como administrador.' };
  }
  if (!currentPassword) {
    return { ok: false, error: 'Ingresá tu contraseña actual.' };
  }
  if (!newPassword || newPassword.length < 6) {
    return { ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }
  try {
    const credential = EmailAuthProvider.credential(ADMIN_EMAIL, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    return { ok: true };
  } catch (err) {
    console.error('[MalvinasDB] Error al cambiar contraseña:', err);
    if (err && (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password')) {
      return { ok: false, error: 'La contraseña actual es incorrecta.' };
    }
    return { ok: false, error: mapAuthError(err) };
  }
}

async function deleteEntry(entryId) {
  if (!isAdminUser(auth.currentUser)) {
    throw new Error('Solo el administrador puede eliminar registros.');
  }
  if (!entryId) return;
  const batch = writeBatch(db);
  batch.delete(doc(db, PUBLIC_COLLECTION, entryId));
  batch.delete(doc(db, PRIVATE_COLLECTION, entryId));
  await batch.commit();
}

async function resetAllRankings() {
  if (!isAdminUser(auth.currentUser)) {
    throw new Error('Solo el administrador puede reiniciar el sorteo.');
  }
  const [pubSnap, privSnap] = await Promise.all([
    getDocs(collection(db, PUBLIC_COLLECTION)),
    getDocs(collection(db, PRIVATE_COLLECTION))
  ]);

  const refsToDelete = [
    ...pubSnap.docs.map((d) => d.ref),
    ...privSnap.docs.map((d) => d.ref)
  ];

  const CHUNK_SIZE = 400;
  for (let i = 0; i < refsToDelete.length; i += CHUNK_SIZE) {
    const batch = writeBatch(db);
    refsToDelete.slice(i, i + CHUNK_SIZE).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }

  return { deleted: privSnap.size || pubSnap.size };
}

window.MalvinasDB = {
  getPublicRanking: () => [...publicRanking],
  getAdminRanking: () => [...adminRanking],
  isPublicLoaded: () => publicLoaded,
  isAdminLoaded: () => adminLoaded,
  getConnectionError: () => connectionError,
  isAdminLoggedIn: () => isAdminUser(auth.currentUser),
  maskContactForPublic,
  submitScore,
  loginAdmin,
  logoutAdmin,
  changeAdminPassword,
  deleteEntry,
  resetAllRankings
};

notifyUi();
