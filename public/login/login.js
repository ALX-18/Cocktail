// Gestion de la connexion utilisateur avec vérification depuis localStorage
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');
const API_URL = "http://localhost:3000/api/users"; // URL correcte de ton backend Express

loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const mailOrUsername = document.getElementById('mail_username').value.trim();
  const password = document.getElementById('password').value;

  loginMessage.textContent = "Connexion en cours...";
  loginMessage.style.color = "#6366f1";

  try {
    // Requête POST pour login (à adapter selon ton backend)
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mailOrUsername, password })
    });
    if (!response.ok) throw new Error("Identifiants invalides.");
    const user = await response.json();
    // Stocker l'utilisateur connecté (token ou user selon la réponse)
    localStorage.setItem('currentUser', JSON.stringify(user));
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
