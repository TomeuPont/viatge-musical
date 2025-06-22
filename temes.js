// === DEBUG: muestra en consola los pasos y datos usados ===

// Pinta las estrellas según los logros en Firestore
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
    const logrosTema = logros[`tema${tema}`] || {};
    console.log(`[DEBUG] Tema: tema${tema}`, logrosTema);

    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (!estrella) {
        console.warn(`[DEBUG] No se encuentra estrella .estrella.${modalidad} en tema${tema}`);
        return;
      }
      const valor = logrosTema[modalidad];
      console.log(`[DEBUG]   Modalitat: ${modalidad}, valor:`, valor);
      const estado = estadoMap[valor] || 'gris';
      estrella.classList.remove('gris','amarillo','verde','perfecte','completat');
      estrella.classList.add(estado);
      console.log(`[DEBUG]   Añadida clase: ${estado} a .estrella.${modalidad} de tema${tema}`);
    });
  });
}

// Llama a mostrarLogros cuando el usuario esté autenticado y la página cargada
window.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log("[DEBUG] Usuario autenticado:", user.uid);
      mostrarLogros(user.uid);
    } else {
      console.warn("[DEBUG] Usuario no autenticado.");
    }
  });
});

// --- RESTO DE LÓGICA PARA CONTINUAR Y MÚSICA DE FONDO, ETC. ---

// Guardar el tiempo de la música antes de cambiar de página y continuar flujo
function continuar() {
  const musica = document.getElementById('musicaFondo');
  if (musica && !musica.paused) {
    localStorage.setItem('musicaFondoTime', musica.currentTime);
  }
  // Continuar: comprobar selección
  const checkboxes = document.querySelectorAll('#temesForm input[type="checkbox"]:checked');
  const errorDiv = document.getElementById('error');
  if (checkboxes.length === 0) {
    errorDiv.textContent = 'Per favor, selecciona almenys un apartat per continuar.';
    errorDiv.style.display = 'block';
    return;
  }
  errorDiv.style.display = 'none';
  // Guarda los temas seleccionados (como array de valores) en localStorage
  const temesSeleccionats = Array.from(checkboxes).map(cb => cb.value);
  localStorage.setItem('temesSeleccionats', JSON.stringify(temesSeleccionats));
  window.location.href = 'modalitats.html';
}

// Música de fondo: recuperar posición y play/pause según ON/OFF
window.addEventListener("DOMContentLoaded", () => {
  const musica = document.getElementById('musicaFondo');
  const tiempo = parseFloat(localStorage.getItem('musicaFondoTime') || "0");
  if (!isNaN(tiempo)) {
    musica.currentTime = tiempo;
  }
  if (localStorage.getItem('musicaFondoON') === 'si') {
    musica.volume = 0.4;
    musica.play().catch(()=>{});
  } else {
    musica.pause();
  }
});
