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

// Muestra los temas seleccionados y los logros reales guardados en Firestore
async function mostrarTemesSeleccionatsAmbLogros(uid) {
  let temes = [];
  try {
    temes = JSON.parse(localStorage.getItem('temesSeleccionats') || "[]");
  } catch(e) {}
  // Cargar logros reales del usuario
  let logros = {};
  if (typeof getLogros === "function") {
    logros = await getLogros(uid);
  }
  const estadoMap = {
    perfecte: 'green',
    completat: 'yellow'
  };
  const ul = document.getElementById("temesSeleccionats");
  ul.innerHTML = temes.map(idx => {
    const temaNom = nomsTemes[parseInt(idx,10)-1];
    const logrosTema = logros && logros[`tema${idx}`] ? logros[`tema${idx}`] : {};
    return `<li class="tema-row">
      <span class="tema-nom">${temaNom}</span>
      <span class="stars">
        <span class="star ${estadoMap[logrosTema.teoria] || ''}" title="Teoria">&#9733;</span>
        <span class="star ${estadoMap[logrosTema.terminologia] || ''}" title="Terminologia">&#9733;</span>
        <span class="star ${estadoMap[logrosTema.audicions] || ''}" title="Audicions">&#9733;</span>
      </span>
    </li>`;
  }).join('');
}

// Lógica de autenticación y renderizado
window.addEventListener('DOMContentLoaded', () => {
  if (typeof isUserAuthenticated === "function") {
    isUserAuthenticated().then(user => {
      if (user) {
        mostrarTemesSeleccionatsAmbLogros(user.uid);
      } else {
        window.location.href = "login.html";
      }
    });
  }
});

// Muestra el email/usuario (si tienes función global, úsala)
window.addEventListener('DOMContentLoaded', () => {
  if (typeof mostrarInfoUsuario === "function") mostrarInfoUsuario();
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
