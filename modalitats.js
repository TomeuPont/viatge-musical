window.addEventListener('DOMContentLoaded', () => {
  if (typeof initUserInfo === "function") initUserInfo();
});

// Nombres de los temas para mostrar
const nomsTemes = [
  "Música de l’antiguitat",
  "Música medieval",
  "Música del Renaixement",
  "Música del Barroc",
  "Música del classicisme",
  "Música del Romanticisme",
  "Música del segle XX i últimes tendències",
  "Músiques urbanes (jazz, rock, blues, rap, electrònica)",
  "Música de pel·lícules i musicals",
  "Músiques i danses tradicionals del món",
  "Músiques i danses tradicionals de les Illes Balears",
  "Història de la dansa"
];

// Muestra los temas seleccionados y las estrellas/logros si están guardados
function mostrarTemesSeleccionats() {
  let temes = [];
  try {
    temes = JSON.parse(localStorage.getItem('temesSeleccionats') || "[]");
  } catch(e) {}
  const estrelles = JSON.parse(localStorage.getItem('estrelles') || '{}');
  const ul = document.getElementById("temesSeleccionats");
  ul.innerHTML = temes.map(idx => {
    const temaNom = nomsTemes[parseInt(idx,10)-1];
    const estados = estrelles[idx] || {};
    return `<li class="tema-row">
      <span class="tema-nom">${temaNom}</span>
      <span class="stars">
        <span class="star ${estados.teoria === 'perfecta' ? 'green' : estados.teoria === 'fallos' ? 'yellow' : ''}"></span>
        <span class="star ${estados.terminologia === 'perfecta' ? 'green' : estados.terminologia === 'fallos' ? 'yellow' : ''}"></span>
        <span class="star ${estados.audicions === 'perfecta' ? 'green' : estados.audicions === 'fallos' ? 'yellow' : ''}"></span>
      </span>
    </li>`;
  }).join('');
}
window.addEventListener('DOMContentLoaded', mostrarTemesSeleccionats);

// Muestra el email/usuario (si tienes función global, úsala)
window.addEventListener('DOMContentLoaded', () => {
  if (typeof mostrarInfoUsuario === "function") mostrarInfoUsuario();
});

// Autenticación y mostrar info de usuario/logros (igual que otras pantallas)
isUserAuthenticated(async function(isAuth, user) {
  const jugadorInfo = document.getElementById('jugadorInfo');
  if (isAuth) {
    jugadorInfo.style.display = 'flex';
    let nomJugador = user.displayName ? user.displayName : user.email;
    jugadorInfo.innerHTML = `👤 ${nomJugador}
      <button id="logoutBtn" onclick="logout()">Sortir</button>`;
    localStorage.setItem('jugador', nomJugador);
  } else {
    jugadorInfo.style.display = 'none';
    localStorage.removeItem('jugador');
    window.location.href = "login.html";
  }
});

// Controla el envío del formulario de modalidades
window.addEventListener('DOMContentLoaded', function() {
  document.getElementById('modalitatsForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('.modalitats-options input[type="checkbox"]:checked');
    const errorDiv = document.getElementById('error');
    if (checkboxes.length === 0) {
      errorDiv.textContent = 'Per favor, selecciona almenys una modalitat per continuar.';
      errorDiv.style.display = 'block';
      return;
    }
    errorDiv.style.display = 'none';
    const modalitatsSeleccionades = Array.from(checkboxes).map(cb => cb.value);
    localStorage.setItem('modalitatsSeleccionades', JSON.stringify(modalitatsSeleccionades));
    // Aquí puedes llamar a guardarLogro cuando el usuario complete una modalidad, por ejemplo:
    // guardarLogro(uid, tema, 'teoria', 'completat');
    window.location.href = 'joc.html';
  });
});

// Música de fondo: recuperar posición y play/pause según ON/OFF
window.addEventListener("DOMContentLoaded", () => {
  const musica = document.getElementById('musicaFondo');
  if (!musica) return;
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
