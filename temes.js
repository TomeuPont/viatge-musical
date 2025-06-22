console.log("[DEBUG] temes.js cargado");

window.addEventListener('DOMContentLoaded', () => {
  console.log("[DEBUG] DOMContentLoaded");
  if (typeof firebase === "undefined") {
    console.error("[DEBUG] Firebase NO está definido");
    return;
  }
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("[DEBUG] Usuario autenticado:", user.uid);
      mostrarLogros(user.uid);
    } else {
      console.warn("[DEBUG] Usuario NO autenticado");
    }
  });
});

async function mostrarLogros(uid) {
  console.log("== [DEBUG] mostrarLogros iniciado con UID:", uid);

  // 1. Cargar los logros del usuario desde Firestore
  let logrosDoc;
  try {
    logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
  } catch (e) {
    console.error("[DEBUG] Error obteniendo logros:", e);
    return;
  }

  if (!logrosDoc.exists) {
    console.warn("[DEBUG] No hay documento de logros para este usuario.");
    return;
  }

  const logros = logrosDoc.data();
  console.log("[DEBUG] Logros recibidos de Firestore:", logros);

  // 2. Relación estado <-> clase CSS
  const estadoMap = { perfecte: 'verde', completat: 'amarillo' };

  // 3. Recorrer todos los temas en la página
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (!estrella) {
        console.warn(`[DEBUG] No se encuentra estrella .estrella.${modalidad} en tema${tema}`);
        return;
      }
      // OJO: ahora buscamos en logros["temaN.modalidad"]
      const clave = `tema${tema}.${modalidad}`;
      const valor = logros[clave];
      console.log(`[DEBUG] Tema: tema${tema}, Modalitat: ${modalidad}, clave: ${clave}, valor:`, valor);
      const estado = estadoMap[valor] || 'gris';
      estrella.classList.remove('gris','amarillo','verde','perfecte','completat');
      estrella.classList.add(estado);
      console.log(`[DEBUG]   Añadida clase: ${estado} a .estrella.${modalidad} de tema${tema}`);
    });
  });
}
