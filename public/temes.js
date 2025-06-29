// =======================
// Mostrar usuario y botón "Sortir" arriba a la derecha (como en las otras páginas)
// =======================
window.addEventListener('DOMContentLoaded', () => {
  firebase.auth().onAuthStateChanged(user => {
    const jugadorInfo = document.getElementById('jugadorInfo');
    if (user) {
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
});

// =======================
// Mostrar estrellas de logros según Firestore (funcionalidad actual)
// =======================


async function mostrarLogros(uid) {
  const logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
  const logros = logrosDoc.exists ? logrosDoc.data() : {};
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (!estrella) return;
      const clave = `tema${tema}.${modalidad}`;
      const estado = (() => {
        const valor = logros[clave];
        if (valor === "perfecte") return "verde";
        if (valor === "completat") return "amarillo";
        return "gris";
      })();
      estrella.classList.remove('gris','amarillo','verde','perfecte','completat');
      estrella.classList.add(estado);
    });
  });

  // Guardar los logros pintados por tema en localStorage para modalitats.js
  let objetoLogros = {};
  document.querySelectorAll('.tema-option').forEach(label => {
    const tema = label.getAttribute('data-tema');
    objetoLogros[tema] = {};
    ['teoria','terminologia','audicions'].forEach(modalidad => {
      const estrella = label.querySelector(`.estrella.${modalidad}`);
      if (estrella.classList.contains('verde')) objetoLogros[tema][modalidad] = 'verde';
      else if (estrella.classList.contains('amarillo')) objetoLogros[tema][modalidad] = 'amarillo';
      else objetoLogros[tema][modalidad] = 'gris';
    });
  });
  localStorage.setItem('estrelles', JSON.stringify(objetoLogros));
}

// =======================
// Proteger acceso y cargar logros al entrar
// =======================
window.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      mostrarLogros(user.uid);
    } else {
      window.location.href = "login.html";
    }
  });
});

// =======================
// Botón CONTINUAR funcional
// =======================
function continuar() {
  // Guarda el tiempo de la música antes de cambiar de página
  const musica = document.getElementById('musicaFondo');
  if (musica && !musica.paused) {
    localStorage.setItem('musicaFondoTime', musica.currentTime);
  }
  // Comprobar selección
  const checkboxes = document.querySelectorAll('#temesForm input[type="checkbox"]:checked');
  const errorDiv = document.getElementById('error');
  if (checkboxes.length === 0) {
    errorDiv.textContent = 'Per favor, selecciona almenys un apartat per continuar.';
    errorDiv.style.display = 'block';
    return;
  }
  errorDiv.style.display = 'none';
  // Guarda los temas seleccionados (array de valores) en localStorage
  const temesSeleccionats = Array.from(checkboxes).map(cb => cb.value);
  localStorage.setItem('temesSeleccionats', JSON.stringify(temesSeleccionats));
  window.location.href = 'modalitats.html';
}

// =======================
// Música de fondo: recuperar posición y play/pause según ON/OFF
// =======================
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

// =======================
// Función logout (como en otras páginas)
// =======================
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
