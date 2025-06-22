window.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
});

// Música de fondo
window.addEventListener("DOMContentLoaded", () => {
  const musica = document.getElementById('musicaFondo');
  const tiempo = parseFloat(localStorage.getItem('musicaFondoTime') || "0");
  if (!isNaN(tiempo) && tiempo > 0) {
    musica.currentTime = tiempo;
  }
  if (localStorage.getItem('musicaFondoON') === 'si') {
    musica.volume = 0.4;
    musica.play().catch(()=>{});
  } else {
    musica.pause();
  }
  window.addEventListener('beforeunload', () => {
    if (musica && !musica.paused) {
      localStorage.setItem('musicaFondoTime', musica.currentTime);
    }
  });
});

function silenciarMusicaFondo() {
  const musica = document.getElementById('musicaFondo');
  if (musica) musica.volume = 0;
}
function restaurarMusicaFondo() {
  const musica = document.getElementById('musicaFondo');
  if (musica && localStorage.getItem('musicaFondoON') === 'si') {
    musica.volume = 0.4;
  }
}

// Mostrar usuario y botón sortir
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

// --- Lógica de preguntas ---
const MODALITAT_ARXIU = {
  "teoria": "preguntes_teoria.json",
  "terminologia": "preguntes_terminologia.json",
  "audicions": "preguntes_audicions.json"
};

let temesSeleccionats = [];
let modalitatsSeleccionades = [];
try {
  temesSeleccionats = JSON.parse(localStorage.getItem('temesSeleccionats') || "[]");
  modalitatsSeleccionades = JSON.parse(localStorage.getItem('modalitatsSeleccionades') || "[]");
} catch(e) {
  temesSeleccionats = [];
  modalitatsSeleccionades = [];
}
temesSeleccionats = temesSeleccionats.map(x => String(x));

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function capitalitza(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}

// --- NUEVO: Comprobar si el tema está completo (3 estrellas verdes en Firestore) ---
async function comprobarTemaCompletadoFirestore(uid, temaId) {
  const userLogrosRef = firebase.firestore().collection('logros').doc(uid);
  const doc = await userLogrosRef.get();
  if (!doc.exists) return;
  const logros = doc.data() || {};
  const temaKey = `tema${temaId}`;
  const temaLogro = logros[temaKey] || {};
  if (
    temaLogro.teoria === "perfecte" &&
    temaLogro.terminologia === "perfecte" &&
    temaLogro.audicions === "perfecte"
  ) {
    window.location.href = "enhorabona.html?tema=" + temaId;
  }
}

// --- NUEVO: Guardar logros en Firestore ---

function guardarLogroFirestore(uid, temaId, modalidad, estado) {
  const userLogrosRef = firebase.firestore().collection('logros').doc(uid);
  const temaKey = `tema${temaId}.${modalidad}`; // dot notation
  userLogrosRef.set({
    [temaKey]: estado
  }, { merge: true }).then(() => {
    // Comprobar si ya tiene las 3 estrelles verdes
    comprobarTemaCompletadoFirestore(uid, temaId);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!temesSeleccionats.length || !modalitatsSeleccionades.length) {
    document.getElementById("qcontainer").innerHTML = `
      <div class="no-questions">
        <p>❗ No s'han seleccionat apartats o modalitats.</p>
        <p>Si us plau, torna a la pàgina anterior i fes la selecció.</p>
      </div>
    `;
    return;
  }

  Promise.all(
    modalitatsSeleccionades
      .map(m => ({modalitat: m, path: MODALITAT_ARXIU[m]}))
      .filter(obj => !!obj.path)
      .map(obj =>
        fetch(obj.path)
          .then(r => {
            if (!r.ok) throw new Error(`Error carregant ${obj.path}`);
            return r.json().then(data => ({modalitat: obj.modalitat, data}));
          })
      )
  )
  .then(results => {
    let preguntesPlanas = [];
    results.forEach(({modalitat, data}) => {
      if (!data.preguntes) return;
      data.preguntes
        .filter(temaObj => temesSeleccionats.includes(String(temaObj.id)))
        .forEach(temaObj => {
          if (Array.isArray(temaObj.preguntes)) {
            temaObj.preguntes.forEach(p => {
              preguntesPlanas.push({
                tema: temaObj.tema,
                temaId: temaObj.id,
                modalitat: data.modalitat || modalitat,
                titol: p.titol,
                pregunta: p.pregunta,
                opcions: p.opcions,
                resposta_correcta: p.resposta_correcta,
                audio: p.audio || null
              });
            });
          }
        });
    });

    if (!preguntesPlanas.length) {
      document.getElementById("qcontainer").innerHTML = `
        <div class="no-questions">
          <p>❗ No hi ha preguntes per aquesta selecció d'apartats i modalitats.</p>
          <p>Si us plau, torna enrere i selecciona altres opcions.</p>
          <button class="boto-rosa" onclick="window.location.href='modalitats.html'">Torna a les modalitats</button>
        </div>
      `;
      return;
    }
    
    shuffleArray(preguntesPlanas);
    preguntesPlanas = preguntesPlanas.map(p => {
      const opcions = [...p.opcions];
      let idxCorrecta = -1;
      if (typeof p.resposta_correcta === "number") {
        idxCorrecta = p.resposta_correcta;
      } else if (typeof p.resposta_correcta === "string") {
        const lletra = p.resposta_correcta.trim().toLowerCase();
        const codis = { a: 0, b: 1, c: 2, d: 3 };
        idxCorrecta = codis[lletra];
      }
      if (idxCorrecta === undefined && !isNaN(p.resposta_correcta)) {
        idxCorrecta = parseInt(p.resposta_correcta, 10);
      }
      if (typeof idxCorrecta !== "number" || idxCorrecta < 0 || idxCorrecta >= opcions.length) {
        idxCorrecta = 0;
      }
      const respostaCorrecta = opcions[idxCorrecta];
      shuffleArray(opcions);
      return {
        tema: p.tema,
        temaId: p.temaId,
        modalitat: p.modalitat,
        titol: p.titol,
        pregunta: p.pregunta,
        opcions: opcions,
        correcta: opcions.indexOf(respostaCorrecta),
        audio: p.audio || null
      };
    });

    let index = 0;
    let encerts = 0;
    let errors = 0;
    let respostaMostrada = false;

    function carregarPregunta() {
      if (!preguntesPlanas[index]) {
        document.getElementById("qcontainer").innerHTML = `
          <div class="no-questions">
            <p>❗ No hi ha més preguntes.</p>
          </div>
        `;
        return;
      }
      const actual = preguntesPlanas[index];
      document.getElementById("modalitat-badge").innerHTML = actual.modalitat ? `<span class="badge">${capitalitza(actual.modalitat)}</span>` : "";
      document.getElementById("tema").textContent = actual.tema || '';
      document.getElementById("pregunta").innerHTML = "Pregunta: " + (actual.pregunta || '');
      if (actual.audio) {
        document.getElementById("pregunta").innerHTML += `<br/><audio controls src="${actual.audio}" style="margin-top:1em"></audio>`;
      }
      document.getElementById("opcions").innerHTML = "";
      document.getElementById("feedback").textContent = "";
      respostaMostrada = false;

      // SILENCIAR O RESTAURAR LA MÚSICA SEGÚN EL TIPO DE PREGUNTA
      const mod = (actual.modalitat || "").toLowerCase();
      if (mod.includes("audicio")) {
        silenciarMusicaFondo();
      } else if (mod.includes("teoria") || mod.includes("terminologia")) {
        restaurarMusicaFondo();
      }

      // Deshabilitar el botón "Següent pregunta" hasta responder
      const nextBtn = document.getElementById("nextBtn");
      nextBtn.disabled = true;
      nextBtn.classList.add("disabled");

      // Mensaje de error si intenta avanzar sin contestar
      const missatgeError = document.createElement("div");
      missatgeError.id = "missatge-error";
      missatgeError.style.display = "none";
      missatgeError.style.color = "#ff4081";
      missatgeError.style.marginTop = "1em";
      document.getElementById("qcontainer").appendChild(missatgeError);

      function mostrarMissatgeError(missatge) {
        missatgeError.textContent = missatge;
        missatgeError.style.display = "block";
      }
      function amagarMissatgeError() {
        missatgeError.textContent = "";
        missatgeError.style.display = "none";
      }

      // Opciones de respuesta
      actual.opcions.forEach((opcio, i) => {
        const boto = document.createElement("button");
        boto.className = "option-button";
        boto.textContent = opcio;
        boto.onclick = () => {
          amagarMissatgeError();
          comprovarResposta(i);
          // Habilita el botón "Següent pregunta" solo cuando se responde
          nextBtn.disabled = false;
          nextBtn.classList.remove("disabled");
        };
        document.getElementById("opcions").appendChild(boto);
      });

      nextBtn.onclick = () => {
        if (!respostaMostrada) {
          mostrarMissatgeError("Has de seleccionar una opció abans de continuar.");
          return;
        }
        seguentPregunta();
        amagarMissatgeError();
      };
      nextBtn.style.display = "block";
    }

    function comprovarResposta(seleccio) {
      if (respostaMostrada) return;
      respostaMostrada = true;
      const correcta = preguntesPlanas[index].correcta;
      const feedback = document.getElementById("feedback");
      if (seleccio === correcta) {
        feedback.textContent = "✅ Correcte!";
        feedback.style.color = "#00ff88";
        encerts++;
      } else {
        feedback.textContent = "❌ Incorrecte. La resposta correcta era: " + preguntesPlanas[index].opcions[correcta];
        feedback.style.color = "#ff8888";
        errors++;
      }
    }

    // --- MODIFICADO: Al terminar todas las preguntas, guardar el logro en Firestore y comprobar enhorabuena ---
    function seguentPregunta() {
      if (index < preguntesPlanas.length - 1) {
        index++;
        carregarPregunta();
      } else {
        const actual = preguntesPlanas[index];
        let estadoModalidad = (errors === 0) ? "perfecte" : "completat";
        // MAPEO para garantizar modalidad estándar
        const modalidadMap = {
          'teoria': 'teoria',
          'Teoria': 'teoria',
          'Treballar contingut teòric': 'teoria',
          'terminologia': 'terminologia',
          'Terminologia': 'terminologia',
          'Treballar terminologia': 'terminologia',
          'audicions': 'audicions',
          'Audicions': 'audicions',
          'Treballar audicions': 'audicions'
        };
        isUserAuthenticated().then(user => {
          if (user && user.uid) {
            let modalidadGuardar = modalidadMap[actual.modalitat] || actual.modalitat;
            guardarLogroFirestore(user.uid, actual.temaId, modalidadGuardar, estadoModalidad);
          }
        });

        document.getElementById("qcontainer").innerHTML = `
          <h2>Has completat totes les preguntes! 🎉</h2>
          <p>✅ Correctes: ${encerts}</p>
          <p>❌ Incorrectes: ${errors}</p>
          <button class="next-button" onclick="window.location.href='modalitats.html'">Tornar a escollir modalitat</button>
        `;
        restaurarMusicaFondo();
      }
    }

    document.getElementById("nextBtn").onclick = seguentPregunta;

    carregarPregunta();
  })
  .catch(err => {
    document.getElementById("qcontainer").innerHTML = `
      <div class="no-questions">
        <p>❗ Error carregant preguntes: ${err.message}</p>
      </div>
    `;
  });
});
