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
      mostrarLogrosLateral(user.uid); // Pinta la columna lateral tras logros
    } else {
      jugadorInfo.style.display = 'none';
      localStorage.removeItem('jugador');
      window.location.href = "login.html";
    }
  });
});

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
// Mostrar temas seleccionados y sus estrellas según Firestore
// =======================
async function mostrarLogrosLateral(uid) {
  // Leer temas seleccionados del localStorage
  let temes = [];
  try {
    temes = JSON.parse(localStorage.getItem('temesSeleccionats') || "[]");
  } catch(e) { temes = []; }
  // Leer logros de Firestore
  const logrosDoc = await firebase.firestore().collection('logros').doc(uid).get();
  const logros = logrosDoc.exists ? logrosDoc.data() : {};
  const ul = document.getElementById("temesSeleccionats");
  if (!ul) return;
  ul.innerHTML = temes.map(idx => {
    const temaNom = nomsTemes[parseInt(idx,10)-1];
    // Claves como en temes.js: tema1.teoria, tema1.terminologia...
    const estados = {
      teoria: logros[`tema${idx}.teoria`] || "",
      terminologia: logros[`tema${idx}.terminologia`] || "",
      audicions: logros[`tema${idx}.audicions`] || ""
    };
    // Igual que en temes.js: perfect* -> verde, completat -> amarillo, else gris
    function color(estado) {
      if (estado === "perfecte") return "green";
      if (estado === "completat") return "yellow";
      return "";
    }
    return `<li class="tema-row">
      <span class="tema-nom">${temaNom}</span>
      <span class="stars">
        <span class="star teoria ${color(estados.teoria)}">&#9733;</span>
        <span class="star terminologia ${color(estados.terminologia)}">&#9733;</span>
        <span class="star audicions ${color(estados.audicions)}">&#9733;</span>
      </span>
    </li>`;
  }).join('');
}

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
// Función logout (como en otras páginas)
// =======================
function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "login.html";
  });
}
