const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const loginBox = document.querySelector('.login-box');
const submitBtn = loginForm.querySelector('input[type="submit"]');
const API_URL = "/api/users"; // Utilise le chemin relatif pour compatibilité prod/dev

// Animation fade-in sur la boîte au chargement
window.addEventListener('DOMContentLoaded', () => {
  loginBox.classList.add('fade-in');
});

function showLoader() {
  submitBtn.disabled = true;
  submitBtn.value = '';
  submitBtn.classList.add('loading');
  submitBtn.insertAdjacentHTML('afterbegin', '<span class="loader"></span>');
}
function hideLoader() {
  submitBtn.disabled = false;
  submitBtn.value = 'Se connecter';
  submitBtn.classList.remove('loading');
  const loader = submitBtn.querySelector('.loader');
  if (loader) loader.remove();
}

function showMessage(msg, type = 'info') {
  loginMessage.innerHTML = '';
  let icon = '';
  if (type === 'success') icon = '<i class="ri-checkbox-circle-fill text-green-500"></i> ';
  if (type === 'error') icon = '<i class="ri-close-circle-fill text-red-500"></i> ';
  if (type === 'info') icon = '<i class="ri-loader-4-line animate-spin text-indigo-500"></i> ';
  loginMessage.innerHTML = icon + msg;
  loginMessage.className = 'text-center mt-2 text-sm login-message-' + type;
}

function shakeBox() {
  loginBox.classList.remove('shake');
  void loginBox.offsetWidth; // trigger reflow
  loginBox.classList.add('shake');
}

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const mailOrUsername = document.getElementById('mail_username').value.trim();
  const password = document.getElementById('password').value;

  showMessage('Connexion en cours...', 'info');
  showLoader();

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mailOrUsername, password })
    });

    if (response.status === 429) {
      // Afficher un message d’erreur au lieu de document.write
      loginMessage.innerHTML = `
        <h1 style="color:#dc2626; text-align:center; margin-top:20vh;">
          Trop de tentatives de connexion<br>
          Veuillez réessayer plus tard.
        </h1>
      `;
      return;
    }

    if (!response.ok) throw new Error("Identifiants invalides.");

    const data = await response.json();
    console.log("Réponse login backend :", data);

    const { token, user } = data;

    if (!token) throw new Error("Aucun token reçu.");

    // Stocker le token JWT dans sessionStorage
    sessionStorage.setItem('authToken', token);

    // Stocker les infos utilisateur (sans mot de passe)
    sessionStorage.setItem('currentUser', JSON.stringify(user));

     showMessage('Connexion réussie ! Redirection...', 'success');
    hideLoader();


    setTimeout(() => {
      window.location.href = '/';
    }, 1200);

  } catch (err) {
    showMessage(err.message || "Erreur de connexion.", 'error');
    hideLoader();
    shakeBox();
  }
});

// Animation shake pour feedback visuel
const style = document.createElement('style');
style.innerHTML = `
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
  100% { transform: translateX(0); }
}`;
document.head.appendChild(style);
