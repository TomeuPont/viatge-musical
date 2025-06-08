// main.js

const firebaseConfig = {
  apiKey: "AIzaSyBIgrJxLanB-UM7-mPm-2deAny60yf1Rtk",
  authDomain: "viatge-musical.firebaseapp.com",
  projectId: "viatge-musical",
  storageBucket: "viatge-musical.firebasestorage.app",
  messagingSenderId: "275074430816",
  appId: "1:275074430816:web:7a305c8c3ab5a423885005"};

// Inicializa Firebase solo si no estaba inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Acceso a Firestore
const db = firebase.firestore();

// ==================== AUTENTICACIÓN ====================

// Comprueba si el usuario está autenticado, si no lo está redirige a login
function isUserAuthenticated(redirect = true) {
  return new Promise(resolve => {
    firebase.auth().onAuthStateChanged(user => {
      if (!user && redirect) {
        window.location.href = "login.html";
      }
      resolve(user);
    });
  });
}

// Cierra sesión y vuelve a la pantalla de login
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ==================== LOGROS ====================

// Carga los logros del usuario desde Firestore
async function getLogros(uid) {
  try {
    const doc = await db.collection("logros").doc(uid).get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    console.error("Error obtenint logros:", e);
    return {};
  }
}

// Guarda el estado de un logro individual (tema, modalidad: estado)
async function setLogro(uid, tema, modalidad, estado) {
  const field = `tema${tema}.${modalidad}`;
  try {
    await db.collection("logros").doc(uid).set({
      [`tema${tema}`]: { [modalidad]: estado }
    }, { merge: true });
  } catch (e) {
    console.error("Error guardant el logro:", e);
  }
}

// Guarda varios logros de golpe para un tema
async function setLogros(uid, tema, logrosTema) {
  try {
    await db.collection("logros").doc(uid).set({
      [`tema${tema}`]: logrosTema
    }, { merge: true });
  } catch (e) {
    console.error("Error guardant logros tema:", e);
  }
}

// ==================== UTILIDADES DE INTERFAZ ====================

// Muestra datos del usuario logueado (ejemplo para encabezado)

function mostrarInfoUsuario() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const info = document.getElementById('userEmail');
      if (info) {
        info.innerHTML = `<span>${user.email}</span> <button onclick="logout()" style="margin-left:12px;background:#563889;color:#fff;border:none;padding:0.3em 1em;border-radius:1em;cursor:pointer;">Sortir</button>`;
        info.style.display = '';
      }
    }
  });
}

// ==================== EXPORTA FUNCIONES SI HACE FALTA ====================
/*
// Si usas módulos:
// export { isUserAuthenticated, logout, getLogros, setLogro, setLogros, mostrarInfoUsuario };
*/
