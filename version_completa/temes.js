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

// Continuar: comprobar selección
function continuar() {
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
