// public/favoritesAndRatings.js
// Gestion des favoris et des ratings côté API (liés à l'utilisateur)

// Nouveau système de like/favoris :
// Utilise localStorage pour stocker les favoris côté client (pas de crash DB, instantané)
// Les favoris sont persistants par navigateur/utilisateur

// Récupérer l'utilisateur connecté
function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('currentUser'));
}
function getAuthToken() {
  return sessionStorage.getItem('authToken');
}
// Favoris via API
async function fetchFavorites() {
  const user = getCurrentUser();
  if (!user) return [];
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/favorites?user_id=${user.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) return [];
  return await res.json(); // array of {cocktail_id,...}
}

async function isFavorite(id) {
  const favs = await fetchFavorites();
  return favs.some(f => String(f.cocktail_id) === String(id));
}

async function toggleFavorite(id) {
  const user = getCurrentUser();
  if (!user) return;
  const token = getAuthToken();
  const favs = await fetchFavorites();
  const isFav = favs.some(f => String(f.cocktail_id) === String(id));
  if (isFav) {
    await fetch(`${API_BASE_URL}/favorites?user_id=${user.id}&cocktail_id=${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } else {
    await fetch(`${API_BASE_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ user_id: user.id, cocktail_id: id })
    });
  }
}

// Ratings via API
async function fetchRatings() {
  const user = getCurrentUser();
  if (!user) return {};
  const token = getAuthToken();
  const res = await fetch(`${API_BASE_URL}/ratings?user_id=${user.id}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!res.ok) return {};
  const arr = await res.json(); // [{cocktail_id, rating}]
  const ratings = {};
  arr.forEach(r => { ratings[r.cocktail_id] = r.rating; });
  return ratings;
}

async function getUserRating(cocktailId) {
  const ratings = await fetchRatings();
  return ratings[cocktailId] || 0;
}

async function setUserRating(cocktailId, rating, ratingEl) {
  const user = getCurrentUser();
  if (!user) return;
  const token = getAuthToken();
  await fetch(`${API_BASE_URL}/ratings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ user_id: user.id, cocktail_id: cocktailId, rating })
  });
  // Met à jour l'affichage des étoiles
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
  // Favoris (API)
  const favs = await fetchFavorites();
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const id = btn.dataset.id;
    const icon = btn.querySelector('i');
    const isFav = favs.some(f => String(f.cocktail_id) === String(id));
    if (isFav) {
      icon.classList.remove('ri-heart-line');
      icon.classList.add('ri-heart-fill');
      btn.classList.add('pulse-animation');
    } else {
      icon.classList.remove('ri-heart-fill');
      icon.classList.add('ri-heart-line');
      btn.classList.remove('pulse-animation');
    }
    btn.onclick = async () => {
      await toggleFavorite(id);
      window.initFavoritesAndRatings();
    };
  });

  // Ratings (API)
  const ratings = await fetchRatings();
  document.querySelectorAll('.rating').forEach(ratingEl => {
    const id = ratingEl.dataset.id;
    const userRating = ratings[id] || 0;
    const stars = ratingEl.querySelectorAll('i');
    stars.forEach((star, idx) => {
      if (idx < userRating) {
        star.classList.remove('ri-star-line');
        star.classList.add('ri-star-fill');
      } else {
        star.classList.remove('ri-star-fill');
        star.classList.add('ri-star-line');
      }
      star.onclick = async () => {
        await setUserRating(id, idx + 1, ratingEl);
        window.initFavoritesAndRatings();
      };
    });
  });
};