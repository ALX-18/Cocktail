// Gestion de l'inscription utilisateur avec requête API
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');
const API_URL = "http://localhost:3000/api/users"; // URL correcte de ton backend Express

registerForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const mail = document.getElementById('mail').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!mail || !username || !password) {
    registerMessage.textContent = "Veuillez remplir tous les champs.";
    registerMessage.style.color = "#dc2626";
    return;
  }

  registerMessage.textContent = "Création du compte en cours...";
  registerMessage.style.color = "#6366f1";

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: mail, username, password })
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Erreur lors de l'inscription.");
    }
    registerMessage.textContent = "Compte créé avec succès ! Redirection...";
    registerMessage.style.color = "#16a34a";
    setTimeout(() => {
      window.location.href = '/login/login.html';
    }, 1200);
  } catch (err) {
    registerMessage.textContent = err.message || "Erreur lors de l'inscription.";
    registerMessage.style.color = "#dc2626";
  }
});
