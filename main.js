// main.js

const firebaseConfig = {
  apiKey: "AIzaSyBIgrJxLanB-UM7-mPm-2deAny60yf1Rtk",
  authDomain: "viatge-musical.firebaseapp.com",
  projectId: "viatge-musical",
  storageBucket: "viatge-musical.firebasestorage.app",
  messagingSenderId: "275074430816",
  appId: "1:275074430816:web:7a305c8c3ab5a423885005"
};

// Inicializa Firebase solo si no estaba inicializado
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Acceso a Firestore
const db = firebase.firestore();

// ==================== AUTENTICACIÓN ====================

// Devuelve una promesa con el usuario autenticado, o null si no hay
// Debes llamar a esta función SOLO en páginas protegidas (no en login.html)
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

// Muestra el correo y el botón sortir en el div #jugadorInfo (arriba derecha)
// ¡ATENCIÓN! Ya NO redirige a login.html si no hay usuario, solo oculta el div.
function initUserInfo() {
  const jugadorInfo = document.getElementById('jugadorInfo');
  if (!jugadorInfo) return; // No hay div, no hacemos nada
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
      // NO redirigir aquí, evita el bucle infinito en login.html
    }
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
  try {
    await db.collection("logros").doc(uid).set({
      [`tema${tema}`]: { [modalidad]: estado }
    }, { merge: true });
  } catch (e) {
    console.error("Error guardant el logro:", e);
  }
}

async function guardarLogro(uid, tema, modalidad, estado) {
  if (!['teoria', 'terminologia', 'audicions'].includes(modalidad)) {
    throw new Error('Modalitat no vàlida');
  }
  // Referència al document de logros de l'usuari
  const db = firebase.firestore();
  const ref = db.collection('logros').doc(uid);

  // Prepara l'objecte amb la clau estàndard
  const updateObj = {};
  updateObj[`tema${tema}.${modalidad}`] = estado;

  await ref.set(updateObj, { merge: true });
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

// Muestra el email del usuario en el div #userEmail (solo si existe ese div)
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
  if (musica) musica.volume = 0; // O musica.pause();
}


function restaurarMusicaFondo() {
  const musica = document.getElementById('musicaFondo');
  if (musica && localStorage.getItem('musicaFondoON') === 'si') {
    musica.volume = 0.4;
    musica.play().catch(()=>{});
  }
}
