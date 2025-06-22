// Muestra el usuario y el botón "Sortir" arriba a la derecha de forma modular
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initUserInfo === "function") initUserInfo();
});

// Mostrar estrellas de logros según Firestore
async function mostrarLogros(uid) {
  const logros = await getLogros(uid);
  // Por cada tema
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    // CORRECTO: ahora accedemos a logros[`tema${tema}`]
    const logrosTema = logros[`tema${tema}`] || {};
    // Modalidades: teoria, terminologia, audicions
    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (!estrella) return;
      // Estado: gris (default), amarillo, verde
      const estado = logrosTema[modalidad] || 'gris';
      estrella.classList.remove('gris','amarillo','verde');
      estrella.classList.add(estado);
    });
  });
}

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

// Extra: si vuelves desde la partida SIN recargar (SPA), puedes exponer mostrarLogros global
window.mostrarLogros = mostrarLogros;
