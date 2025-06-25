// =======================
// Nombres de los temas para mostrar
// =======================
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

// =======================
// Sincroniza logros (estrelles) desde Firestore a localStorage
// =======================
async function sincronitzarLogrosFirestore(uid) {
  try {
    const logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
    const logros = logrosDoc.exists ? logrosDoc.data() : {};
    localStorage.setItem('estrelles', JSON.stringify(logros));
  } catch (err) {
    // Si hay error, sigue mostrando lo que haya en localStorage sin bloquear nada
  }
}

// =======================
// Mostrar temas seleccionados y estrellas/logros
// =======================
function mostrarTemesSeleccionats() {
  let temes = [];
  try {
    temes = JSON.parse(localStorage.getItem('temesSeleccionats') || "[]");
  } catch(e) { temes = []; }
  const estrelles = JSON.parse(localStorage.getItem('estrelles') || '{}');
  const ul = document.getElementById("temesSeleccionats");
  if (!ul) return;
  ul.innerHTML = temes.map(idx => {
    const temaNom = nomsTemes[parseInt(idx,10)-1];
    const estados = estrelles[idx] || {};
    return `<li class="tema-row">
      <span class="tema-nom">${temaNom}</span>
      <span class="stars">
        <span class="star ${(estados.teoria === 'perfecta' || estados.teoria === 'perfecte') ? 'green' : (estados.teoria === 'fallos' || estados.teoria === 'completat') ? 'yellow' : ''}"></span>
        <span class="star ${(estados.terminologia === 'perfecta' || estados.terminologia === 'perfecte') ? 'green' : (estados.terminologia === 'fallos' || estados.terminologia === 'completat') ? 'yellow' : ''}"></span>
        <span class="star ${(estados.audicions === 'perfecta' || estados.audicions === 'perfecte') ? 'green' : (estados.audicions === 'fallos' || estados.audicions === 'completat') ? 'yellow' : ''}"></span>
      </span>
    </li>`;
  }).join('');
}

// =======================
// Autenticación, usuario y sincronización de logros
// =======================
window.addEventListener('DOMContentLoaded', function() {
  // Así tienes el DOM listo
  isUserAuthenticated(async function(isAuth, user) {
    const jugadorInfo = document.getElementById('jugadorInfo');
    if (isAuth) {
      jugadorInfo.style.display = 'flex';
      let nomJugador = user.displayName ? user.displayName : user.email;
      jugadorInfo.innerHTML = `👤 ${nomJugador}
        <button id="logoutBtn" onclick="logout()">Sortir</button>`;
      localStorage.setItem('jugador', nomJugador);
      // Sincroniza logros y sólo entonces pinta la columna lateral
      await sincronitzarLogrosFirestore(user.uid);
      mostrarTemesSeleccionats();
    } else {
      jugadorInfo.style.display = 'none';
      localStorage.removeItem('jugador');
      window.location.href = "login.html";
    }
  });
});

// =======================
// Controla el envío del formulario de modalidades
// =======================
window.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('modalitatsForm');
  if (!form) return;
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('input[name="modalitat"]:checked');
    const errorDiv = document.getElementById('error');
    if (checkboxes.length === 0) {
      errorDiv.textContent = 'Per favor, selecciona almenys una modalitat per continuar.';
      errorDiv.style.display = 'block';
      return;
    }
    errorDiv.style.display = 'none';
    const modalitatsSeleccionades = Array.from(checkboxes).map(cb => cb.value);
    localStorage.setItem('modalitatsSeleccionades', JSON.stringify(modalitatsSeleccionades));
    window.location.href = 'joc.html';
  });
});

// =======================
// Música de fondo: recuperar posición y play/pause según ON/OFF
// =======================
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

// =======================
// (Opcional) Mostrar email/usuario si tienes función global reutilizable
// =======================
window.addEventListener('DOMContentLoaded', () => {
  if (typeof mostrarInfoUsuario === "function") mostrarInfoUsuario();
});
