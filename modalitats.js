// Extrae el tema de la URL
function getTemaFromURL() {
  const params = new URLSearchParams(window.location.search);
  // Puede haber más de un tema en el query, coger el primero
  const temes = params.get('temes');
  if (!temes) return null;
  return temes.split(',')[0];
}

// Opcional: nombres de los temas para mostrar
const nomsTemes = {
  1: "Música de l’antiguitat",
  2: "Música Medieval",
  3: "Música del Renaixement",
  4: "Música del Barroc",
  5: "Música del Classicisme",
  6: "Música del Romanticisme",
  7: "Música del segle XX i últimes tendències",
  8: "Músiques urbanes (jazz, rock, blues, rap, electrònica)",
  9: "Música de pel·lícules i musicals",
  10: "Músiques i danses tradicionals del món",
  11: "Músiques i danses tradicionals de les Illes Balears",
  12: "Història de la dansa"
};

let currentTema = getTemaFromURL();
if (currentTema && nomsTemes[currentTema]) {
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("temaNom").textContent = nomsTemes[currentTema];
  });
}

isUserAuthenticated(async function(isAuth, user) {
  const jugadorInfo = document.getElementById('jugadorInfo');
  if (isAuth) {
    jugadorInfo.style.display = 'flex';
    let nomJugador = user.displayName ? user.displayName : user.email;
    jugadorInfo.innerHTML = `👤 ${nomJugador}
      <button id="logoutBtn" onclick="logout()">Sortir</button>`;
    localStorage.setItem('jugador', nomJugador);

    // Cargar y mostrar logros de este tema
    await mostrarLogrosModalitats(user.uid, currentTema);
  } else {
    jugadorInfo.style.display = 'none';
    localStorage.removeItem('jugador');
    window.location.href = "login.html";
  }
});

// Muestra las estrellas de logro para cada modalidad
async function mostrarLogrosModalitats(uid, tema) {
  const logros = await getLogros(uid);
  const logrosTema = (logros && logros[tema]) ? logros[tema] : {};
  ['teoria','terminologia','audicions'].forEach(modalitat => {
    const estrella = document.getElementById(`estrella-${modalitat}`);
    if (!estrella) return;
    const estado = logrosTema[modalitat] || 'gris';
    estrella.classList.remove('gris','amarillo','verde');
    estrella.classList.add(estado);
  });
}

// Cuando el usuario pulsa "Jugar" en una modalidad
function jugarModalitat(modalitat) {
  // Aquí normalmente iría la navegación a la pantalla de juego de esa modalidad y tema
  // Ejemplo:
  window.location.href = `joc.html?tema=${currentTema}&modalitat=${modalitat}`;
}
