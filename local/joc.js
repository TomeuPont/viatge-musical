window.addEventListener('DOMContentLoaded', () => {
  initUserInfo();
});

// Música de fondo: guardar y restaurar tiempo
window.addEventListener("DOMContentLoaded", () => {
  const musica = document.getElementById('musicaFondo');
  // Restaurar posición
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
  // Guardar el tiempo cuando sales o recargas
  window.addEventListener('beforeunload', () => {
    if (musica && !musica.paused) {
      localStorage.setItem('musicaFondoTime', musica.currentTime);
    }
  });
});

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

document.addEventListener("DOMContentLoaded", () => {
  if (!temesSeleccionats.length || !modalitatsSeleccionades.length) {
    document.getElementById("qcontainer").innerHTML = `
      <div class="no-questions">
        <p>❗ No s'han seleccionat temes o modalitats.</p>
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
          <p>❗ No hi ha preguntes per aquesta selecció de temes i modalitats.</p>
          <p>Si us plau, torna enrere i selecciona altres opcions.</p>
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

      actual.opcions.forEach((opcio, i) => {
        const boto = document.createElement("button");
        boto.className = "option-button";
        boto.textContent = opcio;
        boto.onclick = () => comprovarResposta(i);
        document.getElementById("opcions").appendChild(boto);
      });

      document.getElementById("nextBtn").style.display = "block";
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

    function seguentPregunta() {
      if (index < preguntesPlanas.length - 1) {
        index++;
        carregarPregunta();
      } else {
        document.getElementById("qcontainer").innerHTML = `
          <h2>Has completat totes les preguntes! 🎉</h2>
          <p>✅ Correctes: ${encerts}</p>
          <p>❌ Incorrectes: ${errors}</p>
          <button class="next-button" onclick="window.location.href='modalitats.html'">Tornar a escollir modalitat</button>
        `;
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
