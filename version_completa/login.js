// Asegúrate de tener los scripts de Firebase en tu HTML antes de este archivo

// Iniciar sesión
function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'none';

  if (!email || !password) {
    errorDiv.textContent = "Introdueix el correu i la contrasenya.";
    errorDiv.style.display = 'block';
    return;
  }

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "temes.html";
    })
    .catch(error => {
      errorDiv.textContent = tradueixError(error);
      errorDiv.style.display = 'block';
    });
}

// Registrar nuevo usuario
function register() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'none';

  if (!email || !password) {
    errorDiv.textContent = "Introdueix el correu i la contrasenya.";
    errorDiv.style.display = 'block';
    return;
  }
  if (password.length < 6) {
    errorDiv.textContent = "La contrasenya ha de tenir almenys 6 caràcters.";
    errorDiv.style.display = 'block';
    return;
  }

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = "temes.html";
    })
    .catch(error => {
      errorDiv.textContent = tradueixError(error);
      errorDiv.style.display = 'block';
    });
}

// Traduce errores comunes de Firebase a catalán/castellano
function tradueixError(error) {
  if (error.code === "auth/user-not-found") return "No existeix aquest usuari.";
  if (error.code === "auth/wrong-password") return "Contrasenya incorrecta.";
  if (error.code === "auth/email-already-in-use") return "Aquest correu ja està registrat.";
  if (error.code === "auth/invalid-email") return "El correu electrònic no és vàlid.";
  if (error.code === "auth/too-many-requests") return "Massa intents. Espera uns minuts i torna-ho a provar.";
  return "Error: " + (error.message || error.code);
}
