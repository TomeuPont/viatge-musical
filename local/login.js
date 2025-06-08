// Muestra usuario modular si está logueado (normalmente en login estará oculto)
window.addEventListener('DOMContentLoaded', () => {
  if (typeof initUserInfo === "function") initUserInfo();
});

// Login tradicional
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');
  errorDiv.style.display = 'none';
  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
    window.location.href = 'temes.html';
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
});

// Login con Google
document.getElementById('googleLogin').addEventListener('click', async function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  const errorDiv = document.getElementById('loginError');
  errorDiv.style.display = 'none';
  try {
    await firebase.auth().signInWithPopup(provider);
    window.location.href = 'temes.html';
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
});

// Música de fondo
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
