// Muestra el usuario y el botón "Sortir" arriba a la derecha de forma modular
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initUserInfo === "function") initUserInfo();
});

// Este archivo debe cargarse después de Firebase y de que exista el DOM con las estrellas

// Pinta las estrellas según los logros en Firestore
async function mostrarLogros(uid) {
  // 1. Cargar los logros del usuario desde Firestore
  const logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
  const logros = logrosDoc.exists ? logrosDoc.data() : {};

  // 2. Relación estado <-> clase CSS
  const estadoMap = { perfecte: 'verde', completat: 'amarillo' };

  // 3. Recorrer todos los temas en la página
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    const logrosTema = logros[`tema${tema}`] || {};

    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (!estrella) return;
      // valor será 'perfecte', 'completat' o undefined
      const valor = logrosTema[modalidad];
      // clase CSS final
      const estado = estadoMap[valor] || 'gris';
      // Quita cualquier clase de color previa
      estrella.classList.remove('gris','amarillo','verde','perfecte','completat');
      // Añade la nueva clase
      estrella.classList.add(estado);
    });
  });
}

// Llama a mostrarLogros cuando el usuario esté autenticado y la página cargada
window.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      mostrarLogros(user.uid);
    }
  });
});
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

// Proteger acceso y cargar logros
window.addEventListener("DOMContentLoaded", () => {
  if (typeof isUserAuthenticated === "function") {
    isUserAuthenticated().then(user => {
      if (user) {
        // Cargar logros y pintar estrellas
        mostrarLogros(user.uid);
      } else {
        window.location.href = "login.html";
      }
    });
  }
});
