const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const API_URL = "http://localhost:3000/api/users"; // URL backend Express

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const mailOrUsername = document.getElementById('mail_username').value.trim();
  const password = document.getElementById('password').value;

  loginMessage.textContent = "Connexion en cours...";
  loginMessage.style.color = "#6366f1";

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mailOrUsername, password })
    });

    if (response.status === 429) {
      document.open();
      document.write(`
    <h1 style="color:#dc2626; text-align:center; margin-top:20vh;">
      Trop de tentatives de connexion<br>
      Veuillez réessayer plus tard.
    </h1>
  `);
      document.close();
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

    loginMessage.textContent = "Connexion réussie ! Redirection...";
    loginMessage.style.color = "#16a34a";

    setTimeout(() => {
      window.location.href = '/';
    }, 1200);

  } catch (err) {
    loginMessage.textContent = err.message || "Erreur de connexion.";
    loginMessage.style.color = "#dc2626";
  }
});
