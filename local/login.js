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
  // Mostrar email usuario arriba a la derecha (con Firebase)
  if (typeof mostrarInfoUsuario === "function") mostrarInfoUsuario();
  else if (window.firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged(function(user) {
      const div = document.getElementById('userEmail');
      if (user && user.email) {
        div.textContent = user.email;
        div.style.display = 'block';
      } else {
        div.style.display = 'none';
      }
    });
  }
});

function login() {
  const musica = document.getElementById('musicaFondo');
  if (musica && !musica.paused) {
    localStorage.setItem('musicaFondoTime', musica.currentTime);
  }
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'none';

  if (!email || !password) {
    errorDiv.textContent = 'Introdueix un correu i una contrasenya.';
    errorDiv.style.display = 'block';
    return;
  }
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "temes.html";
    })
    .catch(err => {
      console.log('Firebase code:', err.code, 'message:', err.message); // para depurar
      if (err.code === "auth/user-not-found") {
        errorDiv.textContent = "Aquest usuari no està registrat. Si us plau, comprova el correu o registra't.";
      } else if (err.code === "auth/wrong-password") {
        errorDiv.textContent = "Contrasenya incorrecta. Torna-ho a intentar.";
      } else if (err.code === "auth/invalid-email") {
        errorDiv.textContent = "El correu no té un format vàlid.";
      } else if (err.code === "auth/too-many-requests") {
        errorDiv.textContent = "Has fet massa intents. Espera uns segons i torna-ho a provar.";
      } else if (err.code === "auth/invalid-credential") {
        errorDiv.textContent = "Les credencials són incorrectes o han caducat. Torna a introduir el correu i la contrasenya.";
      } else {
        errorDiv.textContent = err.message;
      }
      errorDiv.style.display = 'block';
    });
}

function register() {
  const musica = document.getElementById('musicaFondo');
  if (musica && !musica.paused) {
    localStorage.setItem('musicaFondoTime', musica.currentTime);
  }
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'none';

  if (!email || !password) {
    errorDiv.textContent = 'Introdueix un correu i una contrasenya.';
    errorDiv.style.display = 'block';
    return;
  }
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "temes.html";
    })
    .catch(err => {
      console.log('Firebase code:', err.code, 'message:', err.message); // para depurar
      if (err.code === "auth/email-already-in-use") {
        errorDiv.textContent = "Aquest correu ja està registrat. Intenta iniciar sessió o utilitza un altre correu.";
      } else if (err.code === "auth/invalid-email") {
        errorDiv.textContent = "El correu no té un format vàlid.";
      } else if (err.code === "auth/weak-password") {
        errorDiv.textContent = "La contrasenya ha de tenir almenys 6 caràcters.";
      } else if (err.code === "auth/invalid-credential") {
        errorDiv.textContent = "Les credencials són incorrectes o han caducat. Torna a introduir el correu i la contrasenya.";
      } else {
        errorDiv.textContent = err.message;
      }
      errorDiv.style.display = 'block';
    });
}