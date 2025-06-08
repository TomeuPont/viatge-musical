window.addEventListener('DOMContentLoaded', () => {
  if (typeof initUserInfo === "function") initUserInfo();
});

// Mostrar nombre del jugador y proteger acceso (puedes mover esto a main.js si lo usas en más pantallas)
isUserAuthenticated(async function(isAuth, user) {
  const jugadorInfo = document.getElementById('jugadorInfo');
  if (isAuth) {
    jugadorInfo.style.display = 'flex';
    let nomJugador = user.displayName ? user.displayName : user.email;
    jugadorInfo.innerHTML = `👤 ${nomJugador}
      <button id="logoutBtn" onclick="logout()">Sortir</button>`;
    localStorage.setItem('jugador', nomJugador);

    // Cargar logros y pintar estrellas
    await mostrarLogros(user.uid);
  } else {
    jugadorInfo.style.display = 'none';
    localStorage.removeItem('jugador');
    window.location.href = "login.html";
  }
});

// Mostrar estrellas de logros según Firestore
async function mostrarLogros(uid) {
  const logros = await getLogros(uid);
  // Por cada tema
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    const logrosTema = logros[tema] || {};
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

// Guardar el tiempo de la música antes de cambiar de página
function continuar() {
  const musica = document.getElementById('musicaFondo');
  if (musica && !musica.paused) {
    localStorage.setItem('musicaFondoTime', musica.currentTime);
  }
  // Continuar: comprobar selección
  const checkboxes = document.querySelectorAll('#temesForm input[type="checkbox"]:checked');
  const errorDiv = document.getElementById('error');
  if (checkboxes.length === 0) {
    errorDiv.textContent = 'Per favor, selecciona almenys un tema per continuar.';
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
  // Mostrar email usuario arriba a la derecha (con Firebase)
  if (typeof mostrarInfoUsuario === "function") mostrarInfoUsuario();
  else if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
      const div = document.getElementById('userEmail');
      if (user && user.email) {
        div.textContent = user.email;
        div.style.display = 'block';
      } else {
        div.style.display = 'none';
      }
    });
  }
});
