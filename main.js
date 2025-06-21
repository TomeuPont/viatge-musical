// main.js

const firebaseConfig = {
  apiKey: "AIzaSyBIgrJxLanB-UM7-mPm-2deAny60yf1Rtk",
  authDomain: "viatge-musical.firebaseapp.com",
  projectId: "viatge-musical",
  storageBucket: "viatge-musical.appspot.com", // <--- CORREGIDO
  messagingSenderId: "275074430816",
  appId: "1:275074430816:web:7a305c8c3ab5a423885005"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ==================== AUTENTICACIÓN ====================

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

function initUserInfo() {
  const jugadorInfo = document.getElementById('jugadorInfo');
  if (!jugadorInfo) return;
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      jugadorInfo.style.display = 'flex';
      let nomJugador = user.displayName ? user.displayName : user.email;
      jugadorInfo.innerHTML = `👤 ${nomJugador}
        <button id="logoutBtn" onclick="logout()">Sortir</button>`;
      localStorage.setItem('jugador', nomJugador);
    } else {
      jugadorInfo.style.display = 'none';
      localStorage.removeItem('jugador');
    }
  });
}

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}

// ==================== LOGROS ====================

async function getLogros(uid) {
  try {
    const doc = await db.collection("logros").doc(uid).get();
    return doc.exists ? doc.data() : {};
  } catch (e) {
    console.error("Error obtenint logros:", e);
    return {};
  }
}

// --- CORREGIDA ---
async function setLogro(uid, tema, modalidad, estado) {
  try {
    const docRef = db.collection("logros").doc(uid);
    const doc = await docRef.get();
    const prevTema = (doc.exists && doc.data()[`tema${tema}`]) ? doc.data()[`tema${tema}`] : {};
    await docRef.set({
      [`tema${tema}`]: { ...prevTema, [modalidad]: estado }
    }, { merge: true });
  } catch (e) {
    console.error("Error guardant el logro:", e);
  }
}

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

function silenciarMusicaFondo() {
  const musica = document.getElementById('musicaFondo');
  if (musica) musica.volume = 0;
}

function restaurarMusicaFondo() {
  const musica = document.getElementById('musicaFondo');
  if (musica && localStorage.getItem('musicaFondoON') === 'si') {
    musica.volume = 0.4;
  }
}
