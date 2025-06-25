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

// Sincroniza logros (estrelles) desde Firestore a localStorage
async function sincronitzarLogrosFirestore(uid) {
  try {
    const logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
    const logros = logrosDoc.exists ? logrosDoc.data() : {};
    localStorage.setItem('estrelles', JSON.stringify(logros));
    mostrarTemesSeleccionats(); // Refresca la vista tras actualizar logros
  } catch (err) {
    // Si falla, al menos muestra los que había en localStorage
    mostrarTemesSeleccionats();
  }
}

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
        <span class="star ${estados.teoria === 'perfecta' || estados.teoria === 'perfecte' ? 'green' : estados.teoria === 'fallos' || estados.teoria === 'completat' ? 'yellow' : ''}"></span>
        <span class="star ${estados.terminologia === 'perfecta' || estados.terminologia === 'perfecte' ? 'green' : estados.terminologia === 'fallos' || estados.terminologia === 'completat' ? 'yellow' : ''}"></span>
        <span class="star ${estados.audicions === 'perfecta' || estados.audicions === 'perfecte' ? 'green' : estados.audicions === 'fallos' || estados.audicions === 'completat' ? 'yellow' : ''}"></span>
      </span>
    </li>`;
  }).join('');
}

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
    // ¡Sincroniza logros después de autenticar!
    await sincronitzarLogrosFirestore(user.uid);
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
    // Usa un selector robusto para los checkboxes (por si cambia la clase del contenedor)
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
