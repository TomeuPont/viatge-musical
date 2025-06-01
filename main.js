// --- Configuración global de Firebase ---
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID"
};
if (!firebase.apps?.length) firebase.initializeApp(firebaseConfig);

// --- Autenticación global ---
function isUserAuthenticated(cb) {
  firebase.auth().onAuthStateChanged(function(user) {
    cb(!!user, user);
  });
}

function logout() {
  firebase.auth().signOut().then(function() {
    localStorage.removeItem('jugador');
    window.location.href = "login.html";
  });
}

// --- Logros: Leer y guardar en Firestore ---
// Por cada usuario: logros/{uid} => { tema1: {teoria: "gris", terminologia: "amarillo", audicions: "verde"}, ... }

async function getLogros(uid) {
  try {
    const doc = await firebase.firestore().collection("logros").doc(uid).get();
    return doc.exists ? doc.data() : {};
  } catch (e) { return {}; }
}

async function setLogro(uid, tema, modalidad, estado) {
  // estado: "gris", "amarillo", "verde"
  const ref = firebase.firestore().collection("logros").doc(uid);
  await ref.set({
    [tema]: { [modalidad]: estado }
  }, { merge: true });
}

// Para actualizar múltiples modalidades de un tema:
async function setLogros(uid, tema, nuevosEstados) {
  // nuevosEstados: { teoria: "verde", terminologia: "amarillo", audicions: "gris" }
  const ref = firebase.firestore().collection("logros").doc(uid);
  await ref.set({
    [tema]: nuevosEstados
  }, { merge: true });
}
