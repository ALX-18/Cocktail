// Utilitaire pour lire un cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Affiche une liste de cocktails dans un ul donné
function renderCocktailList(ulId, cocktails, extra) {
  const ul = document.getElementById(ulId);
  ul.innerHTML = '';
  if (!cocktails || cocktails.length === 0) {
    ul.innerHTML = '<li>Aucun cocktail</li>';
    return;
  }
  cocktails.forEach(cocktail => {
    let li = document.createElement('li');
    li.className = 'cocktail-card';
    li.innerHTML = `<strong>${cocktail.name}</strong>` + (extra ? ` <span style='color:#888;'>${extra(cocktail)}</span>` : '');
    ul.appendChild(li);
  });
}

async function loadUserProfile() {
  const userId = getCookie('userId');
  if (!userId) {
    window.location.href = '/login';
    return;
  }
  try {
    // Profil de base
    const res = await fetch('/api/user/profile', { credentials: 'include' });
    const user = await res.json();
    if (user.error) throw new Error(user.error);
    document.getElementById('username').textContent = user.username;
    document.getElementById('email').textContent = user.email;

    // Cocktails créés
    const createdRes = await fetch('/api/user/cocktails', { credentials: 'include' });
    const created = await createdRes.json();
    renderCocktailList('created-cocktails', created);

    // Likes
    const likesRes = await fetch('/api/user/likes', { credentials: 'include' });
    const likes = await likesRes.json();
    renderCocktailList('liked-cocktails', likes);

    // Ratings
    const ratingsRes = await fetch('/api/user/ratings', { credentials: 'include' });
    const ratings = await ratingsRes.json();
    renderCocktailList('rated-cocktails', ratings, c => `Note : ${c.rating}/5`);
  } catch (e) {
    alert('Erreur lors du chargement du profil : ' + e.message);
    window.location.href = '/login';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.logout-btn').addEventListener('click', () => {
    document.cookie = 'userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  });
  loadUserProfile();
});
