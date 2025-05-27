// public/favoritesAndRatings.js
// Gestion des favoris et des ratings côté API (liés à l'utilisateur)

// Utilise la variable API_BASE_URL déjà présente dans app.js

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

// Favoris
async function isFavoriteAPI(cocktailId) {
  const user = getCurrentUser();
  if (!user) return false;
  const res = await fetch(`${API_BASE_URL}/favorites?user_id=${user.id}`);
  const favs = await res.json();
  return favs.some(f => String(f.cocktail_id) === String(cocktailId));
}

async function addFavoriteAPI(cocktailId) {
  const user = getCurrentUser();
  if (!user) return;
  await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id, cocktail_id: cocktailId })
  });
}

async function removeFavoriteAPI(cocktailId) {
  const user = getCurrentUser();
  if (!user) return;
  await fetch(`${API_BASE_URL}/favorites?user_id=${user.id}&cocktail_id=${cocktailId}`, {
    method: 'DELETE'
  });
}

// Ratings
async function getUserRating(cocktailId) {
  const user = getCurrentUser();
  if (!user) return 0;
  const res = await fetch(`${API_BASE_URL}/ratings?user_id=${user.id}`);
  const ratings = await res.json();
  const found = ratings.find(r => r.cocktail_id == cocktailId);
  return found ? found.rating : 0;
}

async function setUserRating(cocktailId, rating, ratingEl) {
  const user = getCurrentUser();
  if (!user) return;
  await fetch(`${API_BASE_URL}/ratings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: user.id, cocktail_id: cocktailId, rating })
  });
  // Mettre à jour l'affichage des étoiles
  const stars = ratingEl.querySelectorAll('i');
  stars.forEach((star, idx) => {
    if (idx < rating) {
      star.classList.remove('ri-star-line');
      star.classList.add('ri-star-fill');
    } else {
      star.classList.remove('ri-star-fill');
      star.classList.add('ri-star-line');
    }
  });
}

// Initialisation dynamique des boutons favoris et ratings
window.initFavoritesAndRatings = async function() {
  document.querySelectorAll('.favorite-btn').forEach(async btn => {
    const id = btn.dataset.id;
    const icon = btn.querySelector('i');
    if (await isFavoriteAPI(id)) {
      icon.classList.remove('ri-heart-line');
      icon.classList.add('ri-heart-fill');
      btn.classList.add('pulse-animation');
    } else {
      icon.classList.remove('ri-heart-fill');
      icon.classList.add('ri-heart-line');
      btn.classList.remove('pulse-animation');
    }
    btn.onclick = () => toggleFavoriteAPI(id, btn);
  });

  document.querySelectorAll('.rating').forEach(async ratingEl => {
    const id = ratingEl.dataset.id;
    const userRating = await getUserRating(id);
    const stars = ratingEl.querySelectorAll('i');
    stars.forEach((star, idx) => {
      if (idx < userRating) {
        star.classList.remove('ri-star-line');
        star.classList.add('ri-star-fill');
      } else {
        star.classList.remove('ri-star-fill');
        star.classList.add('ri-star-line');
      }
      star.onclick = () => setUserRating(id, idx + 1, ratingEl);
    });
  });
};
